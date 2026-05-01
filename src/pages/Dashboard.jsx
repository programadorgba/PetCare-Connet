import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  PawPrint, CalendarPlus, MessageCircle, Bell, HelpCircle,
  Heart, Scale, Droplets, ChevronRight, MoreVertical,
  TrendingUp, Clock, AlertTriangle, CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const C = {
  teal: '#1D9E75', tealLight: '#E1F5EE', tealMid: '#5DCAA5',
  orange: '#E07B3F', orangeLight: '#FDEEDE', amber: '#F7C34A',
  slate: '#3D4E4B', slateDark: '#2C3836',
  gray: '#7A8A87', grayBg: '#F4F6F5', white: '#FFFFFF',
  red: '#E24B4A', redLight: '#FCEBEB',
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' },
})

const pets = [
  {
    id: 'luna', name: 'Luna', breed: 'Golden Retriever', age: '3 años',
    health: 95, weight: '24kg', extra: { icon: <Droplets size={12} />, label: 'Hidratación: Ok', ok: true },
    badge: { text: 'VACUNADA', bg: C.tealLight, color: C.teal },
    statusColor: C.teal, statusIcon: <CheckCircle2 size={10} color="white" />,
    emoji: '🐕',
    emojiGradient: 'linear-gradient(135deg, #F5A86B, #E07B3F)',
  },
  {
    id: 'max', name: 'Max', breed: 'Gato Siamés', age: '5 años',
    health: 82, weight: '4.5kg', extra: { icon: <AlertTriangle size={12} />, label: 'Revisión necesaria', ok: false },
    badge: { text: 'CITA PENDIENTE', bg: C.orangeLight, color: C.orange },
    statusColor: C.orange, statusIcon: <span style={{ fontSize: 9, fontWeight: 700, color: 'white' }}>!</span>,
    emoji: '🐈',
    emojiGradient: 'linear-gradient(135deg, #3D4E4B, #2C3836)',
  },
]

const reminders = [
  { month: 'OCT', day: 12, name: 'Vacuna Rabia - Luna', time: 'En 2 días • 10:30 AM', bg: C.tealLight, color: C.teal },
  { month: 'OCT', day: 15, name: 'Control Dental - Max', time: 'En 5 días • 4:00 PM',  bg: C.orangeLight, color: C.orange },
  { month: 'OCT', day: 20, name: 'Desparasitación',      time: 'Luna & Max',           bg: C.tealLight, color: C.teal },
]

const getPetEmoji = (type) => {
  const emojis = { dog: '🐕', cat: '🐈', bird: '🐦', rabbit: '🐰', fish: '🐟', other: '🐾' }
  return emojis[type] || '🐾'
}

