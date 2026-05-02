import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PawPrint, Camera, ChevronLeft, ChevronRight,
  Calendar, Hash, Heart, FileText,
  Loader2, CheckCircle2, AlertCircle, Upload, X,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { ANIMAL_TYPE_OPTIONS, SEX_OPTIONS } from '../utils/petMaps'
import './AddPet.css'

// ─── Validación Zod ───────────────────────────────────────────────────────────
const ANIMAL_VALUES = ANIMAL_TYPE_OPTIONS.map(o => o.value)
const SEX_VALUES    = SEX_OPTIONS.map(o => o.value)

const petSchema = z.object({
  name:               z.string().min(1, 'El nombre es obligatorio').max(50),
  animal_type:        z.enum(ANIMAL_VALUES, { errorMap: () => ({ message: 'Selecciona el tipo de animal' }) }),
  sex:                z.enum(SEX_VALUES,    { errorMap: () => ({ message: 'Selecciona el sexo' }) }),
  breed:              z.string().max(60).optional(),
  birth_date:         z.string().optional(),
  chip_number:        z.string().max(20).optional(),
  medical_conditions: z.string().max(500).optional(),
  surgeries:          z.string().max(500).optional(),
  deworming:          z.string().max(300).optional(),
  additional_notes:   z.string().max(500).optional(),
})

