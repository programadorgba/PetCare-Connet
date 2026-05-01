import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, PawPrint, Dog, Cat, Bird, Rabbit, Fish,
  Heart, FileText, Calendar, Hash, Edit, Trash2,
  Loader2, AlertCircle, Syringe, Shield,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const C = {
  teal: '#1D9E75', tealLight: '#E1F5EE', tealMid: '#5DCAA5',
  orange: '#E07B3F', orangeLight: '#FDEEDE',
  slate: '#3D4E4B', slateDark: '#2C3836',
  gray: '#7A8A87', grayBg: '#F4F6F5', white: '#FFFFFF',
  red: '#E24B4A', redLight: '#FCEBEB',
  border: '#DDE6E2',
}

const ANIMAL_ICONS = {
  dog: Dog, cat: Cat, bird: Bird, rabbit: Rabbit, fish: Fish, other: PawPrint,
}

const TABS = [
  { id: 'basic', label: 'Datos', icon: PawPrint },
  { id: 'health', label: 'Salud', icon: Heart },
  { id: 'docs', label: 'Docs', icon: FileText },
]

function Field({ label, value, empty = '—' }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: C.gray, display: 'block', marginBottom: 4 }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: C.slateDark }}>
        {value || empty}
      </span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{
      background: C.white, borderRadius: 16,
      padding: '20px 24px', border: `1px solid #EEF2F0`,
      marginBottom: 16,
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.slateDark, marginBottom: 16 }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function PetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('basic')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchPet()
  }, [id])

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
      if (data.user_id !== user.id) throw new Error('No tienes acceso a esta mascota')

      setPet(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta mascota?')) return
    
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

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} color={C.teal} style={{ animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <AlertCircle size={32} color={C.red} />
        <p style={{ color: C.red, fontSize: 14 }}>{error}</p>
        <button onClick={() => navigate('/dashboard')} style={{ 
          padding: '10px 20px', background: C.teal, color: 'white', 
          border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' 
        }}>
          Volver al Dashboard
        </button>
      </div>
    )
  }

  const AnimalIcon = ANIMAL_ICONS[pet.animal_type] || PawPrint
  const hasMedicalDocs = pet.medical_documents && pet.medical_documents.length > 0

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '28px 28px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}
        >
          <motion.button
            whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: C.white, border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: C.slate,
            }}
          >
            <ChevronLeft size={20} />
          </motion.button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {pet.photo_url ? (
              <img src={pet.photo_url} alt={pet.name}
                style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: C.tealLight, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <AnimalIcon size={24} color={C.teal} />
              </div>
            )}
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: C.slateDark, margin: 0 }}>
                {pet.name}
              </h1>
              <p style={{ fontSize: 13, color: C.gray, margin: 0 }}>
                {pet.breed || pet.animal_type} • {pet.birth_date || 'Sin fecha de nacimiento'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', gap: 8, marginBottom: 24 }}
        >
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 12,
                background: activeTab === tab.id ? C.teal : C.white,
                border: `1px solid ${activeTab === tab.id ? C.teal : C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <tab.icon size={16} color={activeTab === tab.id ? 'white' : C.gray} />
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: activeTab === tab.id ? 'white' : C.gray,
              }}>
                {tab.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Contenido según pestaña */}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                  <Field label="Nombre" value={pet.name} />
                  <Field label="Tipo" value={pet.animal_type} />
                  <Field label="Raza" value={pet.breed} />
                  <Field label="Fecha de nacimiento" value={pet.birth_date} />
                </div>
                <Field label="Número de chip" value={pet.chip_number} />
              </Section>
            )}

            {/* SALUD */}
            {activeTab === 'health' && (
              <>
                <Section title="Condiciones médicas">
                  <Field label="Descripción" value={pet.medical_conditions} empty="Sin condiciones registradas" />
                </Section>
                
                <Section title="Cirugías">
                  <Field label="Historial" value={pet.surgeries} empty="Sin cirugías registradas" />
                </Section>
                
                <Section title="Desparasitación">
                  <Field label="Información" value={pet.deworming} empty="Sin información de desparasitación" />
                </Section>
                
                <Section title="Notas adicionales">
                  <Field label="Notas" value={pet.additional_notes} empty="Sin notas" />
                </Section>
              </>
            )}

            {/* DOCUMENTOS */}
            {activeTab === 'docs' && (
              <Section title="Documentos veterinarios">
                {hasMedicalDocs ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pet.medical_documents.map((doc, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: 14, background: C.grayBg, borderRadius: 12,
                      }}>
                        <FileText size={20} color={C.teal} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: C.slateDark, margin: 0 }}>
                            {doc.name || `Documento ${i + 1}`}
                          </p>
                          <p style={{ fontSize: 12, color: C.gray, margin: 0 }}>
                            {doc.type} • {doc.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <FileText size={32} color={C.gray} style={{ marginBottom: 12 }} />
                    <p style={{ fontSize: 14, color: C.gray, marginBottom: 16 }}>
                      No hay documentos subidos todavía
                    </p>
                    <p style={{ fontSize: 12, color: C.gray, lineHeight: 1.6 }}>
                      Podrás subir analíticas, radiografías y certificados<br />
                      desde la ficha de la mascota
                    </p>
                  </div>
                )}
              </Section>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Acciones */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex', gap: 12, marginTop: 24,
            paddingTop: 24, borderTop: `1px solid #EEF2F0`,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{
              flex: 1, padding: '14px 20px', borderRadius: 12,
              background: C.teal, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(29,158,117,0.30)',
            }}
          >
            <Edit size={18} color="white" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Editar</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleDelete}
            disabled={deleting}
            style={{
              flex: 1, padding: '14px 20px', borderRadius: 12,
              background: C.white, border: `1.5px solid ${C.red}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.6 : 1,
            }}
          >
            {deleting ? (
              <Loader2 size={18} color={C.red} style={{ animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <Trash2 size={18} color={C.red} />
            )}
            <span style={{ fontSize: 14, fontWeight: 600, color: C.red }}>Eliminar</span>
          </motion.button>
        </motion.div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}