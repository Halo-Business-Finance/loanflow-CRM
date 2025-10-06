import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { SecurityManager } from '@/lib/security'

interface AuthContextType {
  user: User | null
  session: Session | null
  userRole: string | null
  userRoles: string[]
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  signOut: () => Promise<void>
  hasRole: (role: string) => boolean
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    
    // Set up auth state listener FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        // Clear OAuth flag on successful auth
        if (session?.user) {
          localStorage.removeItem('oauth_in_progress');
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          // Defer role fetching to avoid deadlock
          setTimeout(() => {
            if (mounted) {
              fetchUserRole(session.user.id)
            }
          }, 0)
        } else {
          setUserRole(null)
        }
        setLoading(false)
      }
    })

    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (mounted && !error) {
          setSession(session)
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchUserRole(session.user.id)
          } else {
            setUserRole(null)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Session check failed:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkSession()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])


  const fetchUserRole = async (userId: string) => {
    try {
      // Fetch ALL user roles instead of just one
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching user roles:', error)
        setUserRole('agent')
        setUserRoles(['agent'])
        return
      }

      // Extract all roles
      const roles = data?.map((r: { role: string }) => r.role) || []
      
      // Determine primary role (highest in hierarchy)
      const roleHierarchy = ['tech', 'closer', 'underwriter', 'funder', 'loan_processor', 'loan_originator', 'agent', 'manager', 'admin', 'super_admin']
      const primaryRole = roles.length > 0 
        ? roles.reduce((highest, current) => {
            const highestIndex = roleHierarchy.indexOf(highest)
            const currentIndex = roleHierarchy.indexOf(current)
            return currentIndex > highestIndex ? current : highest
          }, roles[0])
        : 'agent'

      setUserRole(primaryRole)
      setUserRoles(roles.length > 0 ? roles : ['agent'])
    } catch (error) {
      console.error('Error fetching user roles:', error)
      setUserRole('agent')
      setUserRoles(['agent'])
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with email:', email)
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Sign in response:', { error, data })
      if (error) {
        // Check for common auth errors and provide better messages
        if (error.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password. Please check your credentials and try again.')
        }
        throw error
      }

      // Log successful login (optional - can be done in background)
      try {
        await supabase.functions.invoke('audit-log', {
          body: {
            action: 'user_login',
            table_name: 'auth.users',
          }
        })
      } catch (auditError) {
        console.log('Audit logging failed (non-critical):', auditError)
      }

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (error) {
        throw error;
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      })
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const signOut = async () => {
    console.log('signOut function called')
    try {
      console.log('Attempting to log logout...')
      // Log logout
      await supabase.functions.invoke('audit-log', {
        body: {
          action: 'user_logout',
          table_name: 'auth.users',
        }
      })

      console.log('Attempting Supabase signOut...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase signOut error:', error)
        throw error
      }

      console.log('SignOut successful, showing toast...')
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      })
    } catch (error: any) {
      console.error('SignOut catch block error:', error)
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const hasRole = (role: string) => {
    if (!userRoles || userRoles.length === 0) return false
    
    // Check if user has this specific role
    if (userRoles.includes(role)) return true
    
    // Check if user has super_admin (has access to everything)
    if (userRoles.includes('super_admin')) return true
    
    // If checking for super_admin specifically, only super_admin can have it
    if (role === 'super_admin') return userRoles.includes('super_admin')
    
    // Role hierarchy: super_admin > admin > manager > agent/loan_originator/loan_processor/funder/underwriter/closer > tech
    const roleHierarchy = ['tech', 'closer', 'underwriter', 'funder', 'loan_processor', 'loan_originator', 'agent', 'manager', 'admin', 'super_admin']
    
    // Find highest role user has
    const highestUserRole = userRoles.reduce((highest, current) => {
      const highestIndex = roleHierarchy.indexOf(highest)
      const currentIndex = roleHierarchy.indexOf(current)
      return currentIndex > highestIndex ? current : highest
    }, userRoles[0])
    
    const userRoleIndex = roleHierarchy.indexOf(highestUserRole)
    const requiredRoleIndex = roleHierarchy.indexOf(role)
    
    // If role not found in hierarchy, deny access
    if (requiredRoleIndex === -1) return false
    
    return userRoleIndex >= requiredRoleIndex
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`
      })
      
      if (error) throw error
      
      toast({
        title: "Password reset sent",
        description: "Check your email for password reset instructions.",
      })
    } catch (error: any) {
      console.error('Password reset error:', error)
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const value = {
    user,
    session,
    userRole,
    userRoles,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}