// ─── Pasos ────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Datos básicos', Icon: PawPrint },
  { id: 2, label: 'Salud',         Icon: Heart    },
  { id: 3, label: 'Notas',         Icon: FileText },
]

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, hint, error, children }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--slate)' }}>
        {label}
        {hint && <span className="font-normal ml-1.5" style={{ color: 'var(--gray)' }}>{hint}</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-1 mt-1 text-xs"
            style={{ color: 'var(--red)' }}
          >
            <AlertCircle size={11} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function AddPet() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [step, setStep]                 = useState(1)
  const [photoFile, setPhotoFile]       = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving]             = useState(false)
  const [saveError, setSaveError]       = useState('')
  const [success, setSuccess]           = useState(false)
  const fileInputRef = useRef()

  const { register, handleSubmit, watch, setValue, trigger,
          formState: { errors } } = useForm({
    resolver: zodResolver(petSchema),
    mode: 'onChange',
  })

  const selectedSex = watch('sex')

  // ── Foto ────────────────────────────────────────────────────────────────────
  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setSaveError('La foto no puede superar 5 MB')
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  // ── Siguiente paso ──────────────────────────────────────────────────────────
  const nextStep = async () => {
    const fieldsStep1 = ['name', 'animal_type', 'sex']
    const ok = step === 1 ? await trigger(fieldsStep1) : true
    if (ok) setStep(s => s + 1)
  }

  // ── Subir foto ──────────────────────────────────────────────────────────────
  const uploadPhoto = async (petId) => {
    if (!photoFile) return null
    const ext  = photoFile.name.split('.').pop()
    const path = `${user.id}/${petId}.${ext}`
    const { error } = await supabase.storage
      .from('pets')
      .upload(path, photoFile, { upsert: true })
    if (error) throw new Error('Error al subir la foto: ' + error.message)
    const { data } = supabase.storage.from('pets').getPublicUrl(path)
    return data.publicUrl
  }

  // ── Guardar ─────────────────────────────────────────────────────────────────
  const onSubmit = async (formData) => {
    setSaving(true)
    setSaveError('')
    try {
      const { data: pet, error: insertError } = await supabase
        .from('pets')
        .insert({
          user_id:            user.id,
          name:               formData.name.trim(),
          animal_type:        formData.animal_type,
          sex:                formData.sex,
          breed:              formData.breed?.trim()              || null,
          birth_date:         formData.birth_date                 || null,
          chip_number:        formData.chip_number?.trim()        || null,
          medical_conditions: formData.medical_conditions?.trim() || null,
          surgeries_notes:    formData.surgeries?.trim()          || null,
          deworming_notes:    formData.deworming?.trim()          || null,
          additional_notes:   formData.additional_notes?.trim()   || null,
        })
        .select()
        .single()

      if (insertError) throw new Error(insertError.message)

      if (photoFile) {
        const photoUrl = await uploadPhoto(pet.id)
        await supabase.from('pets').update({ photo_url: photoUrl }).eq('id', pet.id)
      }

      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1800)

    } catch (err) {
      setSaveError(err.message || 'Error al guardar la mascota')
    } finally {
      setSaving(false)
    }
  }

  // ── Pantalla éxito ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 250 }}
            className="success-icon"
          >
            <CheckCircle2 size={42} color="var(--teal)" />
          </motion.div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--slate-dark)' }}>
            ¡Mascota añadida! 🎉
          </h2>
          <p className="text-sm" style={{ color: 'var(--gray)' }}>Volviendo al dashboard...</p>
        </motion.div>
      </div>
    )
  }

  // ── Render principal ────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-auto p-7">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-7"
        >
          <motion.button
            whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
            style={{ background: 'var(--white)', border: '1px solid var(--border)', color: 'var(--slate)' }}
          >
            <ChevronLeft size={18} />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold m-0" style={{ color: 'var(--slate-dark)' }}>
              Añadir mascota
            </h1>
            <p className="text-xs m-0" style={{ color: 'var(--gray)' }}>
              Rellena los datos de tu nuevo compañero
            </p>
          </div>
        </motion.div>

        {/* Stepper */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex items-center mb-7"
        >
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`step-circle ${step >= s.id ? 'active' : ''}`}>
                  {step > s.id
                    ? <CheckCircle2 size={16} color="white" />
                    : <s.Icon size={15} color={step >= s.id ? 'white' : 'var(--gray)'} />
                  }
                </div>
                <span
                  className="text-sm hidden sm:block"
                  style={{
                    fontWeight: step === s.id ? 600 : 400,
                    color: step >= s.id ? 'var(--slate-dark)' : 'var(--gray)',
                  }}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`step-line ${step > s.id ? 'done' : ''}`} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.28 }}
          className="pet-card"
        >

          {/* ── PASO 1: Datos básicos ─────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 className="text-base font-bold mb-6" style={{ color: 'var(--slate-dark)' }}>
                Datos básicos
              </h2>

              {/* Foto */}
              <div className="flex justify-center mb-7">
                <div className="relative">
                  <div className="photo-circle" onClick={() => fileInputRef.current?.click()}>
                    {photoPreview
                      ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                      : <>
                          <Camera size={24} color="var(--teal)" />
                          <span className="text-xs mt-1 font-semibold" style={{ color: 'var(--teal)' }}>
                            Foto
                          </span>
                        </>
                    }
                  </div>
                  {photoPreview && (
                    <button
                      type="button"
                      className="photo-delete"
                      onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                    >
                      <X size={11} />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Nombre */}
              <Field label="Nombre *" error={errors.name?.message}>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Ej: Luna"
                  className={`pet-input ${errors.name ? 'error' : ''}`}
                />
              </Field>

              {/* Tipo de animal — dropdown */}
              <Field label="Tipo de animal *" error={errors.animal_type?.message}>
                <select
                  {...register('animal_type')}
                  className={`pet-input ${errors.animal_type ? 'error' : ''}`}
                  defaultValue=""
                >
                  <option value="" disabled>Selecciona un tipo...</option>
                  {ANIMAL_TYPE_OPTIONS.map(({ value, label, emoji }) => (
                    <option key={value} value={value}>
                      {emoji} {label}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Sexo */}
              <Field label="Sexo *" error={errors.sex?.message}>
                <div className="grid grid-cols-2 gap-3">
                  {SEX_OPTIONS.map(({ value, label, symbol }) => (
                    <motion.button
                      key={value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setValue('sex', value, { shouldValidate: true })}
                      className={`sex-btn ${selectedSex === value ? 'selected' : ''}`}
                    >
                      <span className="text-lg">{symbol}</span>
                      {label}
                    </motion.button>
                  ))}
                </div>
              </Field>

              {/* Raza */}
              <Field label="Raza" hint="(opcional)">
                <input
                  {...register('breed')}
                  type="text"
                  placeholder="Ej: Golden Retriever"
                  className="pet-input"
                />
              </Field>

              {/* Fecha nacimiento + Chip */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Fecha de nacimiento" hint="(aprox.)">
                  <div className="relative">
                    <Calendar
                      size={15}
                      color="var(--gray)"
                      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                    <input
                      {...register('birth_date')}
                      type="date"
                      className="pet-input pet-input-icon"
                    />
                  </div>
                </Field>
                <Field label="Nº de chip" hint="(opcional)">
                  <div className="relative">
                    <Hash
                      size={15}
                      color="var(--gray)"
                      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                    <input
                      {...register('chip_number')}
                      type="text"
                      placeholder="123456789"
                      className="pet-input pet-input-icon"
                    />
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* ── PASO 2: Salud ─────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 className="text-base font-bold mb-6" style={{ color: 'var(--slate-dark)' }}>
                Información médica
              </h2>

              <Field label="Condiciones médicas" hint="(alergias, enfermedades crónicas...)">
                <textarea
                  {...register('medical_conditions')}
                  placeholder="Ej: Alérgico al pollo, hipotiroidismo diagnosticado en 2023..."
                  className="pet-input"
                />
              </Field>

              <Field label="Cirugías" hint="(intervenciones anteriores)">
                <textarea
                  {...register('surgeries')}
                  placeholder="Ej: Esterilización (Marzo 2022), extracción pieza dental (2023)..."
                  className="pet-input"
                />
              </Field>

              <Field label="Desparasitación" hint="(última y periodicidad)">
                <textarea
                  {...register('deworming')}
                  placeholder="Ej: Última interna: Enero 2024. Externa: cada 3 meses..."
                  className="pet-input"
                  style={{ minHeight: 72 }}
                />
              </Field>
            </div>
          )}

          {/* ── PASO 3: Notas ─────────────────────────────────────── */}
          {step === 3 && (
            <div>
              <h2 className="text-base font-bold mb-6" style={{ color: 'var(--slate-dark)' }}>
                Notas adicionales
              </h2>

              <Field label="Notas" hint="(cualquier info que quieras recordar)">
                <textarea
                  {...register('additional_notes')}
                  placeholder="Ej: Le da miedo el trueno, come 2 veces al día..."
                  className="pet-input"
                  style={{ minHeight: 120 }}
                />
              </Field>

              {/* Info documentos */}
              <div className="info-box mb-4">
                <Upload size={18} color="var(--teal)" className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold m-0 mb-0.5" style={{ color: 'var(--teal)' }}>
                    Documentos veterinarios
                  </p>
                  <p className="text-xs m-0 leading-relaxed" style={{ color: 'var(--slate)' }}>
                    Podrás subir analíticas, informes y radiografías desde la ficha de la mascota una vez creada.
                  </p>
                </div>
              </div>

              {/* Resumen */}
              <div className="summary-box">
                <p className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--gray)' }}>
                  Resumen
                </p>
                {[
                  { label: 'Nombre',  value: watch('name') },
                  { label: 'Animal',  value: ANIMAL_TYPE_OPTIONS.find(o => o.value === watch('animal_type'))?.label },
                  { label: 'Sexo',    value: SEX_OPTIONS.find(o => o.value === watch('sex'))?.label },
                  { label: 'Raza',    value: watch('breed') },
                  { label: 'Foto',    value: photoFile ? '✅ Añadida' : '' },
                ].filter(r => r.value).map(({ label, value }) => (
                  <div key={label} className="summary-row">
                    <span style={{ color: 'var(--gray)' }}>{label}</span>
                    <span className="font-semibold" style={{ color: 'var(--slate-dark)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error global */}
          <AnimatePresence>
            {saveError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="error-banner"
              >
                <AlertCircle size={15} color="var(--red)" /> {saveError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navegación */}
          <div
            className="flex justify-between items-center mt-7 pt-5"
            style={{ borderTop: '1px solid #F0F4F2' }}
          >
            {step > 1 ? (
              <motion.button
                type="button"
                whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => setStep(s => s - 1)}
                className="btn-prev"
              >
                <ChevronLeft size={16} /> Anterior
              </motion.button>
            ) : <div />}

            {step < STEPS.length ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={nextStep}
                className="btn-next"
              >
                Siguiente <ChevronRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.97 }}
                onClick={handleSubmit(onSubmit)}
                className="btn-save"
              >
                {saving
                  ? <><Loader2 size={17} className="spinning" /> Guardando...</>
                  : <><PawPrint size={17} /> Guardar mascota</>
                }
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}