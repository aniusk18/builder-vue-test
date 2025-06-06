<template>
  <div class="user-profile">
    <div v-if="user" class="user-info">
      <img 
        v-if="user.photoURL" 
        :src="user.photoURL" 
        :alt="user.displayName"
        class="user-avatar"
      />
      <span class="user-name">{{ user.displayName || user.email }}</span>
      <button @click="logout" class="logout-button">
        Logout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth'

const { user, logout } = useAuth()
</script>

<style scoped>
.user-profile {
  padding: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
}

.user-name {
  font-weight: 500;
}

.logout-button {
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.logout-button:hover {
  background-color: #c82333;
}
</style>