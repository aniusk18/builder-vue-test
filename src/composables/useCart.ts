import { ref, computed, watch } from 'vue'
import { useSupabase } from './useSupabase'
import { useAuth } from './useAuth'
import type { CartItemWithProduct } from '../lib/supabase'

export function useCart() {
  const { user } = useAuth()
  const { 
    getCartItems, 
    addToCart: addToCartDB, 
    updateCartItemQuantity, 
    removeFromCart: removeFromCartDB,
    clearCart: clearCartDB,
    loading 
  } = useSupabase()

  const cartItems = ref<CartItemWithProduct[]>([])
  const isCartOpen = ref(false)

  // Computed properties
  const cartItemCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const cartTotal = computed(() => {
    return cartItems.value.reduce((total, item) => {
      return total + (item.productos.price * item.quantity)
    }, 0)
  })

  // Methods
  const loadCart = async () => {
    if (!user.value?.uid) return
    
    try {
      cartItems.value = await getCartItems(user.value.uid)
    } catch (error) {
      console.error('Error loading cart:', error)
    }
  }

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user.value?.uid) return false
    
    const success = await addToCartDB(user.value.uid, productId, quantity)
    if (success) {
      await loadCart()
    }
    return success
  }

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    const success = await updateCartItemQuantity(cartItemId, quantity)
    if (success) {
      await loadCart()
    }
    return success
  }

  const removeFromCart = async (cartItemId: string) => {
    const success = await removeFromCartDB(cartItemId)
    if (success) {
      await loadCart()
    }
    return success
  }

  const clearCart = async () => {
    if (!user.value?.uid) return false
    
    const success = await clearCartDB(user.value.uid)
    if (success) {
      cartItems.value = []
    }
    return success
  }

  const toggleCart = () => {
    isCartOpen.value = !isCartOpen.value
  }

  // Watch for user changes and load cart
  watch(user, async (newUser) => {
    if (newUser) {
      await loadCart()
    } else {
      cartItems.value = []
    }
  }, { immediate: true })

  return {
    cartItems,
    cartItemCount,
    cartTotal,
    isCartOpen,
    loading,
    loadCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleCart
  }
}