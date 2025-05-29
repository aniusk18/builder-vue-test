// src/api/useBuilderContentById.ts
import { ref, onMounted } from 'vue';

export function useBuilderContentById(contentId: string) {
  const content = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const API_KEY = import.meta.env.VITE_BUILDER_API_KEY;

  onMounted(async () => {
    try {
      const res = await fetch(
        `https://cdn.builder.io/api/v3/content/page/${contentId}?apiKey=${API_KEY}`
      );
      const json = await res.json();
      content.value = json;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  });

  return { content, loading, error };
}
