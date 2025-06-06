<template>
  <div class="login-form">
    <h2>Please log in to continue</h2>
    <button 
      @click="login" 
      :disabled="isLoading"
      class="login-button"
    >
      {{ isLoading ? 'Loading...' : 'Log In' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth'

const { login, isLoading } = useAuth()
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.login-button {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 1rem;
}

.login-button:hover {
  background-color: #0056b3;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>