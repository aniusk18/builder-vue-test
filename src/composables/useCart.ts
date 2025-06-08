import { ref, computed, watch, onMounted } from 'vue'
import { useSupabase } from './useSupabase'
import { useAuth } from './useAuth'
import { isPreviewing } from '@builder.io/sdk-vue'
import type { CartItemWithProduct } from '../lib/supabase'

// Mock data para Builder.io preview
const MOCK_CART_ITEMS = [
  {
    id: 'mock_cart_1',
    user_id: 'preview_user',
    product_id: 'p1',
    quantity: 2,
    added_at: new Date().toISOString(),
    productos: {
      id: 'p1',
      name: 'TEST - Minimal Desk Lamp',
      description: 'A sleek and modern desk lamp with adjustable brightness and color temperature.',
      price: 89,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      category: 'Lighting'
    }
  },
  {
    id: 'mock_cart_2',
    user_id: 'preview_user',
    product_id: 'p2',
    quantity: 1,
    added_at: new Date().toISOString(),
    productos: {
      id: 'p2',
      name: 'Ceramic Coffee Set',
      description: 'Handcrafted ceramic coffee set including 4 cups and a matching pour-over dripper.',
      price: 65,
      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      category: 'Kitchenware'
    }
  }
]

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
  const isPreviewMode = ref(false)

  // Computed properties
  const cartItemCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const cartTotal = computed(() => {
    return cartItems.value.reduce((total, item) => {
      const price = item.productos.price
      return total + (price * item.quantity)
    }, 0)  })

  // Check if we're in preview mode
  const checkPreviewMode = () => {
    const previewing = isPreviewing()
    isPreviewMode.value = previewing
    return previewing
  }

  // Initialize - llamar inmediatamente al crear el composable
  const initialize = () => {
    const previewing = checkPreviewMode()
    
    if (previewing) {
      console.log('🎭 Preview mode detected - loading mock cart immediately')
      cartItems.value = [...MOCK_CART_ITEMS]
      console.log('🎭 Mock cart loaded:', cartItems.value)
    } else {
      console.log('🏠 Production mode - will load real cart when user is available')
    }
  }

  // Methods
  const loadCart = async () => {
    const previewing = checkPreviewMode()
    
    if (previewing) {
      console.log('🎭 Loading mock cart for Builder.io preview')
      cartItems.value = [...MOCK_CART_ITEMS]
      console.log('🎭 Mock cart items:', cartItems.value)
      return
    }

    if (!user.value?.sub) {
      console.log('No user found, skipping cart load')
      return
    }
    
    try {
      console.log('🛒 Loading real cart for user:', user.value.sub)
      const rawItems = await getCartItems(user.value.sub)
      cartItems.value = rawItems
      console.log('🛒 Cart loaded:', cartItems.value)
    } catch (error) {
      console.error('Error loading cart:', error)
      cartItems.value = []
    }
  }

  const addToCart = async (productId: string, quantity: number = 1) => {
    const previewing = checkPreviewMode()
    
    if (previewing) {
      console.log('🎭 Mock add to cart:', productId, quantity)
      
      // Simular agregar al carrito mock
      const existingItem = cartItems.value.find(item => item.product_id === productId)
      
      if (existingItem) {
        existingItem.quantity += quantity
        console.log('🎭 Updated existing mock item:', existingItem)
      } else {
        // Crear un item mock
        const mockItem = {
          id: `mock_cart_${Date.now()}`,
          user_id: 'preview_user',
          product_id: productId,
          quantity,
          added_at: new Date().toISOString(),
          productos: {
            id: productId,
            name: `Mock Product ${productId}`,
            description: 'Mock product for Builder.io preview',
            price: 50,
            image: 'https://via.placeholder.com/150',
            category: 'Mock'
          }
        }
        cartItems.value.push(mockItem)
        console.log('🎭 Added new mock item:', mockItem)
      }
      
      return true
    }

    if (!user.value?.uid) {
      console.log('No user found, cannot add to cart')
      return false
    }
    
    console.log('🛒 Adding to real cart:', productId, 'quantity:', quantity)
    const success = await addToCartDB(user.value.uid, productId, quantity)
    
    if (success) {
      console.log('✅ Added to cart, reloading...')
      await loadCart()
    } else {
      console.error('❌ Failed to add to cart')
    }
    
    return success
  }

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    const previewing = checkPreviewMode()
    
    if (previewing) {
      console.log('🎭 Mock update quantity:', cartItemId, quantity)
      const item = cartItems.value.find(item => item.id === cartItemId)
      if (item) {
        if (quantity <= 0) {
          cartItems.value = cartItems.value.filter(item => item.id !== cartItemId)
        } else {
          item.quantity = quantity
        }
      }
      return true
    }

    const success = await updateCartItemQuantity(cartItemId, quantity)
    if (success) {
      await loadCart()
    }
    return success
  }

  const removeFromCart = async (cartItemId: string) => {
    const previewing = checkPreviewMode()
    
    if (previewing) {
      console.log('🎭 Mock remove from cart:', cartItemId)
      cartItems.value = cartItems.value.filter(item => item.id !== cartItemId)
      return true
    }

    console.log('🗑️ Removing from real cart:', cartItemId)
    const success = await removeFromCartDB(cartItemId)
    if (success) {
      console.log('✅ Removed from cart, reloading...')
      await loadCart()
    }
    return success
  }

  const clearCart = async () => {
    const previewing = checkPreviewMode()
    
    if (previewing) {
      console.log('🎭 Mock clear cart')
      cartItems.value = []
      return true
    }

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

  // Inicializar inmediatamente
  initialize()

  // Watch for user changes and load cart (solo para modo producción)
  watch(user, async (newUser) => {
    const previewing = checkPreviewMode()
    
    if (previewing) {
      console.log('👤 Preview mode - keeping mock cart')
      return
    }

    if (newUser) {
      console.log('👤 User changed, loading real cart...')
      await loadCart()
    } else {
      console.log('👤 User logged out, clearing cart...')
      cartItems.value = []
    }
  }, { immediate: false }) // No immediate para evitar conflicto con initialize()

  return {
    cartItems,
    cartItemCount,
    cartTotal,
    isCartOpen,
    isPreviewMode,
    loading,
    loadCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleCart
  }
}
// Función para normalizar los datos del carrito
const normalizeCartItem = (item: {
  id: string
  produtos?: {
    name: string
    price: number
    image: string
    description: string
    category: string
  }
  product_id?: string
  quantity: number
  added_at: string
  cartItemId?: string
  productId?: string
  name?: string
  price?: number
  image?: string
  description?: string
  category?: string
}) => {
  console.log('🔄 Normalizing cart item:', item)
  console.log('🔄 Has produtos:', !!item.produtos)
  
  // Si tiene productos anidados (desde Supabase)
  if (item.produtos) {
    const normalized = {
      id: item.id,
      cartItemId: item.id, // ID del item en shopping_cart
      productId: item.product_id,
      name: item.produtos.name,
      price: item.produtos.price,
      image: item.produtos.image,
      description: item.produtos.description,
      category: item.produtos.category,
      quantity: item.quantity,
      added_at: item.added_at,
      // Mantener también la estructura original por si acaso
      produtos: item.produtos
    }
    console.log('🔄 Normalized with produtos:', normalized)
    return normalized
  }
  
  // Si ya tiene la estructura plana (local)
  const normalized = {
    id: item.id,
    cartItemId: item.cartItemId || item.id,
    productId: item.productId || item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    description: item.description,
    category: item.category,
    quantity: item.quantity,
    added_at: item.added_at
  }
  console.log('🔄 Normalized without produtos:', normalized)
  return normalized
}