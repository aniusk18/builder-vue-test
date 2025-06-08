<template>
  <div 
    v-if="product" 
    class="modal-overlay"
    @click="handleOverlayClick"
  >
    <div class="modal-content" @click.stop>
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

      <div class="modal-body">
        <!-- Product Image -->
        <div class="image-container">
          <img 
            :src="product.image" 
            :alt="product.name"
            class="product-image"
          />
        </div>

        <!-- Product Details -->
        <div class="product-details">
          <div class="product-header">
            <h2 class="product-title">{{ product.name }}</h2>
            <p class="product-category">{{ product.category }}</p>
          </div>

          <p class="product-description">
            {{ product.description || 'No description available.' }}
          </p>

          <div class="product-footer">
            <div class="price-section">
              <span class="price">${{ product.price }}</span>
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

            <button 
              @click="handleAddToCartModal"
              class="add-to-cart-btn"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="loading-spinner"></span>
              {{ isLoading ? 'Adding...' : 'Add to Cart' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 4xl;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  color: #374151;
}

.close-button:hover {
  background: white;
  transform: scale(1.1);
}

.modal-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
}

.image-container {
  aspect-ratio: 1;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #f9fafb;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

.product-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.product-category {
  color: #6b7280;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.product-description {
  color: #374151;
  line-height: 1.6;
  font-size: 1rem;
}

.product-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.price-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.price {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-label {
  font-weight: 500;
  color: #374151;
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
  width: 2.5rem;
  height: 2.5rem;
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
  height: 2.5rem;
  text-align: center;
  font-weight: 500;
  outline: none;
  color: #111827;
}

.add-to-cart-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 3.5rem;
}

.add-to-cart-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.add-to-cart-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .modal-body {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .product-title {
    font-size: 1.5rem;
  }
  
  .price {
    font-size: 1.5rem;
  }
  
  .quantity-section {
    justify-content: space-between;
  }
}
</style>