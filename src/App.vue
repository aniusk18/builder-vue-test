<template>
  <header>
  </header>
  <div>
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
</template>

<script setup lang="ts">
import {
  Content,
  fetchOneEntry,
  isPreviewing,
  type BuilderContent,
  getBuilderSearchParams,
} from '@builder.io/sdk-vue';
// import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue';
import { onMounted, ref, computed} from 'vue';
//import { registeredComponents } from './init-builder';
import Test from './components/Test.vue';
import MinimalShop from './components/MinimalShop.vue';
import TopBar from './components/TopBar.vue'
import ProductGrid from './components/ProductGrid.vue'
import ProductModal from './components/ProductModal.vue'
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
      },
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
    ],
    outputs: [
      {
        name: 'productSelect',
        event: 'productSelect',
        friendlyName: 'Product Selected'
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
const content = ref<BuilderContent | null>(null);
// // Add your Public API Key below
const BUILDER_PUBLIC_API_KEY =import.meta.env.VITE_BUILDER_API_KEY;
const apiKey =import.meta.env.VITE_BUILDER_API_KEY;
const canShowContent = ref(false);
const model = 'test-page';


onMounted(async () => {
  content.value = await fetchOneEntry({
    model,
    apiKey: BUILDER_PUBLIC_API_KEY,
    options: getBuilderSearchParams(new URL(location.href).searchParams),
    userAttributes: {
      urlPath: window.location.pathname,
    },
  });
  canShowContent.value = content.value ? true : isPreviewing();
  
  window.addEventListener('product-selected', (e) => {
    setSelectedProduct(e.detail);
  });

});
onUnmounted(() => {
  window.removeEventListener('product-selected', setSelectedProduct);
});


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