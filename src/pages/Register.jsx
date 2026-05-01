import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Lock, Eye, EyeOff, PawPrint,
  AlertCircle, CheckCircle2, ArrowRight, Loader2, Star, Clock, Users
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { registerSchema } from '../utils/validators'
import petImg from '../assets/PetCareV.webp'

const C = {
  teal: '#1D9E75', tealLight: '#E1F5EE', tealMid: '#5DCAA5',
  orange: '#E07B3F', orangeLight: '#FDEEDE',
  slate: '#3D4E4B', slateDark: '#2C3836',
  gray: '#7A8A87', white: '#FFFFFF', grayBg: '#F0F4F2',
  red: '#E24B4A', redLight: '#FCEBEB',
  green: '#1D9E75',
}

const perks = [
  { icon: Star,  text: 'Gratis para siempre — sin tarjeta'   },
  { icon: Clock, text: 'Configura tu perfil en menos de 2 min' },
  { icon: Users, text: 'Añade todas las mascotas que quieras'  },
]

function PasswordStrength({ password }) {
  if (!password) return null
  const checks = [
    { label: 'Mín. 8 caracteres', ok: password.length >= 8 },
    { label: 'Una mayúscula',      ok: /[A-Z]/.test(password) },
    { label: 'Un número',          ok: /[0-9]/.test(password) },
  ]
  const score  = checks.filter(c => c.ok).length
  const colors = ['#E24B4A', '#F7C34A', '#1D9E75']

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < score ? colors[score - 1] : '#E0E8E5', transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {checks.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: c.ok ? C.green : C.gray }}>
            <CheckCircle2 size={10} color={c.ok ? C.green : '#D0D8D4'} />{c.label}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: C.slate, display: 'block', marginBottom: 5 }}>{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontSize: 11, color: C.red, marginTop: 3 }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Register() {
  const { register: registerUser, loginWithGoogle, loginWithApple, loading } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [authError, setAuthError]     = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const passwordValue = watch('password', '')

  const inputStyle = (hasError) => ({
    width: '100%', padding: '10px 13px 10px 38px',
    border: `1.5px solid ${hasError ? C.red : '#DDE6E2'}`,
    borderRadius: 10, fontSize: 14, color: C.slateDark,
    outline: 'none', background: hasError ? C.redLight : C.white,
    transition: 'border-color 0.18s', boxSizing: 'border-box',
  })

  const iconStyle = { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }

  const onSubmit = async (data) => {
    setAuthError('')
    try {
      await registerUser(data.name, data.email, data.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setAuthError(err.message || 'Error al crear la cuenta')
    }
  }

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
  const itemVariants = { hidden: { opacity: 0, x: 14 }, visible: { opacity: 1, x: 0 } }

  return (
    /* ── Fondo ─────────────────────────────────────────────────── */
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
      background: `radial-gradient(ellipse at 40% 55%, ${C.orangeLight} 0%, #EEF3F1 50%, ${C.tealLight} 100%)`,
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
          minHeight: 620,
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
            src={petImg} alt="PetCare"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
          />
          {/* Overlay — tono naranja/teal para diferenciarlo del login */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(155deg, rgba(224,123,63,0.78) 0%, rgba(29,158,117,0.62) 45%, rgba(44,56,54,0.90) 100%)',
          }} />

          <div style={{
            position: 'relative', zIndex: 1,
            height: '100%', display: 'flex', flexDirection: 'column',
            padding: '36px 36px',
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, background: 'rgba(255,255,255,0.18)',
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
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{ fontSize: 28, fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: 12 }}
              >
                Empieza hoy a<br />cuidar a tus<br />
                <span style={{ color: '#FFD88A' }}>compañeros</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.42 }}
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.76)', lineHeight: 1.7, maxWidth: 240, marginBottom: 28 }}
              >
                Únete a miles de dueños que cuidan a sus mascotas con PetCare Connect.
              </motion.p>

              {perks.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
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
              padding: '12px 16px', background: 'rgba(255,255,255,0.10)',
              borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(6px)',
            }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', margin: 0 }}>
                ✅ Sin anuncios · Sin límites · <strong style={{ color: 'white' }}>Siempre gratis</strong>
              </p>
            </div>
          </div>
        </div>

        {/* ── Mitad derecha — formulario ───────────────────────── */}
        <div style={{
          flex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '36px 44px',
          overflowY: 'auto',
        }}>
          <div style={{ width: '100%', maxWidth: 340 }}>

            <motion.div
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              style={{ marginBottom: 22 }}
            >
              <h1 style={{ fontSize: 22, fontWeight: 700, color: C.slateDark, marginBottom: 4 }}>Crea tu cuenta</h1>
              <p style={{ fontSize: 13, color: C.gray }}>Registra a tus mascotas y lleva su salud al día</p>
            </motion.div>

            {/* Error global */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: C.redLight, border: `1px solid ${C.red}33`,
                    borderRadius: 10, padding: '10px 13px', marginBottom: 16,
                    fontSize: 13, color: C.red,
                  }}
                >
                  <AlertCircle size={15} color={C.red} />{authError}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              onSubmit={handleSubmit(onSubmit)} noValidate
              variants={containerVariants} initial="hidden" animate="visible"
            >
              {/* Nombre */}
              <motion.div variants={itemVariants}>
                <Field label="Nombre completo" error={errors.name?.message}>
                  <div style={{ position: 'relative' }}>
                    <User size={15} color={C.gray} style={iconStyle} />
                    <input {...register('name')} type="text" placeholder="Carlos García" autoComplete="name"
                      style={inputStyle(!!errors.name)}
                      onFocus={e => !errors.name && (e.target.style.borderColor = C.teal)}
                      onBlur={e  => !errors.name && (e.target.style.borderColor = '#DDE6E2')} />
                  </div>
                </Field>
              </motion.div>

              {/* Email */}
              <motion.div variants={itemVariants}>
                <Field label="Email" error={errors.email?.message}>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color={C.gray} style={iconStyle} />
                    <input {...register('email')} type="email" placeholder="carlos@email.com" autoComplete="email"
                      style={inputStyle(!!errors.email)}
                      onFocus={e => !errors.email && (e.target.style.borderColor = C.teal)}
                      onBlur={e  => !errors.email && (e.target.style.borderColor = '#DDE6E2')} />
                  </div>
                </Field>
              </motion.div>

              {/* Contraseña */}
              <motion.div variants={itemVariants}>
                <Field label="Contraseña" error={errors.password?.message}>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color={C.gray} style={iconStyle} />
                    <input {...register('password')} type={showPass ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres" autoComplete="new-password"
                      style={{ ...inputStyle(!!errors.password), paddingRight: 40 }}
                      onFocus={e => !errors.password && (e.target.style.borderColor = C.teal)}
                      onBlur={e  => !errors.password && (e.target.style.borderColor = '#DDE6E2')} />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: C.gray, background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <PasswordStrength password={passwordValue} />
                </Field>
              </motion.div>

              {/* Confirmar */}
              <motion.div variants={itemVariants}>
                <Field label="Confirmar contraseña" error={errors.confirmPassword?.message}>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color={C.gray} style={iconStyle} />
                    <input {...register('confirmPassword')} type={showConfirm ? 'text' : 'password'}
                      placeholder="Repite la contraseña" autoComplete="new-password"
                      style={{ ...inputStyle(!!errors.confirmPassword), paddingRight: 40 }}
                      onFocus={e => !errors.confirmPassword && (e.target.style.borderColor = C.teal)}
                      onBlur={e  => !errors.confirmPassword && (e.target.style.borderColor = '#DDE6E2')} />
                    <button type="button" onClick={() => setShowConfirm(p => !p)}
                      style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: C.gray, background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>
              </motion.div>

              {/* Términos */}
              <motion.p variants={itemVariants} style={{ fontSize: 11, color: C.gray, marginBottom: 18, lineHeight: 1.6 }}>
                Al registrarte aceptas nuestros{' '}
                <span style={{ color: C.teal, cursor: 'pointer', fontWeight: 600 }}>Términos de uso</span>
                {' '}y la{' '}
                <span style={{ color: C.teal, cursor: 'pointer', fontWeight: 600 }}>Política de privacidad</span>
              </motion.p>

              {/* Submit */}
              <motion.div variants={itemVariants}>
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.97 }}
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
                    ? <><Loader2 size={17} style={{ animation: 'spin 0.8s linear infinite' }} /> Creando cuenta...</>
                    : <>Crear cuenta <ArrowRight size={17} /></>}
                </motion.button>
              </motion.div>
            </motion.form>

            {/* Separador */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#E0E8E5' }} />
              <span style={{ margin: '0 12px', fontSize: 12, color: C.gray, fontWeight: 500 }}>O registrarse con</span>
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

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: C.gray }}>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" style={{ color: C.teal, fontWeight: 600 }}>Inicia sesión</Link>
            </p>
          </div>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}