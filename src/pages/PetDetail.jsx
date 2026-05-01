import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, PawPrint, Dog, Cat, Bird, Rabbit, Fish,
  Heart, FileText, Edit, Trash2, Loader2, AlertCircle,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import './PetDetail.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ANIMAL_ICONS = { dog: Dog, cat: Cat, bird: Bird, rabbit: Rabbit, fish: Fish }

const TABS = [
  { id: 'basic',  label: 'Datos', Icon: PawPrint  },
  { id: 'health', label: 'Salud', Icon: Heart     },
  { id: 'docs',   label: 'Docs',  Icon: FileText  },
]

function calcAge(birthDate) {
  if (!birthDate) return null
  const years = Math.floor((Date.now() - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 365.25))
  return years === 1 ? '1 año' : `${years} años`
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function Field({ label, value, empty = '—' }) {
  return (
    <div className="petdetail-field">
      <span className="petdetail-field__label">{label}</span>
      <span className="petdetail-field__value">{value || empty}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="petdetail-section">
      <h3 className="petdetail-section__title">{title}</h3>
      {children}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PetDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { user }   = useAuth()

  const [pet, setPet]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [activeTab, setActiveTab] = useState('basic')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchPet() }, [id])

  const fetchPet = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('pets').select('*').eq('id', id).single()
      if (error) throw new Error(error.message)
      if (!data) throw new Error('Mascota no encontrada')
      if (data.user_id !== user.id) throw new Error('No tienes acceso a esta mascota')
      setPet(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Seguro que quieres eliminar esta mascota? Esta acción no se puede deshacer.')) return
    setDeleting(true)
    try {
      const { error } = await supabase.from('pets').delete().eq('id', id)
      if (error) throw new Error(error.message)
      navigate('/dashboard')
    } catch (err) {
      alert(err.message)
    } finally {
      setDeleting(false)
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="petdetail-loading">
        <Loader2 size={28} color="var(--teal)" className="spinning" />
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="petdetail-error">
        <AlertCircle size={32} color="var(--red)" />
        <p className="petdetail-error__text">{error}</p>
        <button className="petdetail-error__btn" onClick={() => navigate('/dashboard')}>
          Volver al Dashboard
        </button>
      </div>
    )
  }

  const AnimalIcon = ANIMAL_ICONS[pet.animal_type] || PawPrint
  const hasDocs    = pet.medical_documents?.length > 0

  return (
    <div className="petdetail-wrapper">
      <div className="petdetail-inner">

        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          className="petdetail-header"
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            className="petdetail-back-btn"
            whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
          >
            <ChevronLeft size={20} />
          </motion.button>

          <div className="flex items-center gap-3">
            {pet.photo_url ? (
              <img src={pet.photo_url} alt={pet.name} className="petdetail-avatar-img" />
            ) : (
              <div className="petdetail-avatar-icon">
                <AnimalIcon size={24} color="var(--teal)" />
              </div>
            )}
            <div>
              <h1 className="petdetail-name">{pet.name}</h1>
              <p className="petdetail-breed">
                {pet.breed || pet.animal_type}
                {pet.sex && ` · ${pet.sex === 'male' ? '♂ Macho' : '♀ Hembra'}`}
                {pet.birth_date && ` · ${calcAge(pet.birth_date)}`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Tabs ───────────────────────────────────────────────── */}
        <motion.div
          className="petdetail-tabs"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        >
          {TABS.map(({ id: tid, label, Icon }) => (
            <motion.button
              key={tid}
              className={`petdetail-tab ${activeTab === tid ? 'active' : ''}`}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tid)}
            >
              <Icon size={16} color={activeTab === tid ? 'white' : 'var(--gray)'} />
              <span className="petdetail-tab__label">{label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* ── Contenido ──────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >

            {/* DATOS BÁSICOS */}
            {activeTab === 'basic' && (
              <Section title="Información general">
                <div className="petdetail-fields-grid">
                  <Field label="Nombre"     value={pet.name}        />
                  <Field label="Tipo"       value={pet.animal_type} />
                  <Field label="Raza"       value={pet.breed}       />
                  <Field label="Edad"       value={calcAge(pet.birth_date)} />
                  <Field label="Sexo"       value={pet.sex === 'male' ? '♂ Macho' : pet.sex === 'female' ? '♀ Hembra' : null} />
                  <Field label="Nacimiento" value={pet.birth_date ? new Date(pet.birth_date).toLocaleDateString('es-ES') : null} />
                </div>
                <Field label="Número de chip" value={pet.chip_number} />
              </Section>
            )}

            {/* SALUD */}
            {activeTab === 'health' && (
              <>
                <Section title="Condiciones médicas">
                  <Field value={pet.medical_conditions} empty="Sin condiciones registradas" />
                </Section>
                <Section title="Cirugías">
                  <Field value={pet.surgeries_notes} empty="Sin cirugías registradas" />
                </Section>
                <Section title="Desparasitación">
                  <Field value={pet.deworming_notes} empty="Sin información de desparasitación" />
                </Section>
                <Section title="Notas adicionales">
                  <Field value={pet.additional_notes} empty="Sin notas" />
                </Section>
              </>
            )}

            {/* DOCUMENTOS */}
            {activeTab === 'docs' && (
              <Section title="Documentos veterinarios">
                {hasDocs ? (
                  pet.medical_documents.map((doc, i) => (
                    <div key={i} className="petdetail-doc-item">
                      <FileText size={20} color="var(--teal)" />
                      <div className="flex-1">
                        <p className="petdetail-doc-item__name">{doc.name || `Documento ${i + 1}`}</p>
                        <p className="petdetail-doc-item__meta">{doc.type} · {doc.date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="petdetail-docs-empty">
                    <FileText size={32} color="var(--gray)" className="mx-auto mb-3" />
                    <p className="petdetail-docs-empty__text">No hay documentos subidos todavía</p>
                    <p className="petdetail-docs-empty__hint">
                      Podrás subir analíticas, radiografías y certificados<br />
                      desde aquí próximamente
                    </p>
                  </div>
                )}
              </Section>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ── Acciones ───────────────────────────────────────────── */}
        <motion.div
          className="petdetail-actions"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <motion.button
            className="petdetail-btn-edit"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          >
            <Edit size={18} color="white" />
            <span className="petdetail-btn-edit__label">Editar</span>
          </motion.button>

          <motion.button
            className="petdetail-btn-delete"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting
              ? <Loader2 size={18} color="var(--red)" className="spinning" />
              : <Trash2 size={18} color="var(--red)" />
            }
            <span className="petdetail-btn-delete__label">Eliminar</span>
          </motion.button>
        </motion.div>

      </div>
    </div>
  )
}