import { useAuth0 } from '@auth0/auth0-vue'
import { computed, watch } from 'vue'
import { useSupabase } from './useSupabase'

export function useAuth() {
  const {
    user: auth0User,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: auth0Logout
  } = useAuth0()

  const { createOrUpdateUser } = useSupabase()

  // Transform Auth0 user to match your existing user structure
  const user = computed(() => {
    if (!isAuthenticated.value || !auth0User.value) return null
    
    return {
      uid: auth0User.value.sub,
      email: auth0User.value.email,
      emailVerified: auth0User.value.email_verified,
      displayName: auth0User.value.name || auth0User.value.nickname,
      photoURL: auth0User.value.picture,
      phoneNumber: auth0User.value.phone_number,
      providerId: 'auth0',
      metadata: {
        creationTime: auth0User.value.created_at,
        lastSignInTime: auth0User.value.updated_at,
      },
    }
  })

  // Watch for user changes and sync with Supabase
  watch(auth0User, async (newUser) => {
    if (newUser && isAuthenticated.value) {
      await createOrUpdateUser(newUser)
    }
  }, { immediate: true })

  const login = () => {
    loginWithRedirect()
  }

  const logout = () => {
    auth0Logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    })
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout
  }
}