const getPetGradient = (type) => {
  const gradients = {
    dog: 'linear-gradient(135deg, #F5A86B, #E07B3F)',
    cat: 'linear-gradient(135deg, #3D4E4B, #2C3836)',
    bird: 'linear-gradient(135deg, #87CEEB, #4682B4)',
    rabbit: 'linear-gradient(135deg, #DDA0DD, #C71585)',
    fish: 'linear-gradient(135deg, #87CEEB, #1E90FF)',
    other: 'linear-gradient(135deg, #A9A9A9, #808080)',
  }
  return gradients[type] || gradients.other
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchPets()
  }, [user])

  const fetchPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPets(data || [])
    } catch (err) {
      console.error('Error fetching pets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePetClick = (petId) => {
    navigate(`/pets/${petId}`)
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

      {/* ── Contenido principal ─────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 28px' }}>

        {/* Tarjetas de acción */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 32 }}
        >
          {[
            { bg: C.teal,   Icon: CalendarPlus,   title: 'Nueva Cita',             sub: 'Agenda con tu veterinario',   shadow: 'rgba(29,158,117,0.35)' },
            { bg: C.orange, Icon: PawPrint,        title: 'Añadir Mascota',         sub: 'Registra un nuevo compañero', shadow: 'rgba(224,123,63,0.35)', action: () => navigate('/pets/add') },
            { bg: C.slate,  Icon: MessageCircle,   title: 'Contactar Veterinario',  sub: 'Consulta rápida por chat',    shadow: 'rgba(61,78,75,0.25)' },
          ].map((card, i) => (
            <motion.button
              key={i}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              onClick={card.action}
              whileHover={{ y: -4, boxShadow: `0 12px 28px ${card.shadow}` }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: card.bg, borderRadius: 18,
                padding: '28px 20px', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 10, textAlign: 'center', transition: 'box-shadow 0.2s',
                boxShadow: `0 4px 16px ${card.shadow}`,
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(255,255,255,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <card.Icon size={26} color="white" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'white' }}>{card.title}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)' }}>{card.sub}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Mis mascotas */}
        <motion.div {...fadeUp(0.2)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: C.slateDark }}>Mis Mascotas</span>
            <motion.span
              whileHover={{ x: 3 }}
              style={{ fontSize: 13, color: C.teal, cursor: 'pointer', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 2 }}
            >
              Ver todas <ChevronRight size={14} />
            </motion.span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: C.gray }}>
              Cargando mascotas...
            </div>
          ) : pets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: C.white, borderRadius: 16,
              border: `1px solid #EEF2F0` }}>
              <PawPrint size={32} color={C.gray} style={{ marginBottom: 12 }} />
              <p style={{ color: C.gray, marginBottom: 16 }}>No tienes mascotas registradas</p>
              <button onClick={() => navigate('/pets/add')} style={{
                padding: '10px 20px', background: C.teal, color: 'white',
                border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer',
              }}>
                Añadir mi primera mascota
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pets.map((pet, i) => (
                <motion.div
                  key={pet.id}
                  {...fadeUp(0.3 + i * 0.1)}
                  onClick={() => handlePetClick(pet.id)}
                  whileHover={{ y: -2, boxShadow: '0 6px 24px rgba(0,0,0,0.09)' }}
                  style={{
                    background: C.white, borderRadius: 16, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 16,
                    border: '1px solid #EEF2F0', cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  {/* Avatar */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {pet.photo_url ? (
                      <img src={pet.photo_url} alt={pet.name}
                        style={{ width: 62, height: 62, borderRadius: 14, objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: 62, height: 62, borderRadius: 14,
                        background: getPetGradient(pet.animal_type),
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 30,
                      }}>
                        {getPetEmoji(pet.animal_type)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: C.slateDark, margin: '0 0 2px' }}>{pet.name}</p>
                    <p style={{ fontSize: 12, color: C.gray, margin: '0 0 8px' }}>{pet.breed || pet.animal_type} • {pet.age || 'Sin edad'}</p>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.slate }}>
                        <Heart size={12} color={C.teal} /> Salud: {pet.medical_conditions ? 'Con condiciones' : 'Ok'}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight size={16} color={C.gray} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Panel derecho ────────────────────────────────────────── */}
      <motion.aside
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        style={{
          width: 288, flexShrink: 0, overflow: 'auto',
          padding: '28px 20px 28px 0',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        {/* Recordatorios */}
        <div style={{
          background: C.white, borderRadius: 16, padding: '18px 18px',
          border: '1px solid #EEF2F0',
        }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.slateDark, marginBottom: 4 }}>
            Recordatorios
          </p>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.gray, letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: 12 }}>
            Próximos 7 días
          </p>

          {reminders.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0',
                borderBottom: i < reminders.length - 1 ? '1px solid #F0F4F2' : 'none',
              }}
            >
              <div style={{
                width: 42, height: 46, borderRadius: 10, background: r.bg,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: r.color,
                  textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {r.month}
                </span>
                <span style={{ fontSize: 18, fontWeight: 700, color: C.slateDark, lineHeight: 1.1 }}>
                  {r.day}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: C.slateDark, margin: '0 0 2px' }}>{r.name}</p>
                <p style={{ fontSize: 11, color: C.gray, margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={10} /> {r.time}
                </p>
              </div>
              <MoreVertical size={15} color={C.gray} style={{ cursor: 'pointer' }} />
            </motion.div>
          ))}

          <motion.span
            whileHover={{ color: C.teal }}
            style={{ display: 'block', textAlign: 'center', paddingTop: 12,
              fontSize: 13, color: C.teal, cursor: 'pointer', fontWeight: 600 }}
          >
            Gestionar Calendario
          </motion.span>
        </div>

        {/* Tip de salud */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: C.tealLight, borderRadius: 16,
            padding: '16px 18px', border: `1px solid ${C.tealMid}40`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <TrendingUp size={14} color={C.teal} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.teal }}>Tip de Salud</span>
          </div>
          <p style={{ fontSize: 12, color: C.slate, lineHeight: 1.65, margin: '0 0 10px' }}>
            ¿Sabías que mantener los dientes de Luna limpios puede añadir hasta 2 años a su vida?
          </p>
          <motion.span
            whileHover={{ gap: 6 }}
            style={{ fontSize: 12, color: C.teal, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            Leer artículo <ChevronRight size={13} />
          </motion.span>
        </motion.div>
      </motion.aside>
    </div>
  )
}