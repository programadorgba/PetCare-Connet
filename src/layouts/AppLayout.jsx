import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PawPrint, LayoutDashboard, Dog, CalendarDays,
  ClipboardPlus, Users, Settings, LogOut, Bell, HelpCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const C = {
  teal: '#1D9E75', tealLight: '#E1F5EE',
  slate: '#3D4E4B', slateDark: '#2C3836',
  gray: '#7A8A87', grayBg: '#F4F6F5', white: '#FFFFFF',
  red: '#E24B4A', orange: '#E07B3F',
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',     to: '/dashboard' },
  { icon: Dog,             label: 'Mascotas',      to: '/pets' },
  { icon: CalendarDays,    label: 'Citas',          to: '/appointments' },
  { icon: ClipboardPlus,   label: 'Historial',     to: '/history' },
  { icon: Users,           label: 'Comunidad',     to: '/community' },
  { icon: Settings,        label: 'Configuración', to: '/settings' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div style={{ display: 'flex', height: '100vh', background: C.grayBg }}>

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <motion.aside
        initial={{ x: -220 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          width: 220, background: C.white, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          borderRight: '1px solid #E8EDEB',
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '24px 20px 24px', borderBottom: '1px solid #F0F4F2',
        }}>
          <div style={{
            width: 40, height: 40, background: C.teal,
            borderRadius: 10, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <PawPrint size={22} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.slateDark, lineHeight: 1.2 }}>
              PetCare<br />Connect
            </div>
            <div style={{ fontSize: 10, color: C.gray, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Salud Animal
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ icon: Icon, label, to }) => (
            <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ x: 2 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    background: isActive ? C.tealLight : 'transparent',
                    color: isActive ? C.teal : C.slate,
                    fontWeight: isActive ? 600 : 400, fontSize: 14,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  <Icon size={17} />
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      style={{
                        marginLeft: 'auto', width: 5, height: 5,
                        borderRadius: '50%', background: C.teal,
                      }}
                    />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0 12px 24px' }}>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
              color: C.red, fontSize: 14, fontWeight: 500,
              background: 'none', border: 'none', width: '100%',
              transition: 'background 0.15s',
            }}
          >
            <LogOut size={17} />
            Cerrar Sesión
          </motion.button>
        </div>
      </motion.aside>

      {/* ── Contenedor derecho ───────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            background: C.white, borderBottom: '1px solid #E8EDEB',
            padding: '0 28px', height: 64,
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 700, color: C.slateDark }}>
            ¡Hola, {user?.name?.split(' ')[0] || 'Carlos'}! 👋
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Buscador */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: C.grayBg, border: '1px solid #E0E8E5',
              borderRadius: 24, padding: '8px 16px', fontSize: 13,
              color: C.gray, width: 220,
            }}>
              🔍 Buscar mascotas, citas...
            </div>

            {/* Notificaciones */}
            <motion.div
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: C.grayBg, border: '1px solid #E0E8E5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative',
              }}
            >
              <Bell size={17} color={C.slate} />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.8 }}
                style={{
                  position: 'absolute', top: 5, right: 5,
                  width: 8, height: 8, background: C.orange,
                  borderRadius: '50%', border: '2px solid white',
                }}
              />
            </motion.div>

            {/* Ayuda */}
            <motion.div
              whileHover={{ scale: 1.08 }}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: C.grayBg, border: '1px solid #E0E8E5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <HelpCircle size={17} color={C.slate} />
            </motion.div>

            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.06 }}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: C.teal, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              {initials}
            </motion.div>
          </div>
        </motion.header>

        {/* Página activa */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          <Outlet />
        </div>
      </div>

      {/* ── Modal confirmar logout ────────────────────────────────── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutConfirm(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 100,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: C.white, borderRadius: 20, padding: '32px 32px',
                width: 340, textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: '#FFF0F0', margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LogOut size={24} color={C.red} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.slateDark, marginBottom: 8 }}>
                ¿Cerrar sesión?
              </h2>
              <p style={{ fontSize: 14, color: C.gray, marginBottom: 24 }}>
                Tu sesión se cerrará de forma segura
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    flex: 1, padding: '11px', borderRadius: 10, fontSize: 14,
                    fontWeight: 600, border: '1.5px solid #E0E8E5',
                    background: C.white, color: C.slate, cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    flex: 1, padding: '11px', borderRadius: 10, fontSize: 14,
                    fontWeight: 700, border: 'none',
                    background: C.red, color: 'white', cursor: 'pointer',
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}