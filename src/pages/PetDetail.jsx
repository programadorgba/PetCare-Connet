import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, PawPrint, Heart, FileText,
  Edit, Trash2, Loader2, AlertCircle,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { animalTypeLabel, animalEmoji, animalGradient, sexLabel, calcAge } from '../utils/petMaps'
import './PetDetail.css'

// ─── Pasos / tabs ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'basic',  label: 'Datos', Icon: PawPrint  },
  { id: 'health', label: 'Salud', Icon: Heart     },
  { id: 'docs',   label: 'Docs',  Icon: FileText  },
]


function formatDate(d) {
  if (!d) return null
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function Field({ label, value, empty = '—' }) {
  return (
    <div className="petdetail-field">
      {label && <span className="petdetail-field__label">{label}</span>}
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
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [pet, setPet]             = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [activeTab, setActiveTab] = useState('basic')
  const [deleting, setDeleting]   = useState(false)

useEffect(() => {
  if (!user) return

  const fetchPet = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw new Error(error.message)
      if (!data) throw new Error('Mascota no encontrada')
      if (data.user_id !== user.id) throw new Error('No tienes acceso')

      setPet(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  fetchPet()
}, [id, user])

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

  const hasDocs = pet.medical_documents?.length > 0

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
              <div
                className="petdetail-avatar-icon"
                style={{ background: animalGradient(pet.animal_type) }}
              >
                <span style={{ fontSize: 26 }}>{animalEmoji(pet.animal_type)}</span>
              </div>
            )}
            <div>
              <h1 className="petdetail-name">{pet.name}</h1>
              <p className="petdetail-breed">
                {animalTypeLabel(pet.animal_type)}
                {pet.breed && ` · ${pet.breed}`}
                {pet.sex && ` · ${sexLabel(pet.sex)}`}
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

        {/* ── Contenido tabs ──────────────────────────────────────── */}
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
                  <Field label="Nombre"           value={pet.name} />
                  <Field label="Tipo de animal"   value={animalTypeLabel(pet.animal_type)} />
                  <Field label="Raza"             value={pet.breed} />
                  <Field label="Sexo"             value={sexLabel(pet.sex)} />
                  <Field label="Fecha nacimiento" value={formatDate(pet.birth_date)} />
                  <Field label="Edad"             value={calcAge(pet.birth_date)} />
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
                      Podrás subir analíticas, radiografías y certificados próximamente
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