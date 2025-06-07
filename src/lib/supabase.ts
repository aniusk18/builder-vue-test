import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types based on your actual table structure
export interface Product {
  id: string
  name: string
  description: string
  price: number  // bigint from DB but we'll handle as number
  image: string
  category: string
}

export interface User {
  id: string
  name: string
  email: string
  created_at: string
  role: string
  status: string
}

export interface ShoppingCartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number  // bigint from DB but we'll handle as number
  added_at: string
}

export interface CartItemWithProduct extends ShoppingCartItem {
  productos: Product  // Note: 'productos' not 'products'
}