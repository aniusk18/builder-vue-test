<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50">
      <!-- Backdrop -->
      <Transition name="backdrop">
        <div 
          class="fixed inset-0 bg-black/50"
          @click="$emit('close')"
        />
      </Transition>
      
      <!-- Drawer -->
      <Transition name="drawer">
        <div class="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white dark:bg-zinc-900 shadow-xl">
          <div class="flex flex-col h-full">
            <div class="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 class="text-lg font-medium">Shopping Cart ({{ cart.length }})</h2>
              <button 
                @click="$emit('close')" 
                class="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              <div v-if="cart.length === 0" class="text-center py-8 text-zinc-500">
                Your cart is empty
              </div>
              
              <div 
                v-for="item in cart" 
                :key="item.id" 
                class="flex gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
              >
                <!-- Imagen con acceso directo -->
                <div class="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                  <img 
                    v-if="item.productos?.image"
                    :src="item.productos.image" 
                    :alt="item.productos?.name || 'Product'" 
                    class="w-full h-full object-cover rounded-md" 
                  />
                  <div v-else class="text-gray-400 text-xs text-center">
                    No Image
                  </div>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start">
                    <!-- Nombre con acceso directo -->
                    <h3 class="text-base font-medium truncate">
                      {{ item.productos?.name || item.name || 'Unknown Product' }}
                    </h3>
                    <button
                      @click="$emit('removeFromCart', item.id)"
                      class="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full ml-2"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                  <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Qty: {{ item.quantity }}</p>
                  <!-- Precio con acceso directo -->
                  <p class="text-base font-medium mt-1">
                    ${{ (item.productos?.price || item.price || 0) * item.quantity }}
                  </p>
                </div>
              </div>
            </div>

            <div class="p-4 border-t border-zinc-200 dark:border-zinc-800">
              <div class="flex justify-between mb-4">
                <span class="text-base">Total</span>
                <span class="text-base font-medium">${{ total }}</span>
              </div>
              <button class="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-base font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                Checkout
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, toRaw } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  cart: {
    type: Array,
    required: true
  }
})

defineEmits(['close', 'removeFromCart'])

// Debug: Verificar qué datos llegan al componente
onMounted(() => {
  console.log('🛒 CartDrawer mounted with cart:', props.cart)
  props.cart.forEach((item, index) => {
    console.log(`🛒 CartDrawer item ${index}:`, toRaw(item))
    console.log(`🛒 CartDrawer item ${index} has productos:`, !!item.productos)
    console.log(`🛒 CartDrawer item ${index} productos:`, toRaw(item.productos))
  })
})

// Helper functions para obtener datos del item
const getItemName = (item) => {
  // Convertir a raw para evitar problemas con Proxy
  const rawItem = toRaw(item)
  console.log('🏷️ Getting name for raw item:', rawItem)
  
  let name = 'Unknown Product'
  
  if (rawItem.productos && rawItem.productos.name) {
    name = rawItem.productos.name
    console.log('🏷️ Name from productos:', name)
  } else if (rawItem.name) {
    name = rawItem.name
    console.log('🏷️ Name from item:', name)
  }
  
  console.log('🏷️ Final name:', name)
  return name
}

const getItemImage = (item) => {
  const rawItem = toRaw(item)
  console.log('🖼️ Getting image for raw item:', rawItem)
  
  let image = null
  
  if (rawItem.productos && rawItem.productos.image) {
    image = rawItem.productos.image
    console.log('🖼️ Image from productos:', image)
  } else if (rawItem.image) {
    image = rawItem.image
    console.log('🖼️ Image from item:', image)
  }
  
  console.log('🖼️ Final image:', image)
  return image
}

const getItemPrice = (item) => {
  const rawItem = toRaw(item)
  console.log('💰 Getting price for raw item:', rawItem)
  
  let price = 0
  
  if (rawItem.productos && rawItem.productos.price) {
    price = rawItem.productos.price
    console.log('💰 Price from productos:', price)
  } else if (rawItem.price) {
    price = rawItem.price
    console.log('💰 Price from item:', price)
  }
  
  console.log('💰 Final price:', price)
  return price
}

const total = computed(() => {
  return props.cart.reduce((sum, item) => {
    const price = getItemPrice(item)
    return sum + (price * item.quantity)
  }, 0)
})
</script>

<style scoped>
.backdrop-enter-active, .backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-enter-from, .backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active, .drawer-leave-active {
  transition: transform 0.3s ease;
}
.drawer-enter-from, .drawer-leave-to {
  transform: translateX(100%);
}
</style>