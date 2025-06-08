<template>
  <header>
    <div v-if="user || preview" class="header-auth">
      <UserProfile />
    </div>
  </header>
  
  <div v-if="!user && !isAuthLoading && !preview">
    <LoginForm />
  </div>
  
  <div v-else-if="user || preview">
    <div>
      <div v-if="preview">user preview</div>
        <div v-else>
          NO PREVIEW
        </div>
      </div>
    <div v-if="canShowContent">
      <div>
        page title:
        {{ (content && content.data && content.data.title) || 'Unpublished' }}
      </div>
      <Content
        :model="model"
        :content="content"
        :api-key="BUILDER_PUBLIC_API_KEY"
        :customComponents="REGISTERED_COMPONENTS"
        :data="{ 
          products: products,
          cart: cartItems, // Usar cartItems desde useCart
          cartItemCount: cartItemCount
        }"
      />
    </div>
    <div v-else>Content not Found</div>
  </div>
  
  <div v-else class="loading">
    Loading...
  </div>

  <!-- Cart Drawer -->
  <CartDrawer 
    v-if="isCartOpen"
    :cart="cartItems"
    @close="toggleCart"
    @remove-from-cart="handleRemoveFromCart"
  />
</template>

<script>
import {
  Content,
  fetchOneEntry,
  isPreviewing,
  getBuilderSearchParams,
} from '@builder.io/sdk-vue';
import { onMounted, ref, computed, watch, onUnmounted } from 'vue';
import { useAuth } from './composables/useAuth';
import { useCart } from './composables/useCart'; // Solo usar useCart
import { useSupabase } from './composables/useSupabase'; // Solo para productos
import LoginForm from './components/LoginForm.vue';
import UserProfile from './components/UserProfile.vue';
import Test from './components/Test.vue';
import MinimalShop from './components/MinimalShop.vue';
import TopBar from './components/TopBar.vue'
import ProductGrid from './components/ProductGrid.vue'
import ProductModal from './components/ProductModal.vue'
import CartDrawer from './components/CartDrawer.vue'

export default {
  name: 'App',
  components: {
    Content,
    LoginForm,
    UserProfile,
    Test,
    MinimalShop,
    TopBar,
    ProductGrid,
    ProductModal,
    CartDrawer
  },
  setup() {
    const { user, isLoading: isAuthLoading } = useAuth();
    
    // Usar useCart para todo lo relacionado con el carrito
    const { 
      cartItems,
      cartItemCount,
      cartTotal,
      isCartOpen,
      loading: cartLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      toggleCart
    } = useCart();

    // Usar useSupabase solo para productos
    const { 
      loading: productsLoading, 
      error: productsError,
      getProducts
    } = useSupabase();

    // Register your Builder components
    const REGISTERED_COMPONENTS = [
      {
        component: Test,
        name: 'Test',
        canHaveChildren: false,
        inputs: [
          {
            name: 'text',
            type: 'string',
            defaultValue: 'World',
          }
        ],
      },
      {
        component: MinimalShop,
        name: 'MinimalShop',
        canHaveChildren: true,
        inputs: [
          {
            name: 'text',
            type: 'string',
            defaultValue: 'World',
          },
        ],
      },
      {
        component: TopBar,
        name: 'TopBar',
        canHaveChildren: true,
        inputs: [
          {
            name: 'cartItemCount',
            type: 'Number',
            defaultValue: 0
          },
          {
            name: 'categories',
            type: 'Array',
            defaultValue: ["All", "Lighting", "Kitchenware", "Home Decor", "Plants", "Office", "Textiles"]
          },
        ],
      },
      {
        component: ProductGrid,
        name: 'ProductGrid',
        canHaveChildren: false,
        inputs: [
          {
            name: 'products',
            type: 'list',
            defaultValue: []
          }
        ]
      },
      {
        component: ProductModal,
        name: 'ProductModal',
        canHaveChildren: true,
        inputs: [
          {
            name: 'product',
            type: 'Object',
            defaultValue: null
          },
        ],
      },
    ];

    const content = ref(null);
    const BUILDER_PUBLIC_API_KEY = import.meta.env.VITE_BUILDER_API_KEY;
    const canShowContent = ref(false);
    const model = 'test-page';
    const preview = ref(false)

    // State simplificado
    const products = ref([])
    const selectedProduct = ref(null)
    const searchQuery = ref("")

    // Computed
    const filteredProducts = computed(() => {
      return products.value.filter(product => 
        product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    // Cargar productos desde Supabase
    const loadProducts = async () => {
      console.log('📦 Loading products from Supabase...')
      const supabaseProducts = await getProducts()
      products.value = supabaseProducts
      console.log('📦 Products loaded:', supabaseProducts.length, 'products')
    }

    // Función simplificada que usa useCart
    const handleAddToCart = async (product, quantity = 1) => {
      console.log('🌍 App.vue: handleAddToCart called', product.name, 'quantity:', quantity)
      
      const success = await addToCart(product.id, quantity)
      
      if (success) {
        console.log('✅ Product added to cart successfully')
        isCartOpen.value = true // Abrir carrito
      } else {
        console.error('❌ Failed to add product to cart')
      }
    }

    // Función para remover del carrito
    const handleRemoveFromCart = async (cartItemId) => {
      console.log('🗑️ App.vue: handleRemoveFromCart called', cartItemId)
      const success = await removeFromCart(cartItemId)
      
      if (success) {
        console.log('✅ Product removed from cart successfully')
      } else {
        console.error('❌ Failed to remove product from cart')
      }
    }

    // Escuchar eventos globales
    const handleGlobalAddToCart = (event) => {
      console.log('🌍 App.vue: Global event received:', event.detail)
      const { product, quantity } = event.detail
      handleAddToCart(product, quantity)
    }

    onMounted(async () => {
      if (isPreviewing()) {
        preview.value = true
      }
      isCartOpen.value = true
      // Cargar productos
      await loadProducts()
      
      await fetchContent();
      
      // Agregar listener para eventos globales
      console.log('🎧 App.vue: Adding global event listener')
      window.addEventListener('builderAddToCart', handleGlobalAddToCart)
    });

    onUnmounted(() => {
      window.removeEventListener('builderAddToCart', handleGlobalAddToCart)
    })

    watch(user, async (newUser, oldUser) => {
      if (newUser && !oldUser) {
        // Usuario se autenticó
        console.log('👤 User authenticated:', newUser.sub)
        await fetchContent();
      } else if (!newUser && oldUser) {
        // Usuario se desautenticó - useCart maneja esto automáticamente
        console.log('👤 User logged out')
      }
    });

    const fetchContent = async () => {
      content.value = await fetchOneEntry({
        model,
        apiKey: BUILDER_PUBLIC_API_KEY,
        options: getBuilderSearchParams(new URL(location.href).searchParams),
        userAttributes: {
          urlPath: window.location.pathname,
        },
      });
      canShowContent.value = content.value ? true : isPreviewing();
    };

    return {
      // Auth
      user,
      isAuthLoading,
      
      // Loading states
      cartLoading,
      productsLoading,
      productsError,
      
      // Builder
      content,
      BUILDER_PUBLIC_API_KEY,
      canShowContent,
      model,
      preview,
      REGISTERED_COMPONENTS,
      
      // State
      products,
      selectedProduct,
      searchQuery,
      
      // Cart state (desde useCart)
      cartItems,
      cartItemCount,
      cartTotal,
      isCartOpen,
      
      // Computed
      filteredProducts,
      
      // Methods
      handleAddToCart,
      handleRemoveFromCart,
      toggleCart
    }
  }
}
</script>