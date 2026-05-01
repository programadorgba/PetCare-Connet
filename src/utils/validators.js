import { z } from 'zod'

// ─── Sanitizar strings (evitar XSS básico) ────────────────────────────────────
const sanitize = (val) => val.replace(/[<>'"]/g, '')

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Email no válido')
    .max(100, 'Email demasiado largo')
    .transform(v => v.toLowerCase().trim()),
  password: z
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .max(72, 'Contraseña demasiado larga'),  // bcrypt max
})

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Nombre demasiado largo')
    .transform(sanitize),
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Email no válido')
    .max(100, 'Email demasiado largo')
    .transform(v => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .max(72, 'Contraseña demasiado larga')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contraseña'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})