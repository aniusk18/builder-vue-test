import { useAuth0 } from '@auth0/auth0-vue'
import { computed, watch, ref } from 'vue'
import { useSupabase } from './useSupabase'
import { isPreviewing } from '@builder.io/sdk-vue'

// Mock user para Builder.io preview
const MOCK_USER = {
  uid: 'preview_user_123',
  sub: 'auth0|preview_user_123', // Auth0 usa 'sub' como ID principal
  email: 'preview@builder.io',
  emailVerified: true,
  displayName: 'Preview User',
  name: 'Preview User',
  nickname: 'preview_user',
  photoURL: 'https://i.pravatar.cc/150?u=preview@builder.io',
  picture: 'https://i.pravatar.cc/150?u=preview@builder.io',
  phoneNumber: '+1-555-0123',
  providerId: 'auth0',
  metadata: {
    creationTime: 'Mon, 01 Jan 2024 00:00:00 GMT',
    lastSignInTime: new Date().toISOString(),
  },
  // Propiedades adicionales que podrían necesitarse
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: new Date().toISOString(),
  email_verified: true,
  phone_number: '+1-555-0123'
}

export function useAuth() {
  const {
    user: auth0User,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: auth0Logout
  } = useAuth0()

  const { createOrUpdateUser } = useSupabase()
  
  const isPreviewMode = ref(false)

  // Check if we're in preview mode
  const checkPreviewMode = () => {
    const previewing = isPreviewing()
    isPreviewMode.value = previewing
    return previewing
  }

  // Initialize preview mode check
  const initialize = () => {
    checkPreviewMode()
  }

  // Transform Auth0 user to match your existing user structure
  const user = computed(() => {
    const previewing = checkPreviewMode()
    
    if (previewing) {
      console.log('🎭 Using mock user for Builder.io preview')
      return MOCK_USER
    }

    if (!isAuthenticated.value || !auth0User.value) {
      console.log('👤 No authenticated user')
      return null
    }
    
    return {
      uid: auth0User.value.uid,
      sub: auth0User.value.sub, // Mantener ambos para compatibilidad
      email: auth0User.value.email,
      emailVerified: auth0User.value.email_verified,
      displayName: auth0User.value.name || auth0User.value.nickname,
      name: auth0User.value.name || auth0User.value.nickname,
      nickname: auth0User.value.nickname,
      photoURL: auth0User.value.picture,
      picture: auth0User.value.picture,
      phoneNumber: auth0User.value.phone_number,
      phone_number: auth0User.value.phone_number,
      providerId: 'auth0',
      metadata: {
        creationTime: auth0User.value.created_at,
        lastSignInTime: auth0User.value.updated_at,
      },
      created_at: auth0User.value.created_at,
      updated_at: auth0User.value.updated_at,
      email_verified: auth0User.value.email_verified
    }
  })

  // Computed for loading state
  const computedIsLoading = computed(() => {
    const previewing = checkPreviewMode()
    
    if (previewing) {
      console.log('🎭 Preview mode - not loading')
      return false // En preview mode nunca está "loading"
    }
    
    return isLoading.value
  })

  // Computed for authenticated state
  const computedIsAuthenticated = computed(() => {
    const previewing = checkPreviewMode()
    
    if (previewing) {
      console.log('🎭 Preview mode - always authenticated')
      return true // En preview mode siempre está "autenticado"
    }
    
    return isAuthenticated.value
  })

  // Watch for user changes and sync with Supabase (solo en modo producción)
  watch(auth0User, async (newUser) => {
    const previewing = checkPreviewMode()
    
    if (previewing) {
      console.log('🎭 Preview mode - skipping Supabase sync')
      return
    }

    if (newUser && isAuthenticated.value) {
      await createOrUpdateUser(newUser)
    }
  }, { immediate: true })

  const login = () => {
    const previewing = checkPreviewMode()
    
    if (previewing) {
      console.log('🎭 Preview mode - login not available')
      alert('Login is not available in Builder.io preview mode')
      return
    }
    
    loginWithRedirect()
  }

  const logout = () => {
    const previewing = checkPreviewMode()
    
    if (previewing) {
      console.log('🎭 Preview mode - logout not available')
      alert('Logout is not available in Builder.io preview mode')
      return
    }
    
    auth0Logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    })
  }

  // Initialize immediately
  initialize()

  return {
    user,
    isLoading: computedIsLoading,
    isAuthenticated: computedIsAuthenticated,
    isPreviewMode,
    login,
    logout
  }
}