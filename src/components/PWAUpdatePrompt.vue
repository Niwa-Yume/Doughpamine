<template>
  <transition name="slide-up">
    <div v-if="showUpdatePrompt" class="update-prompt">
      <div class="update-content">
        <span class="update-icon">🔄</span>
        <div class="update-text">
          <strong>Nouvelle version disponible !</strong>
          <p>Actualiser pour obtenir les dernières fonctionnalités</p>
        </div>
        <button @click="updateApp" class="update-button">
          Mettre à jour
        </button>
        <button @click="dismissUpdate" class="dismiss-button">
          Plus tard
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showUpdatePrompt = ref(false)

function updateApp() {
  showUpdatePrompt.value = false
  // Forcer le rechargement complet de l'app
  window.location.reload()
}

function dismissUpdate() {
  showUpdatePrompt.value = false
}

onMounted(() => {
  // Écouter les mises à jour du service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      console.log('✅ Service Worker prêt')

      // Vérifier les mises à jour toutes les heures
      setInterval(() => {
        registration.update()
        console.log('🔍 Vérification des mises à jour...')
      }, 60 * 60 * 1000) // 1 heure

      // Vérification immédiate
      registration.update()
    })

    // Détecter quand un nouveau service worker est en attente
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Nouveau Service Worker détecté')
      showUpdatePrompt.value = true
    })

    // Écouter les messages du service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        console.log('🔄 Mise à jour disponible')
        showUpdatePrompt.value = true
      }
    })
  }
})
</script>

<style scoped>
.update-prompt {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  padding: 20px 16px calc(env(safe-area-inset-bottom, 16px) + 16px) 16px;
  pointer-events: none;
}

.update-content {
  background: linear-gradient(135deg, #955934 0%, #7a4628 100%);
  color: white;
  padding: 18px 20px;
  border-radius: 20px;
  border: 3px solid #633216;
  box-shadow:
    0 -8px 32px rgba(0, 0, 0, 0.4),
    0 4px 16px rgba(149, 89, 52, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 14px;
  animation: slideUpBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: auto;
  max-width: 600px;
  margin: 0 auto;
}

.update-icon {
  font-size: 36px;
  flex-shrink: 0;
  animation: rotate 2s linear infinite;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.update-text {
  flex: 1;
  min-width: 0;
}

.update-text strong {
  display: block;
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 6px;
  line-height: 1.3;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.update-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.95;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.update-button {
  background: linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%);
  color: #633216;
  border: 2px solid #633216;
  padding: 11px 24px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  text-transform: none;
  letter-spacing: 0.3px;
}

.update-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.update-button:active {
  transform: translateY(0) scale(0.97);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dismiss-button {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.6);
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.dismiss-button:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.8);
}

.dismiss-button:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.2);
}

/* Animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-enter-from {
  transform: translateY(120%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(120%);
  opacity: 0;
}

@keyframes slideUpBounce {
  0% {
    transform: translateY(120px);
    opacity: 0;
  }
  60% {
    transform: translateY(-12px);
    opacity: 1;
  }
  80% {
    transform: translateY(6px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive pour petits écrans */
@media (max-width: 640px) {
  .update-prompt {
    padding: 16px 12px calc(env(safe-area-inset-bottom, 12px) + 12px) 12px;
  }

  .update-content {
    flex-direction: column;
    text-align: center;
    padding: 16px;
    gap: 12px;
  }

  .update-icon {
    font-size: 40px;
    margin-bottom: 4px;
  }

  .update-text {
    margin-bottom: 8px;
  }

  .update-text strong {
    font-size: 16px;
  }

  .update-text p {
    font-size: 13px;
  }

  .update-button,
  .dismiss-button {
    width: 100%;
    max-width: 200px;
  }
}

/* Effet de brillance subtil */
@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.update-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 3s infinite;
}

.update-button {
  position: relative;
  overflow: hidden;
}
</style>

