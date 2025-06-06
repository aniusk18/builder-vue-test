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
      <div v-else >
        NO PREVIEW
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
        :data="products"
      />
    </div>
    <div v-else>Content not Found</div>
  </div>

  </div>
  
  <div v-else class="loading">
    Loading...
  </div>
</template>

<script setup lang="ts">
import {
  Content,
  fetchOneEntry,
  isPreviewing,
  type BuilderContent,
  getBuilderSearchParams,
} from '@builder.io/sdk-vue';
import { onMounted, ref, computed} from 'vue';
import { useAuth } from './composables/useAuth';
import LoginForm from './components/LoginForm.vue';
import UserProfile from './components/UserProfile.vue';
import Test from './components/Test.vue';
import MinimalShop from './components/MinimalShop.vue';
import TopBar from './components/TopBar.vue'
import ProductGrid from './components/ProductGrid.vue'
import ProductModal from './components/ProductModal.vue'

// if (isPreviewing()) {
//   const user = {
//       uid: 'mockUID123',
//       email: 'preview@builder.io',
//       emailVerified: true,
//       displayName: 'Preview User',
//       photoURL: 'https://i.pravatar.cc/150?u=mockuser',
//       phoneNumber: '+541112345678',
//       providerId: 'firebase',
//       metadata: {
//         creationTime: 'Mon, 01 Jan 2024 00:00:00 GMT',
//         lastSignInTime: 'Mon, 01 Jan 2024 00:00:00 GMT',
//       },
//     }
//   const isLoadingfalse = false;
// }else{
const { user, isLoading: isAuthLoading } = useAuth();
// }

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
    canHaveChildren: true,
    inputs: [
      {
        name: 'products',
        type: 'Array',
        defaultValue: true
      },
      {
        name: 'productSelect',
        type: 'event',
      },
    ],
    outputs: [
      {
        name: 'productSelect',
        event: 'productSelect',
        friendlyName: 'Product Selected',
      },
    ],
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

const content = ref<BuilderContent | null>(null);
const BUILDER_PUBLIC_API_KEY = import.meta.env.VITE_BUILDER_API_KEY;
const canShowContent = ref(false);
const model = 'test-page';
const preview = ref(false)

onMounted(async () => {
  if (isPreviewing()) {
    preview.value = true
  }
  // Only fetch content if user is authenticated
  //if (user.value) {
    await fetchContent();
  //}
});

import { watch } from 'vue';
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
  
  // window.addEventListener('productSelect', (e) => {
  //   console.log('paso por select desde el codigo')
  //   //setSelectedProduct(e.detail);
  // });
// onUnmounted(() => {
//   window.removeEventListener('productSelect', setSelectedProduct);
// });
};


const products = ref([])
// State
const cart = ref([])
const selectedProduct = ref(null)
const isCartOpen = ref(false)
const searchQuery = ref("")

// Computed
const filteredProducts = computed(() => {
  return products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Methods
const addToCart = (product, quantity = 1) => {
  const existingItem = cart.value.find(item => item.id === product.id)
  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.value.push({ ...product, quantity })
  }
}

const removeFromCart = (productId) => {
  const index = cart.value.findIndex(item => item.id === productId)
  if (index > -1) {
    cart.value.splice(index, 1)
  }
}

const setSelectedProduct = (product) => {
  selectedProduct.value = product
}

const setSearchQuery = (query) => {
  searchQuery.value = query
}

const handleAddToCart = (product) => {
  addToCart(product)
  selectedProduct.value = null
  isCartOpen.value = true
}
</script>