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
    <div>Hello world from your Vue 3 project. Below is Builder Content--??:</div>
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
          cart: cart,
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
    :cart="cart"
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

    // State
    const products = ref([])
    const cart = ref([])
    const selectedProduct = ref(null)
    const isCartOpen = ref(false)
    const searchQuery = ref("")

    // Computed
    const filteredProducts = computed(() => {
      return products.value.filter(product => 
        product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    const cartItemCount = computed(() => {
      return cart.value.reduce((total, item) => total + item.quantity, 0)
    })

    const cartTotal = computed(() => {
      return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0)
    })

    // Methods
    const addToCart = (product, quantity = 1) => {
      console.log('📦 App.vue: addToCart function executed', product, quantity)
      const existingItem = cart.value.find(item => item.id === product.id)
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        cart.value.push({ ...product, quantity })
      }
      console.log('📦 Cart updated:', cart.value)
    }

    const removeFromCart = (productId) => {
      const index = cart.value.findIndex(item => item.id === productId)
      if (index > -1) {
        cart.value.splice(index, 1)
      }
    }

    const handleRemoveFromCart = (productId) => {
      removeFromCart(productId)
    }

    const toggleCart = () => {
      isCartOpen.value = !isCartOpen.value
    }

    // Escuchar eventos globales
    const handleGlobalAddToCart = (event) => {
      console.log('🌍 App.vue: Global event received:', event.detail)
      const { product, quantity } = event.detail
      addToCart(product, quantity)
      isCartOpen.value = true // Abrir carrito automáticamente
    }

    onMounted(async () => {
      if (isPreviewing()) {
        preview.value = true
      }
      await fetchContent();
      
      // Agregar listener para eventos globales
      console.log('🎧 App.vue: Adding global event listener')
      window.addEventListener('builderAddToCart', handleGlobalAddToCart)
    });

    onUnmounted(() => {
      window.removeEventListener('builderAddToCart', handleGlobalAddToCart)
    })

    watch(user, async (newUser) => {
      if (newUser) {
        await fetchContent();
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
      
      // Builder
      content,
      BUILDER_PUBLIC_API_KEY,
      canShowContent,
      model,
      preview,
      REGISTERED_COMPONENTS,
      
      // State
      products,
      cart,
      selectedProduct,
      isCartOpen,
      searchQuery,
      
      // Computed
      filteredProducts,
      cartItemCount,
      cartTotal,
      
      // Methods
      addToCart,
      removeFromCart,
      handleRemoveFromCart,
      toggleCart
    }
  }
}
</script>