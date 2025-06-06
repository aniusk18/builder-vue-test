<template>
  <div class="user-profile">
    <div v-if="user" class="user-info">
      <div class="user-avatar-container">
        <img 
          v-if="user.photoURL" 
          :src="user.photoURL" 
          :alt="user.displayName || 'User'"
          class="user-avatar"
        />
        <div v-else class="user-avatar-placeholder">
          {{ getInitials(user.displayName || user.email || 'U') }}
        </div>
      </div>
      
      <div class="user-details">
        <span class="user-name">{{ user.displayName || user.email }}</span>
        <span v-if="user.email && user.displayName" class="user-email">{{ user.email }}</span>
      </div>
      
      <button @click="handleLogout" class="logout-button" title="Sign out">
        <svg class="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        Sign Out
      </button>
    </div>
    
    <div v-else class="user-loading">
      <div class="loading-spinner"></div>
      <span>Loading user...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth'

const { user, logout } = useAuth()

const handleLogout = () => {
  logout()
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<script lang="ts">
export default {
  name: 'UserProfile'
}
</script>

<style scoped>
.user-profile {
  padding: 0.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  border-radius: 0.75rem;
  padding: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.user-avatar-container {
  flex-shrink: 0;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.user-avatar-placeholder {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  border: 2px solid #e5e7eb;
}

.user-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
  truncate: true;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.75rem;
  color: #6b7280;
  truncate: true;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  flex-shrink: 0;
}

.logout-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.logout-button:active {
  transform: translateY(0);
}

.logout-icon {
  width: 1rem;
  height: 1rem;
}

.user-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .user-info {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .user-details {
    flex-basis: 100%;
    order: 2;
  }
  
  .logout-button {
    order: 3;
    width: 100%;
    justify-content: center;
  }
  
  .user-name,
  .user-email {
    text-align: center;
  }
}
</style>