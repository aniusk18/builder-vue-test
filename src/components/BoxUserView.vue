<template>
  
  <section  v-if="user  || isPreviewMode">
    <!-- The slot will render any child blocks from Builder -->
    <slot />
  </section>
</template>

<script>
import { computed } from 'vue'
import { useAuth } from '../composables/useAuth'

export default {
  name: 'BoxUserView',
  props: {
    showDebug: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    // Usar el composable directamente - obtiene user y preview automáticamente
    const { user, isPreviewMode } = useAuth()

    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch (error) {
        return 'Invalid date'
      }
    }

    return {
      user,
      preview: isPreviewMode, // Alias para mantener compatibilidad con tu template
      isPreviewMode,
      formatDate
    }
  }
}
</script>

<style scoped>
</style>