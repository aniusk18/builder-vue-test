import { ref } from 'vue'
import { supabase, type Product, type User, type ShoppingCartItem, type CartItemWithProduct } from '../lib/supabase'

export function useSupabase() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Products - usando tabla 'productos'
  const getProducts = async (): Promise<Product[]> => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('productos')  // Cambiado de 'products' a 'productos'
        .select('*')
        .order('name')
      
      if (supabaseError) throw supabaseError
      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error fetching products'
      return []
    } finally {
      loading.value = false
    }
  }

  const getProductsByCategory = async (category: string): Promise<Product[]> => {
    loading.value = true
    error.value = null
    
    try {
      let query = supabase.from('productos').select('*')  // Cambiado a 'productos'
      
      if (category !== 'All') {
        query = query.eq('category', category)
      }
      
      const { data, error: supabaseError } = await query.order('name')
      
      if (supabaseError) throw supabaseError
      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error fetching products'
      return []
    } finally {
      loading.value = false
    }
  }

  // Users - usando tabla 'users'
  const createOrUpdateUser = async (auth0User: any): Promise<User | null> => {
    loading.value = true
    error.value = null
    
    try {
      const userData = {
        id: auth0User.sub,
        name: auth0User.name || auth0User.nickname,
        email: auth0User.email,
        created_at: auth0User.created_at || new Date().toISOString(),
        role: 'user',
        status: 'active'
      }

      const { data, error: supabaseError } = await supabase
        .from('users')  // Cambiado de 'auth0_user' a 'users'
        .upsert(userData, { onConflict: 'id' })
        .select()
        .single()
      
      if (supabaseError) throw supabaseError
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creating/updating user'
      return null
    } finally {
      loading.value = false
    }
  }

  // Shopping Cart
  const getCartItems = async (userId: string): Promise<CartItemWithProduct[]> => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('shopping_cart')
        .select(`
          *,
          productos (*)
        `)  // Join con tabla 'productos'
        .eq('user_id', userId)
        .order('added_at', { ascending: false })
      
      if (supabaseError) throw supabaseError
      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error fetching cart items'
      return []
    } finally {
      loading.value = false
    }
  }

  const addToCart = async (userId: string, productId: string, quantity: number = 1): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('shopping_cart')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()

      if (existingItem) {
        // Update quantity
        const { error: updateError } = await supabase
          .from('shopping_cart')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)
        
        if (updateError) throw updateError
      } else {
        // Insert new item - generar ID único
        const { error: insertError } = await supabase
          .from('shopping_cart')
          .insert({
            id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // ID único
            user_id: userId,
            product_id: productId,
            quantity,
            added_at: new Date().toISOString()
          })
        
        if (insertError) throw insertError
      }
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error adding to cart'
      return false
    } finally {
      loading.value = false
    }
  }

  const updateCartItemQuantity = async (cartItemId: string, quantity: number): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      if (quantity <= 0) {
        return await removeFromCart(cartItemId)
      }

      const { error: supabaseError } = await supabase
        .from('shopping_cart')
        .update({ quantity })
        .eq('id', cartItemId)
      
      if (supabaseError) throw supabaseError
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error updating cart item'
      return false
    } finally {
      loading.value = false
    }
  }

  const removeFromCart = async (cartItemId: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const { error: supabaseError } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('id', cartItemId)
      
      if (supabaseError) throw supabaseError
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error removing from cart'
      return false
    } finally {
      loading.value = false
    }
  }

  const clearCart = async (userId: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const { error: supabaseError } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('user_id', userId)
      
      if (supabaseError) throw supabaseError
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error clearing cart'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    // Products
    getProducts,
    getProductsByCategory,
    // Users
    createOrUpdateUser,
    // Cart
    getCartItems,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart
  }
}