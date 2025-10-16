import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { SecurityManager } from '@/lib/security'
import { sanitizeError, logSecureError } from '@/lib/error-sanitizer'

interface AuthContextType {
  user: User | null
  session: Session | null
  userRole: string | null
  userRoles: string[]
  loading: boolean
  isEmailVerified: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  signOut: () => Promise<void>
  hasRole: (role: string) => boolean
  resetPassword: (email: string) => Promise<void>
  resendVerificationEmail: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    
    // Set up auth state listener FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          // Defer role and verification fetching to avoid deadlock
          setTimeout(() => {
            if (mounted) {
              fetchUserRole(session.user.id)
              checkEmailVerification(session.user.id)
            }
          }, 0)
        } else {
          setUserRole(null)
          setIsEmailVerified(false)
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
            await checkEmailVerification(session.user.id)
          } else {
            setUserRole(null)
            setIsEmailVerified(false)
          }
          setLoading(false)
        }
      } catch (error) {
        logSecureError(error, 'Session check', supabase)
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


  const checkEmailVerification = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('is_email_verified', {
        p_user_id: userId
      })

      if (error) {
        console.error('Error checking email verification:', error)
        setIsEmailVerified(false)
        return
      }

      setIsEmailVerified(data === true)
    } catch (error) {
      console.error('Error in checkEmailVerification:', error)
      setIsEmailVerified(false)
    }
  }

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
        setUserRole('loan_originator')
        setUserRoles(['loan_originator'])
        return
      }

      // Extract all roles
      const roles = data?.map((r: { role: string }) => r.role) || []
      
      // Determine primary role (highest in hierarchy)
      const roleHierarchy = ['tech', 'closer', 'underwriter', 'funder', 'loan_processor', 'loan_originator', 'manager', 'admin', 'super_admin']
      const primaryRole = roles.length > 0 
        ? roles.reduce((highest, current) => {
            const highestIndex = roleHierarchy.indexOf(highest)
            const currentIndex = roleHierarchy.indexOf(current)
            return currentIndex > highestIndex ? current : highest
          }, roles[0])
        : 'loan_originator'

      setUserRole(primaryRole)
      setUserRoles(roles.length > 0 ? roles : ['loan_originator'])
    } catch (error) {
      console.error('Error fetching user roles:', error)
      setUserRole('loan_originator')
      setUserRoles(['loan_originator'])
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Check MFA requirement after successful login
      if (data?.user?.id) {
        try {
          await supabase.rpc('check_mfa_requirement', {
            p_user_id: data.user.id
          })
        } catch (mfaError) {
          logSecureError(mfaError, 'MFA check', supabase)
        }
      }

      // Log successful login
      try {
        await supabase.functions.invoke('audit-log', {
          body: {
            action: 'user_login',
            table_name: 'auth.users',
          }
        })
      } catch (auditError) {
        logSecureError(auditError, 'Audit logging', supabase)
      }

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      })
    } catch (error: any) {
      logSecureError(error, 'Sign in', supabase)
      toast({
        title: "Sign in failed",
        description: sanitizeError(error),
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
      logSecureError(error, 'Sign up', supabase)
      toast({
        title: "Sign up failed",
        description: sanitizeError(error),
        variant: "destructive",
      })
      throw error
    }
  }

  const signOut = async () => {
    try {
      // Log logout
      await supabase.functions.invoke('audit-log', {
        body: {
          action: 'user_logout',
          table_name: 'auth.users',
        }
      })

      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }

      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      })
    } catch (error: any) {
      logSecureError(error, 'Sign out', supabase)
      toast({
        title: "Sign out failed",
        description: sanitizeError(error),
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
    const roleHierarchy = ['tech', 'closer', 'underwriter', 'funder', 'loan_processor', 'loan_originator', 'manager', 'admin', 'super_admin']
    
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

  const resendVerificationEmail = async () => {
    if (!user?.email) {
      throw new Error('No user email found')
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      })

      if (error) throw error

      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      })
    } catch (error: any) {
      console.error('Resend verification error:', error)
      toast({
        title: "Failed to resend email",
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
    isEmailVerified,
    signIn,
    signUp,
    signOut,
    hasRole,
    resetPassword,
    resendVerificationEmail,
  }

  // Only render children when context value is fully available
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}