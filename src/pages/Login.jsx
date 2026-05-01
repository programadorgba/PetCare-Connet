import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, PawPrint, AlertCircle, ArrowRight, Loader2, Shield, Heart, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { loginSchema } from '../utils/validators'
import petImg from '../assets/PetCareV.webp'

const C = {
  teal: '#1D9E75', tealLight: '#E1F5EE', tealMid: '#5DCAA5',
  orange: '#E07B3F', slate: '#3D4E4B', slateDark: '#2C3836',
  gray: '#7A8A87', grayBg: '#F0F4F2', white: '#FFFFFF',
  red: '#E24B4A', redLight: '#FCEBEB',
}

const features = [
  { icon: Heart,  text: 'Salud de tus mascotas en un vistazo' },
  { icon: Bell,   text: 'Recordatorios de vacunas y citas'    },
  { icon: Shield, text: 'Historial médico siempre seguro'     },
]

export default function Login() {
  const { login, loginWithGoogle, loginWithApple, loading } = useAuth()
  const navigate           = useNavigate()
  const location           = useLocation()
  const from               = location.state?.from?.pathname || '/dashboard'

  const [showPass, setShowPass]   = useState(false)
  const [authError, setAuthError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setAuthError('')
    try {
      await login(data.email, data.password)
      navigate(from, { replace: true })
    } catch (err) {
      setAuthError(err.message)
    }
  }

  return (
    /* ── Fondo de pantalla ─────────────────────────────────────── */
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      background: `radial-gradient(ellipse at 60% 40%, ${C.tealLight} 0%, #EEF3F1 55%, #F8F5F0 100%)`,
    }}>

      {/* ── Card unificado ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: 880,
          minHeight: 560,
          borderRadius: 28,
          overflow: 'hidden',
          border: '1.5px solid #C8DDD6',
          boxShadow: [
            '0 2px 4px rgba(0,0,0,0.04)',
            '0 8px 24px rgba(29,158,117,0.10)',
            '0 24px 64px rgba(0,0,0,0.09)',
          ].join(', '),
          background: C.white,
        }}
      >

        {/* ── Mitad izquierda — imagen ─────────────────────────── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <img
            src={petImg}
            alt="PetCare"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
            }}
          />
          {/* Overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, rgba(29,158,117,0.78) 0%, rgba(44,56,54,0.65) 55%, rgba(44,56,54,0.90) 100%)',
          }} />

          {/* Contenido overlay */}
          <div style={{
            position: 'relative', zIndex: 1,
            height: '100%',
            display: 'flex', flexDirection: 'column',
            padding: '36px 36px',
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40,
                background: 'rgba(255,255,255,0.18)',
                borderRadius: 11, border: '1.5px solid rgba(255,255,255,0.32)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(6px)',
              }}>
                <PawPrint size={20} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'white', lineHeight: 1.2 }}>PetCare Connect</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Salud Animal</div>
              </div>
            </div>

            {/* Tagline */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{ fontSize: 28, fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: 12 }}
              >
                Cuida a tus<br />mascotas con<br />
                <span style={{ color: '#7DEBB8' }}>amor y ciencia</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.42 }}
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 240, marginBottom: 28 }}
              >
                Gestiona salud, citas y vacunas desde un solo lugar.
              </motion.p>

              {features.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.48 + i * 0.09 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.24)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)', flexShrink: 0,
                  }}>
                    <Icon size={14} color="white" />
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>{text}</span>
                </motion.div>
              ))}
            </div>

            {/* Badge */}
            <div style={{
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.10)',
              borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(6px)',
            }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', margin: 0 }}>
                Más de <strong style={{ color: 'white' }}>12.000 mascotas</strong> cuidadas con PetCare
              </p>
            </div>
          </div>
        </div>

        {/* ── Mitad derecha — formulario ───────────────────────── */}
        <div style={{
          flex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 44px',
          overflowY: 'auto',
        }}>
          <div style={{ width: '100%', maxWidth: 340 }}>

            {/* Encabezado form */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              style={{ marginBottom: 28 }}
            >
              <h1 style={{ fontSize: 22, fontWeight: 700, color: C.slateDark, marginBottom: 4 }}>
                Bienvenido de nuevo
              </h1>
              <p style={{ fontSize: 13, color: C.gray }}>
                Inicia sesión para ver a tus mascotas
              </p>
            </motion.div>

            {/* Error global */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: C.redLight, border: `1px solid ${C.red}33`,
                    borderRadius: 10, padding: '10px 13px', marginBottom: 18,
                    fontSize: 13, color: C.red,
                  }}
                >
                  <AlertCircle size={15} color={C.red} />
                  {authError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 }} style={{ marginBottom: 14 }}
              >
                <label style={{ fontSize: 13, fontWeight: 600, color: C.slate, display: 'block', marginBottom: 6 }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color={C.gray} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    {...register('email')}
                    type="email" placeholder="carlos@email.com" autoComplete="email"
                    style={{
                      width: '100%', padding: '10px 13px 10px 38px',
                      border: `1.5px solid ${errors.email ? C.red : '#DDE6E2'}`,
                      borderRadius: 10, fontSize: 14, color: C.slateDark,
                      outline: 'none', background: errors.email ? C.redLight : C.white,
                      transition: 'border-color 0.18s', boxSizing: 'border-box',
                    }}
                    onFocus={e => !errors.email && (e.target.style.borderColor = C.teal)}
                    onBlur={e  => !errors.email && (e.target.style.borderColor = '#DDE6E2')}
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ fontSize: 11, color: C.red, marginTop: 3 }}>
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Contraseña */}
              <motion.div
                initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 }} style={{ marginBottom: 8 }}
              >
                <label style={{ fontSize: 13, fontWeight: 600, color: C.slate, display: 'block', marginBottom: 6 }}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color={C.gray} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    {...register('password')}
                    type={showPass ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password"
                    style={{
                      width: '100%', padding: '10px 42px 10px 38px',
                      border: `1.5px solid ${errors.password ? C.red : '#DDE6E2'}`,
                      borderRadius: 10, fontSize: 14, color: C.slateDark,
                      outline: 'none', background: errors.password ? C.redLight : C.white,
                      transition: 'border-color 0.18s', boxSizing: 'border-box',
                    }}
                    onFocus={e => !errors.password && (e.target.style.borderColor = C.teal)}
                    onBlur={e  => !errors.password && (e.target.style.borderColor = '#DDE6E2')}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: C.gray, background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ fontSize: 11, color: C.red, marginTop: 3 }}>
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Olvidé contraseña */}
              <div style={{ textAlign: 'right', marginBottom: 22 }}>
                <span style={{ fontSize: 12, color: C.teal, cursor: 'pointer', fontWeight: 500 }}>
                  ¿Olvidaste tu contraseña?
                </span>
              </div>

              {/* Submit */}
              <motion.button
                type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                style={{
                  width: '100%', padding: '12px 20px',
                  background: loading ? C.tealMid : C.teal,
                  color: 'white', borderRadius: 11, border: 'none',
                  fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.18s',
                  boxShadow: loading ? 'none' : '0 4px 18px rgba(29,158,117,0.38)',
                }}
              >
                {loading
                  ? <><Loader2 size={17} style={{ animation: 'spin 0.8s linear infinite' }} /> Entrando...</>
                  : <>Iniciar sesión <ArrowRight size={17} /></>}
              </motion.button>
            </form>

            {/* Separador */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#E0E8E5' }} />
              <span style={{ margin: '0 12px', fontSize: 12, color: C.gray, fontWeight: 500 }}>O continuar con</span>
              <div style={{ flex: 1, height: 1, background: '#E0E8E5' }} />
            </div>

            {/* Botones Sociales */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
              <motion.button
                onClick={async () => {
                  try { setAuthError(''); await loginWithGoogle() }
                  catch (err) { setAuthError(err.message) }
                }}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.96 }}
                style={{
                  flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'none', border: '1.5px solid #DDE6E2', borderRadius: 11, cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: 600, color: C.slateDark, transition: '0.2s',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                Google
              </motion.button>
              
              <motion.button
                onClick={async () => {
                  try { setAuthError(''); await loginWithApple() }
                  catch (err) { setAuthError(err.message) }
                }}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.96 }}
                style={{
                  flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'none', border: '1.5px solid #DDE6E2', borderRadius: 11, cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: 600, color: C.slateDark, transition: '0.2s',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.365 21.43c-1.127.818-2.316.85-3.411.04-.985-.71-2.42-.72-3.43-.02-1.07.75-2.27.79-3.43-.05-1.78-1.28-4.48-5.32-4.48-9.92 0-3.66 1.93-6.17 4.29-6.9.99-.3 2.52-.3 3.51.04 1.1.37 2.37.5 3.36.03 1.02-.48 2.65-.67 4.24-.12 1.48.51 2.57 1.57 3.14 2.8-2.49 1.14-2.8 4.26-.64 5.76-.74 2.15-2.02 4.67-3.14 8.35zm-4.73-19.16c.3 1.9-1.26 3.86-3.23 4.26-.53-2.06 1.41-4.22 3.23-4.26z"/></svg>
                Apple
              </motion.button>
            </div>

            <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: C.gray }}>
              ¿No tienes cuenta?{' '}
              <Link to="/register" style={{ color: C.teal, fontWeight: 600 }}>Regístrate gratis</Link>
            </p>
          </div>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}