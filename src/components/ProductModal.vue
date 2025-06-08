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
                  <!-- Close Button -->
                  <button 
                    @click="$emit('close')"
                    class="close-button"
                    aria-label="Close modal"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <div class="space-y-2">
                  <p class="text-xs text-zinc-600 dark:text-zinc-300">{{ product.description }}</p>
                  <div class="text-xs space-y-1">
                    <p class="text-zinc-500">SKU: {{ product.id }}</p>
                    <p class="text-zinc-500">Stock: Available</p>
                  </div>
                </div>
                <div class="quantity-section">
              <label for="quantity" class="quantity-label">Quantity:</label>
              <div class="quantity-controls">
                <button 
                  @click="decreaseQuantity"
                  :disabled="quantity <= 1"
                  class="quantity-btn"
                >
                  -
                </button>
                <input 
                  id="quantity"
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  max="99"
                  class="quantity-input "
                />
                <button 
                  @click="increaseQuantity"
                  :disabled="quantity >= 99"
                  class="quantity-btn"
                >
                  +
                </button>
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

<script>
import { ref, onMounted, onUnmounted } from 'vue'

import { X } from 'lucide-vue-next'
export default {
  name: 'ProductModal',
  props: {
    product: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'add-to-cart'],
  setup(props, { emit }) {
    // State
    const quantity = ref(1)
    const isLoading = ref(false)

    // Methods
    const handleOverlayClick = () => {
      emit('close')
    }

    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--
      }
    }

    const increaseQuantity = () => {
      if (quantity.value < 99) {
        quantity.value++
      }
    }

    const handleAddToCartModal = async () => {
      if (!props.product) return
      
      isLoading.value = true
      
      try {
        console.log('paso por handleAddToCartModal')
        emit('add-to-cart', props.product, quantity.value)
      } finally {
        isLoading.value = false
      }
    }

    // Handle ESC key
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        emit('close')
      }
    }

    // Lifecycle
    onMounted(() => {
      document.addEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'hidden' // Prevent background scroll
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = '' // Restore scroll
    })

    return {
      quantity,
      isLoading,
      handleOverlayClick,
      decreaseQuantity,
      increaseQuantity,
      handleAddToCartModal
    }
  }
}
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

.quantity-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0rem;
}



.quantity-controls {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  overflow: hidden;
}

.quantity-btn {
  background: #f9fafb;
  border: none;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 600;
  color: #374151;
  transition: background-color 0.2s;
}

.quantity-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  border: none;
  width: 3rem;
  height: 1.5rem;
  text-align: center;
  font-weight: 500;
  outline: none;
  color: #111827;
}
</style>