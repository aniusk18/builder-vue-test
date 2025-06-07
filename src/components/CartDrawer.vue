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
              <h2 class="text-lg font-medium">Shopping Cart</h2>
              <button 
                @click="$emit('close')" 
                class="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              <div 
                v-for="item in cart" 
                :key="item.id" 
                class="flex gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
              >
                <img 
                  :src="item.image" 
                  :alt="item.name" 
                  class="w-24 h-24 object-cover rounded-md" 
                />
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start">
                    <h3 class="text-base font-medium truncate">{{ item.name }}</h3>
                    <button
                      @click="$emit('removeFromCart', item.id)"
                      class="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full ml-2"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                  <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Qty: {{ item.quantity }}</p>
                  <p class="text-base font-medium mt-1">${{ item.price * item.quantity }}</p>
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

<script>
import { computed } from 'vue'
import { X } from 'lucide-vue-next'

export default {
  name: 'CartDrawer',
  components: {
    X
  },
  props: {
    cart: {
      type: Array,
      required: true
    }
  },
  emits: ['close', 'removeFromCart'],
  setup(props) {
    const total = computed(() => {
      return props.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    })

    return {
      total
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

.drawer-enter-active, .drawer-leave-active {
  transition: transform 0.3s ease;
}
.drawer-enter-from, .drawer-leave-to {
  transform: translateX(100%);
}
</style>