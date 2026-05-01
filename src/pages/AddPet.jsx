import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PawPrint, Camera, ChevronLeft, ChevronRight,
  Dog, Cat, Bird, Rabbit, Fish,
  Calendar, Hash, Heart, FileText,
  Loader2, CheckCircle2, AlertCircle, Upload, X
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

// ─── Colores ──────────────────────────────────────────────────────────────────
const C = {
  teal: '#1D9E75', tealLight: '#E1F5EE', tealMid: '#5DCAA5',
  orange: '#E07B3F', orangeLight: '#FDEEDE',
  slate: '#3D4E4B', slateDark: '#2C3836',
  gray: '#7A8A87', grayBg: '#F4F6F5', white: '#FFFFFF',
  red: '#E24B4A', redLight: '#FCEBEB',
  border: '#DDE6E2',
}

// ─── Validación con Zod ───────────────────────────────────────────────────────
const petSchema = z.object({
  name:               z.string().min(1, 'El nombre es obligatorio').max(50),
  animal_type:        z.string().min(1, 'Selecciona un tipo de animal'),
  breed:              z.string().max(60).optional(),
  birth_date:         z.string().optional(),
  chip_number:        z.string().max(20).optional(),
  medical_conditions: z.string().max(500).optional(),
  surgeries:          z.string().max(500).optional(),
  deworming:          z.string().max(300).optional(),
  additional_notes:   z.string().max(500).optional(),
})

// ─── Tipos de animales ────────────────────────────────────────────────────────
const ANIMAL_TYPES = [
  { value: 'dog',    label: 'Perro',    Icon: Dog   },
  { value: 'cat',    label: 'Gato',     Icon: Cat   },
  { value: 'bird',   label: 'Pájaro',   Icon: Bird  },
  { value: 'rabbit', label: 'Conejo',   Icon: Rabbit },
  { value: 'fish',   label: 'Pez',      Icon: Fish  },
  { value: 'other',  label: 'Otro',     Icon: PawPrint },
]

// ─── Pasos del formulario ─────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Datos básicos',  icon: PawPrint },
  { id: 2, label: 'Salud',          icon: Heart    },
  { id: 3, label: 'Documentos',     icon: FileText },
]

// ─── Componente Field ─────────────────────────────────────────────────────────
function Field({ label, error, hint, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: C.slate, display: 'block', marginBottom: 6 }}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: C.gray, marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontSize: 12, color: C.red, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertCircle size={12} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Input estilo ─────────────────────────────────────────────────────────────
const inputStyle = (hasError) => ({
  width: '100%', padding: '11px 14px',
  border: `1.5px solid ${hasError ? C.red : C.border}`,
  borderRadius: 10, fontSize: 14, color: C.slateDark,
  outline: 'none', background: hasError ? C.redLight : C.white,
  transition: 'all 0.18s', boxSizing: 'border-box',
  fontFamily: 'inherit',
})

const textareaStyle = (hasError) => ({
  ...inputStyle(hasError),
  resize: 'vertical', minHeight: 90, lineHeight: 1.6,
})

