import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true) // Empieza true hasta que chequée la sesión inicial
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // 1. Cargar sesión inicial al refrescar la página
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (session?.user) {
          // Obtener datos extras desde nuestra tabla de base de datos 'profiles' (RLS asegura que solo ve lo suyo)
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          setUser({ ...session.user, ...profile })
        }
      } catch (err) {
        console.error('Error al inicializar sesión:', err)
      } finally {
        setLoading(false)
        setIsInitialized(true)
      }
    }

    initializeAuth()

    // 2. Suscribirse a cambios en la sesión (por ejemplo cuando expira el token o al hacer logout en otra pestaña)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true)
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          
        setUser({ ...session.user, ...profile })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // ── Login por Email/Contraseña ─────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data.user
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Registro por Email/Contraseña ──────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name
          }
        }
      })
      if (error) throw error
      return data.user
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Login OAuth Google ───────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) throw error
  }, [])

  // ── Login OAuth Apple ────────────────────────────────────────────────────
  const loginWithApple = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) throw error
  }, [])

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  // Muestra un estado de inicialización mientras Supabase verifica el token local
  if (!isInitialized) return null

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      register,
      loginWithGoogle,
      loginWithApple,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}