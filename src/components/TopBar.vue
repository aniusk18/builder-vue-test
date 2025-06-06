<template>
  <div class="sticky top-0 z-40 transition-all duration-200 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800"
       :class="{ 'shadow-sm': isScrolled }">
    <div class="flex items-center justify-between px-3 h-12">
      <a href="https://kokonutui.com/" 
         target="_blank" 
         rel="noopener noreferrer"
         class="text-sm font-medium text-zinc-800 dark:text-zinc-200 shrink-0">
        Shop
      </a>
      
      <div class="flex-1 px-8 overflow-x-auto flex items-center justify-center gap-6 scrollbar-none">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          class="whitespace-nowrap transition-colors text-sm"
          :class="selectedCategory === category 
            ? 'text-zinc-900 dark:text-white font-medium' 
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'"
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <Transition name="search">
          <div v-if="isSearchOpen" class="relative">
            <input
              ref="searchInput"
              type="text"
              placeholder="Search products..."
              class="w-48 sm:w-56 bg-zinc-100 dark:bg-zinc-800 rounded-md text-sm px-3 py-1.5 
                     text-zinc-800 dark:text-zinc-200
                     focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700
                     transition-all duration-200"
              @input="handleSearch"
              @keydown="handleKeyPress"
            />
            <button
              type="button"
              @click="closeSearch"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-zinc-200 
                     dark:hover:bg-zinc-700 rounded-full text-zinc-600 dark:text-zinc-400"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </Transition>
        
        <button
          type="button"
          @click="toggleSearch"
          class="p-1.5 rounded-md transition-colors text-zinc-700 dark:text-zinc-300"
          :class="isSearchOpen ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'"
        >
          <Search class="w-4 h-4" />
        </button>
        
        <button
          type="button"
          @click="$emit('cartClick')"
          class="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md relative text-zinc-700 dark:text-zinc-300"
        >
          <ShoppingBag class="w-4 h-4" />
          <Transition name="badge">
            <span
              v-if="cartItemCount > 0"
              class="absolute -top-1 -right-1 bg-zinc-900 dark:bg-white 
                     text-white dark:text-zinc-900 text-xs font-medium w-4 h-4 
                     flex items-center justify-center rounded-full"
            >
              {{ cartItemCount }}
            </span>
          </Transition>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Search, ShoppingBag, X } from 'lucide-vue-next'

export default {
  props: {
    cartItemCount: {
      type: Number,
      default: 0
    },
    categories: {
      type: Array,
      default: ["All", "Lighting", "Kitchenware", "Home Decor", "Plants", "Office", "Textiles"]
    }
  },
  components: {
    X,
    Search,
    ShoppingBag
  },
  emits: ['cartClick', 'search'],
  setup(props, { emit }) {
    //const categories = ["All", "Lighting", "Kitchenware", "Home Decor", "Plants", "Office", "Textiles"]
    const isSearchOpen = ref(false)
    const selectedCategory = ref("All")
    const isScrolled = ref(false)
    const searchInput = ref(null)

    const handleScroll = () => {
      isScrolled.value = window.scrollY > 10
    }

    const toggleSearch = async () => {
      isSearchOpen.value = !isSearchOpen.value
      if (isSearchOpen.value) {
        await nextTick()
        searchInput.value?.focus()
      }
    }

    const closeSearch = () => {
      isSearchOpen.value = false
      emit('search', '')
    }

    const handleSearch = (e) => {
      emit('search', e.target.value)
    }

    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        closeSearch()
      }
    }

    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    return {
      categories,
      isSearchOpen,
      selectedCategory,
      isScrolled,
      searchInput,
      toggleSearch,
      closeSearch,
      handleSearch,
      handleKeyPress
    }
  }
}
</script>


<style scoped>
.search-enter-active, .search-leave-active {
  transition: all 0.2s ease;
}
.search-enter-from, .search-leave-to {
  opacity: 0;
  transform: scaleX(0);
}

.badge-enter-active, .badge-leave-active {
  transition: all 0.2s ease;
}
.badge-enter-from, .badge-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>