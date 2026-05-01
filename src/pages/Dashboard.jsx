import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  PawPrint, CalendarPlus, MessageCircle,
  Heart, ChevronRight, MoreVertical,
  TrendingUp, Clock,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import './Dashboard.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getPetEmoji = (type) => {
  const map = { dog: '🐕', cat: '🐈', bird: '🐦', rabbit: '🐰', fish: '🐟' }
  return map[type] || '🐾'
}

const getPetGradient = (type) => {
  const map = {
    dog:    'linear-gradient(135deg, #F5A86B, #E07B3F)',
    cat:    'linear-gradient(135deg, #3D4E4B, #2C3836)',
    bird:   'linear-gradient(135deg, #87CEEB, #4682B4)',
    rabbit: 'linear-gradient(135deg, #DDA0DD, #C71585)',
    fish:   'linear-gradient(135deg, #87CEEB, #1E90FF)',
  }
  return map[type] || 'linear-gradient(135deg, #A9A9A9, #808080)'
}

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.4, delay, ease: 'easeOut' },
})

// ─── Datos mock recordatorios (hasta conectar tabla appointments) ─────────────
const reminders = [
  { month: 'OCT', day: 12, name: 'Vacuna Rabia - Luna',  time: 'En 2 días • 10:30 AM', bg: 'var(--teal-light)',   color: 'var(--teal)'   },
  { month: 'OCT', day: 15, name: 'Control Dental - Max', time: 'En 5 días • 4:00 PM',  bg: 'var(--orange-light)', color: 'var(--orange)' },
  { month: 'OCT', day: 20, name: 'Desparasitación',      time: 'Luna & Max',            bg: 'var(--teal-light)',   color: 'var(--teal)'   },
]

// ─── Action cards config ──────────────────────────────────────────────────────
const ACTION_CARDS = [
  { bg: '#1D9E75', Icon: CalendarPlus,  title: 'Nueva Cita',            sub: 'Agenda con tu veterinario',   shadow: 'rgba(29,158,117,0.35)', action: null },
  { bg: '#E07B3F', Icon: PawPrint,      title: 'Añadir Mascota',        sub: 'Registra un nuevo compañero', shadow: 'rgba(224,123,63,0.35)', action: '/pets/add' },
  { bg: '#3D4E4B', Icon: MessageCircle, title: 'Contactar Veterinario', sub: 'Consulta rápida por chat',    shadow: 'rgba(61,78,75,0.25)',   action: null },
]

// ─── Componente ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [pets, setPets]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchPets() }, [user])

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
      console.error('Error cargando mascotas:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-wrapper">

      {/* ── Contenido principal ─────────────────────────────────── */}
      <div className="dashboard-main">

        {/* Action cards */}
        <motion.div
          className="action-grid"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {ACTION_CARDS.map((card, i) => (
            <motion.button
              key={i}
              className="action-card"
              style={{ background: card.bg, boxShadow: `0 4px 16px ${card.shadow}` }}
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
              onClick={() => card.action && navigate(card.action)}
              whileHover={{ y: -4, boxShadow: `0 12px 28px ${card.shadow}` }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="action-card__icon">
                <card.Icon size={26} color="white" />
              </div>
              <p className="action-card__title">{card.title}</p>
              <p className="action-card__sub">{card.sub}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Mis mascotas */}
        <motion.div {...fadeUp(0.2)}>
          <div className="section-header">
            <span className="section-title">Mis Mascotas</span>
            <motion.span className="section-link" whileHover={{ x: 3 }}>
              Ver todas <ChevronRight size={14} />
            </motion.span>
          </div>

          {/* Loading */}
          {loading && (
            <p className="loading-text">Cargando mascotas...</p>
          )}

          {/* Empty state */}
          {!loading && pets.length === 0 && (
            <div className="empty-state">
              <PawPrint size={32} color="var(--gray)" style={{ marginBottom: 12 }} />
              <p className="empty-state__text">No tienes mascotas registradas</p>
              <button className="empty-state__btn" onClick={() => navigate('/pets/add')}>
                Añadir mi primera mascota
              </button>
            </div>
          )}

          {/* Lista */}
          {!loading && pets.length > 0 && pets.map((pet, i) => (
            <motion.div
              key={pet.id}
              className="pet-card"
              {...fadeUp(0.3 + i * 0.1)}
              onClick={() => navigate(`/pets/${pet.id}`)}
              whileHover={{ y: -2, boxShadow: '0 6px 24px rgba(0,0,0,0.09)' }}
            >
              {/* Avatar */}
              <div className="pet-avatar">
                {pet.photo_url ? (
                  <img
                    src={pet.photo_url}
                    alt={pet.name}
                    className="pet-avatar__img"
                  />
                ) : (
                  <div
                    className="pet-avatar__emoji"
                    style={{ background: getPetGradient(pet.animal_type) }}
                  >
                    {getPetEmoji(pet.animal_type)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="pet-info">
                <p className="pet-info__name">{pet.name}</p>
                <p className="pet-info__breed">
                  {pet.breed || pet.animal_type}
                  {pet.birth_date && ` · ${new Date().getFullYear() - new Date(pet.birth_date).getFullYear()} años`}
                </p>
                <div className="pet-info__stats">
                  <span className="pet-info__stat">
                    <Heart size={12} color="var(--teal)" />
                    {pet.medical_conditions ? 'Con condiciones' : 'Salud Ok'}
                  </span>
                  {pet.sex && (
                    <span className="pet-info__stat">
                      {pet.sex === 'male' ? '♂ Macho' : '♀ Hembra'}
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight size={16} color="var(--gray)" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Panel derecho ────────────────────────────────────────── */}
      <motion.aside
        className="dashboard-aside"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {/* Recordatorios */}
        <div className="reminder-card">
          <p className="reminder-card__title">Recordatorios</p>
          <p className="reminder-card__sub">Próximos 7 días</p>

          {reminders.map((r, i) => (
            <motion.div
              key={i}
              className="reminder-item"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <div className="reminder-date" style={{ background: r.bg }}>
                <span className="reminder-date__month" style={{ color: r.color }}>{r.month}</span>
                <span className="reminder-date__day">{r.day}</span>
              </div>
              <div className="flex-1">
                <p className="reminder-info__name">{r.name}</p>
                <p className="reminder-info__time">
                  <Clock size={10} /> {r.time}
                </p>
              </div>
              <MoreVertical size={15} color="var(--gray)" className="cursor-pointer" />
            </motion.div>
          ))}

          <motion.span
            className="reminder-manage"
            whileHover={{ color: 'var(--teal)' }}
          >
            Gestionar Calendario
          </motion.span>
        </div>

        {/* Tip de salud */}
        <motion.div
          className="tip-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="tip-card__header">
            <TrendingUp size={14} color="var(--teal)" />
            <span className="tip-card__title">Tip de Salud</span>
          </div>
          <p className="tip-card__text">
            ¿Sabías que mantener los dientes de tus mascotas limpios puede añadir hasta 2 años a su vida?
          </p>
          <motion.span className="tip-card__link" whileHover={{ gap: 6 }}>
            Leer artículo <ChevronRight size={13} />
          </motion.span>
        </motion.div>
      </motion.aside>
    </div>
  )
}