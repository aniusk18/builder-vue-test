// src/api/useBuilderContentById.ts
import { ref, type Ref } from 'vue'
import { 
  fetchOneEntry, 
  type BuilderContent, 
  getBuilderSearchParams,
  isPreviewing 
} from '@builder.io/sdk-vue'

export function useBuilderContent(model: string) {
  const content: Ref<BuilderContent | null> = ref(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchContent = async (apiKey: string, userAttributes?: Record<string, any>) => {
    isLoading.value = true
    error.value = null
    
    try {
      const result = await fetchOneEntry({
        model,
        apiKey,
        options: getBuilderSearchParams(new URL(location.href).searchParams),
        userAttributes: userAttributes || {
          urlPath: window.location.pathname,
        },
      })
      
      // Aquí está la corrección del error de tipado
      content.value = result || null
      
    } catch (err) {
      console.error('Error fetching Builder content:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch content'
      content.value = null
    } finally {
      isLoading.value = false
    }
  }

  const canShowContent = () => {
    return content.value ? true : isPreviewing()
  }

  return {
    content,
    isLoading,
    error,
    fetchContent,
    canShowContent
  }
}
