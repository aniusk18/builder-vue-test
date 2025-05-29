<template>
  <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
    <div
      v-for="product in products"
      :key="product.id"
      class="group cursor-pointer"
      @click="handleProductClick(product)"
    >
      <div class="aspect-[4/5] bg-white dark:bg-zinc-900 rounded-md overflow-hidden">
        <img
          :src="product.image"
          :alt="product.name"
          class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div class="mt-1.5 space-y-0.5">
        <h3 class="text-xs font-medium truncate">{{ product.name }}</h3>
        <div class="flex justify-between items-center">
          <p class="text-xs text-zinc-500 dark:text-zinc-400">${{ product.price }}</p>
          <p class="text-[10px] text-zinc-400 dark:text-zinc-500">{{ product.category }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { track } from '@builder.io/sdk-vue'
export default {
  props: {
    products: {
      type: Array,
      default: () => []
    }
  },
  emits: ['productSelect'],
  setup(props, { emit }) {
    track({
    type: 'productSelect',
    apiKey: '1efb6e7f6b4f4105b4c885b002ac6f7d'
    });
    const handleProductClick = (product) => {
      emit('productSelect', product)
      window.dispatchEvent(new CustomEvent('product-selected', { detail: product }))
    }

    return {
      handleProductClick
    }
  }
}
</script>
