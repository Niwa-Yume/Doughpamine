<template>
  <div class="icon-list" role="navigation" aria-label="Raccourcis">
    <!-- Icône Flamme (Streak) -->
    <div class="icon-wrapper">
      <img src="/assets/icon/flamme.png" alt="Flamme" class="icon" />
    </div>

    <!-- Icône Profile avec menu déroulant -->
    <div class="icon-wrapper" ref="profileMenuRef">
      <img
        src="/assets/icon/icon de profile.png"
        alt="Profile"
        class="icon icon--clickable"
        @click.stop="toggleMenu"
      />

      <!-- Menu déroulant -->
      <transition name="dropdown">
        <div v-if="isMenuOpen" class="dropdown-menu" @click.stop>
          <button class="dropdown-item" @click.stop="navigateToChat">
            <span class="dropdown-item__icon">💬</span>
            <span class="dropdown-item__text">Chat AI</span>
          </button>
          <button class="dropdown-item" @click.stop="navigateToScore">
            <span class="dropdown-item__icon">🏆</span>
            <span class="dropdown-item__text">Score</span>
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isMenuOpen = ref(false);
const profileMenuRef = ref<HTMLElement | null>(null);

function toggleMenu(event: MouseEvent) {
  event.stopPropagation();
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}

function navigateToChat(event: MouseEvent) {
  event.stopPropagation();
  closeMenu();
  router.push('/chat');
}

function navigateToScore(event: MouseEvent) {
  event.stopPropagation();
  closeMenu();
  router.push('/score');
}

// Fermer le menu si on clique en dehors
function handleClickOutside(event: MouseEvent) {
  if (!isMenuOpen.value) return;

  const target = event.target as Node;
  if (profileMenuRef.value && !profileMenuRef.value.contains(target)) {
    closeMenu();
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.icon-list {
  position: absolute;
  /* Aligné sur la même ligne que l'avatar Jotform */
  top: calc(env(safe-area-inset-top, 0px) + 28px);
  /* Positionné à droite dans le conteneur parent */
  right: 12px;

  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  
  padding: 10px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  /* Assure que la liste est cliquable et au-dessus des autres éléments */
  z-index: 9999;
  pointer-events: auto;
}

.icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 24px;
  height: 24px;
  transition: transform 0.2s ease;
}

.icon--clickable {
  cursor: pointer;
}

.icon--clickable:hover {
  transform: scale(1.1);
}

.icon--clickable:active {
  transform: scale(0.95);
}

/* Menu déroulant */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 10000;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;
  font-family: inherit;
}

.dropdown-item:hover {
  background-color: rgba(149, 89, 52, 0.15);
}

.dropdown-item:active {
  background-color: rgba(149, 89, 52, 0.25);
}

.dropdown-item:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.dropdown-item__icon {
  font-size: 20px;
  flex-shrink: 0;
}

.dropdown-item__text {
  font-family: var(--font-body, 'Roboto', Arial, sans-serif);
  font-size: 15px;
  font-weight: 500;
  color: #955934;
}

/* Animations du menu déroulant */
.dropdown-enter-active {
  animation: dropdownSlideIn 0.2s ease-out;
}

.dropdown-leave-active {
  animation: dropdownSlideOut 0.15s ease-in;
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dropdownSlideOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
}
</style>
