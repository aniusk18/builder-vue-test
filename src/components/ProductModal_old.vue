<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50">
      <!-- Backdrop -->
      <Transition name="backdrop">
        <div 
          v-if="product"
          class="fixed inset-0 bg-black/50"
          @click="$emit('close')"
          aria-label="Close modal"
        />
      </Transition>
      
      <!-- Modal -->
      <Transition name="modal">
        <div 
          v-if="product"
          class="fixed inset-x-4 bottom-0 md:inset-[25%] z-50 bg-white dark:bg-zinc-900 rounded-t-xl md:rounded-xl overflow-hidden max-h-[80vh] md:max-h-[500px]"
        >
          <div class="h-full md:flex">
            <div class="relative md:w-2/5">
              <img 
                :src="product.image" 
                :alt="product.name" 
                class="w-full h-[200px] md:h-full object-cover" 
              />
              <button
                @click="$emit('close')"
                class="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-full"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <div class="p-3 md:w-3/5 flex flex-col">
              <div class="flex-1">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h2 class="text-sm font-medium">{{ product.name }}</h2>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ product.category }}</p>
                  </div>
                  <p class="text-sm font-medium">${{ product.price }}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-xs text-zinc-600 dark:text-zinc-300">{{ product.description }}</p>
                  <div class="text-xs space-y-1">
                    <p class="text-zinc-500">SKU: {{ product.id }}</p>
                    <p class="text-zinc-500">Stock: Available</p>
                  </div>
                </div>
              </div>
              <button
                @click="handleAddToCartModal"
                class="w-full mt-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next'

defineProps({
  product: {
    type: Object,
    default: null
  }
})

defineEmits(['close', 'addToCart'])
</script>

<style scoped>
.backdrop-enter-active, .backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-enter-from, .backdrop-leave-to {
  opacity: 0;
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>