// ─── Componente principal ─────────────────────────────────────────────────────
export default function AddPet() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [step, setStep]           = useState(1)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')
  const [success, setSuccess]     = useState(false)
  const fileInputRef = useRef()

  const { register, handleSubmit, watch, setValue, trigger,
          formState: { errors } } = useForm({
    resolver: zodResolver(petSchema),
    mode: 'onChange',
  })

  const selectedType = watch('animal_type')

  // ── Seleccionar foto ────────────────────────────────────────────────────────
  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setSaveError('La foto no puede superar 5 MB'); return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  // ── Avanzar paso (valida solo los campos del paso actual) ───────────────────
  const nextStep = async () => {
    const fieldsStep1 = ['name', 'animal_type']
    const ok = step === 1 ? await trigger(fieldsStep1) : true
    if (ok) setStep(s => s + 1)
  }

  // ── Subir foto a Supabase Storage ───────────────────────────────────────────
  const uploadPhoto = async (petId) => {
    if (!photoFile) return null
    const ext  = photoFile.name.split('.').pop()
    const path = `${user.id}/${petId}.${ext}`   // carpeta = uid del usuario

    const { error } = await supabase.storage
      .from('pets')
      .upload(path, photoFile, { upsert: true })

    if (error) throw new Error('Error al subir la foto: ' + error.message)

    const { data } = supabase.storage.from('pets').getPublicUrl(path)
    return data.publicUrl
  }

  // ── Guardar mascota ─────────────────────────────────────────────────────────
  const onSubmit = async (formData) => {
    setSaving(true)
    setSaveError('')
    try {
      // 1. Insertar la mascota (sin foto aún, para obtener el id)
      const { data: pet, error: insertError } = await supabase
        .from('pets')
        .insert({
          user_id:            user.id,
          name:               formData.name.trim(),
          animal_type:        formData.animal_type,
          breed:              formData.breed?.trim()              || null,
          birth_date:        formData.birth_date              || null,
          chip_number:        formData.chip_number?.trim()        || null,
          medical_conditions: formData.medical_conditions?.trim() || null,
          surgeries:          formData.surgeries?.trim()          || null,
          deworming:          formData.deworming?.trim()          || null,
          additional_notes:   formData.additional_notes?.trim()   || null,
        })
        .select()
        .single()

      if (insertError) throw new Error(insertError.message)

      // 2. Subir foto si hay y actualizar photo_url
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

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  // Pantalla de éxito
  if (success) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 250 }}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: C.tealLight, margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={42} color={C.teal} />
          </motion.div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.slateDark, marginBottom: 8 }}>
            ¡Mascota añadida! 🎉
          </h2>
          <p style={{ color: C.gray, fontSize: 14 }}>Volviendo al dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '28px 28px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}
        >
          <motion.button
            whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: C.white, border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: C.slate,
            }}
          >
            <ChevronLeft size={18} />
          </motion.button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.slateDark, margin: 0 }}>
              Añadir mascota
            </h1>
            <p style={{ fontSize: 13, color: C.gray, margin: 0 }}>
              Rellena los datos de tu nuevo compañero
            </p>
          </div>
        </motion.div>

        {/* ── Stepper ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}
        >
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: step >= s.id ? C.teal : '#E8EDEB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.3s',
                }}>
                  {step > s.id
                    ? <CheckCircle2 size={16} color="white" />
                    : <s.icon size={15} color={step >= s.id ? 'white' : C.gray} />
                  }
                </div>
                <span style={{
                  fontSize: 13, fontWeight: step === s.id ? 600 : 400,
                  color: step >= s.id ? C.slateDark : C.gray,
                  display: window.innerWidth < 500 ? 'none' : 'block',
                }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2, margin: '0 12px',
                  background: step > s.id ? C.teal : '#E8EDEB',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          ))}
        </motion.div>

        {/* ── Card del formulario ─────────────────────────────────── */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3 }}
          style={{
            background: C.white, borderRadius: 20,
            padding: '32px 36px', border: `1px solid #EEF2F0`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >

          {/* ── PASO 1: Datos básicos ──────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.slateDark, marginBottom: 24 }}>
                Datos básicos
              </h2>

              {/* Foto */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                <div style={{ position: 'relative' }}>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: 100, height: 100, borderRadius: '50%',
                      background: photoPreview ? 'transparent' : C.tealLight,
                      border: `2px dashed ${C.tealMid}`,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', overflow: 'hidden',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    {photoPreview
                      ? <img src={photoPreview} alt="preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <>
                          <Camera size={24} color={C.teal} />
                          <span style={{ fontSize: 10, color: C.teal, marginTop: 4, fontWeight: 600 }}>
                            Foto
                          </span>
                        </>
                    }
                  </div>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                      style={{
                        position: 'absolute', top: 0, right: 0,
                        width: 22, height: 22, borderRadius: '50%',
                        background: C.red, border: '2px solid white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'white',
                      }}
                    >
                      <X size={11} />
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*"
                    onChange={handlePhoto} style={{ display: 'none' }} />
                </div>
              </div>

              {/* Nombre */}
              <Field label="Nombre *" error={errors.name?.message}>
                <input {...register('name')} type="text" placeholder="Ej: Luna"
                  style={inputStyle(!!errors.name)}
                  onFocus={e => { e.target.style.borderColor = C.teal; e.target.style.boxShadow = `0 0 0 3px ${C.tealLight}` }}
                  onBlur={e  => { e.target.style.borderColor = errors.name ? C.red : C.border; e.target.style.boxShadow = 'none' }}
                />
              </Field>

              {/* Tipo de animal */}
              <Field label="Tipo de animal *" error={errors.animal_type?.message}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {ANIMAL_TYPES.map(({ value, label, Icon }) => (
                    <motion.button
                      key={value} type="button"
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setValue('animal_type', value, { shouldValidate: true })}
                      style={{
                        padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
                        border: `2px solid ${selectedType === value ? C.teal : C.border}`,
                        background: selectedType === value ? C.tealLight : C.white,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 6,
                        transition: 'all 0.18s',
                      }}
                    >
                      <Icon size={22} color={selectedType === value ? C.teal : C.gray} />
                      <span style={{ fontSize: 12, fontWeight: 600,
                        color: selectedType === value ? C.teal : C.slate }}>
                        {label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </Field>

              {/* Raza */}
              <Field label="Raza" hint="(opcional)">
                <input {...register('breed')} type="text" placeholder="Ej: Golden Retriever"
                  style={inputStyle(false)}
                  onFocus={e => { e.target.style.borderColor = C.teal; e.target.style.boxShadow = `0 0 0 3px ${C.tealLight}` }}
                  onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }}
                />
              </Field>

              {/* Fecha de nacimiento y chip */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Fecha de nacimiento" hint="(aprox.)">
                  <div style={{ position: 'relative' }}>
                    <Calendar size={15} color={C.gray} style={{
                      position: 'absolute', left: 12, top: '50%',
                      transform: 'translateY(-50%)', pointerEvents: 'none',
                    }} />
                    <input {...register('birth_date')} type="date"
                      style={{ ...inputStyle(false), paddingLeft: 36 }}
                      onFocus={e => { e.target.style.borderColor = C.teal; e.target.style.boxShadow = `0 0 0 3px ${C.tealLight}` }}
                      onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                </Field>
                <Field label="Nº de chip" hint="(opcional)">
                  <div style={{ position: 'relative' }}>
                    <Hash size={15} color={C.gray} style={{
                      position: 'absolute', left: 12, top: '50%',
                      transform: 'translateY(-50%)', pointerEvents: 'none',
                    }} />
                    <input {...register('chip_number')} type="text" placeholder="123456789"
                      style={{ ...inputStyle(false), paddingLeft: 36 }}
                      onFocus={e => { e.target.style.borderColor = C.teal; e.target.style.boxShadow = `0 0 0 3px ${C.tealLight}` }}
                      onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* ── PASO 2: Salud ──────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.slateDark, marginBottom: 24 }}>
                Información médica
              </h2>

              <Field label="Condiciones médicas" hint="(alergias, enfermedades crónicas...)">
                <textarea {...register('medical_conditions')}
                  placeholder="Ej: Alérgico al pollo, hipotiroidismo diagnosticado en 2023..."
                  style={textareaStyle(false)}
                  onFocus={e => { e.target.style.borderColor = C.teal; e.target.style.boxShadow = `0 0 0 3px ${C.tealLight}` }}
                  onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }}
                />
              </Field>

              <Field label="Cirugías" hint="(intervenciones anteriores)">
                <textarea {...register('surgeries')}
                  placeholder="Ej: Esterilización (Marzo 2022), extracción pieza dental (2023)..."
                  style={textareaStyle(false)}
                  onFocus={e => { e.target.style.borderColor = C.teal; e.target.style.boxShadow = `0 0 0 3px ${C.tealLight}` }}
                  onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }}
                />
              </Field>

              <Field label="Desparasitación" hint="(última y periodicidad)">
                <textarea {...register('deworming')}
                  placeholder="Ej: Última interna: Enero 2024 (Milbemax). Externa: cada 3 meses (Frontline)..."
                  style={{ ...textareaStyle(false), minHeight: 72 }}
                  onFocus={e => { e.target.style.borderColor = C.teal; e.target.style.boxShadow = `0 0 0 3px ${C.tealLight}` }}
                  onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }}
                />
              </Field>
            </div>
          )}

          {/* ── PASO 3: Documentos y notas ────────────────────────── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.slateDark, marginBottom: 24 }}>
                Notas adicionales
              </h2>

              <Field label="Notas adicionales" hint="(cualquier info que quieras recordar)">
                <textarea {...register('additional_notes')}
                  placeholder="Ej: Le da miedo el trueno, come 2 veces al día, le gusta el juguete azul..."
                  style={{ ...textareaStyle(false), minHeight: 120 }}
                  onFocus={e => { e.target.style.borderColor = C.teal; e.target.style.boxShadow = `0 0 0 3px ${C.tealLight}` }}
                  onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }}
                />
              </Field>

              {/* Info sobre documentos */}
              <div style={{
                background: C.tealLight, borderRadius: 12,
                padding: '14px 16px', border: `1px solid ${C.tealMid}40`,
                display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8,
              }}>
                <Upload size={18} color={C.teal} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.teal, margin: '0 0 2px' }}>
                    Documentos veterinarios
                  </p>
                  <p style={{ fontSize: 12, color: C.slate, margin: 0, lineHeight: 1.6 }}>
                    Podrás subir analíticas, informes y radiografías desde la ficha de la mascota una vez creada.
                  </p>
                </div>
              </div>

              {/* Resumen */}
              <div style={{
                background: C.grayBg, borderRadius: 12,
                padding: '14px 16px', marginTop: 16,
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.gray,
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  Resumen
                </p>
                {[
                  { label: 'Nombre',  value: watch('name')        },
                  { label: 'Animal',  value: watch('animal_type') },
                  { label: 'Raza',    value: watch('breed')       },
                  { label: 'Foto',    value: photoFile ? '✅ Añadida' : '—' },
                ].map(({ label, value }) => value ? (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between',
                    fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: C.gray }}>{label}</span>
                    <span style={{ fontWeight: 600, color: C.slateDark }}>{value}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          )}

          {/* ── Error global ───────────────────────────────────────── */}
          <AnimatePresence>
            {saveError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: C.redLight, border: `1px solid ${C.red}33`,
                  borderRadius: 10, padding: '10px 14px', marginTop: 16,
                  fontSize: 13, color: C.red,
                }}
              >
                <AlertCircle size={15} color={C.red} /> {saveError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Botones de navegación ──────────────────────────────── */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginTop: 28, paddingTop: 20,
            borderTop: `1px solid #F0F4F2`,
          }}>
            {step > 1 ? (
              <motion.button type="button" whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => setStep(s => s - 1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
                  border: `1.5px solid ${C.border}`, background: C.white,
                  fontSize: 14, fontWeight: 600, color: C.slate,
                }}
              >
                <ChevronLeft size={16} /> Anterior
              </motion.button>
            ) : <div />}

            {step < STEPS.length ? (
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={nextStep}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 22px', borderRadius: 10, cursor: 'pointer',
                  border: 'none', background: C.teal,
                  fontSize: 14, fontWeight: 700, color: 'white',
                  boxShadow: '0 4px 14px rgba(29,158,117,0.30)',
                }}
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
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 24px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer',
                  border: 'none', background: saving ? C.tealMid : C.teal,
                  fontSize: 14, fontWeight: 700, color: 'white',
                  boxShadow: saving ? 'none' : '0 4px 16px rgba(29,158,117,0.35)',
                  transition: 'background 0.2s',
                }}
              >
                {saving
                  ? <><Loader2 size={17} style={{ animation: 'spin 0.8s linear infinite' }} /> Guardando...</>
                  : <><PawPrint size={17} /> Guardar mascota</>
                }
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
