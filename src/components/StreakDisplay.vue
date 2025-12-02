<template>
  <div class="streak-display" :class="{ 'streak-display--animating': isAnimating }">
    <svg
      class="streak-display__icon"
      width="48"
      height="48"
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        class="streak-display__flame"
        d="M56 12c8 16-4 20-4 28s8 12 8 20-8 16-16 16-16-8-16-18 8-14 8-22S24 20 32 8c8 8 16 12 24 4z"
        fill="currentColor"
      />
    </svg>
    <span class="streak-display__count">{{ streak }}</span>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'

const props = defineProps<{
  streak: number
}>()
console.log('🔥 StreakDisplay mounted with streak:', props.streak);

const isAnimating = ref(false)
let animationTimeout: NodeJS.Timeout | null = null

onMounted(() => {
  console.log('🔥 MONTAGE StreakDisplay:', {
    streak: props.streak,
    type: typeof props.streak,
    value: props.streak
  });
});

// Déclencher l'animation quand la streak change
watch(() => props.streak, (newStreak, oldStreak) => {
  if (newStreak > oldStreak) {
    // Nouvelle streak détectée !
    triggerAnimation()
  }
})

function triggerAnimation() {
  // Nettoyer le timeout précédent si existant
  if (animationTimeout) {
    clearTimeout(animationTimeout)
  }

  isAnimating.value = true

  // Arrêter l'animation après 1 seconde
  animationTimeout = setTimeout(() => {
    isAnimating.value = false
  }, 1000)
}
</script>

<style scoped>
.streak-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 245, 235, 0.95));
  border-radius: 28px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
  border: 2px solid rgba(255, 107, 53, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.streak-display__icon {
  color: #FF6B35;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.streak-display__flame {
  transform-origin: center bottom;
}

.streak-display__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.streak-display__label {
  font-family: var(--font-display, system-ui, sans-serif);
  font-size: 12px;
  font-weight: 400;
  color: #FF6B35;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.streak-display__count {
  font-family: var(--font-display, system-ui, sans-serif);
  font-size: 28px;
  font-weight: 700;
  color: #000!important;
  line-height: 1;
  min-width: 32px;
  text-align: center;
  opacity: 1 !important;
  visibility: visible !important;
  z-index: 999 !important;
  background: yellow; /* Debug: fond jaune */
}

/* Animation quand la streak augmente */
.streak-display--animating {
  animation: streakPulse 0.6s ease-out;
}

.streak-display--animating .streak-display__icon {
  animation: flameFlicker 0.6s ease-out;
}

.streak-display--animating .streak-display__flame {
  animation: flameGrow 0.6s ease-out;
}

.streak-display--animating .streak-display__count {
  animation: countPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes streakPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
    border-color: rgba(255, 107, 53, 0.2);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 6px 24px rgba(255, 107, 53, 0.5);
    border-color: rgba(255, 107, 53, 0.6);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
    border-color: rgba(255, 107, 53, 0.2);
  }
}

@keyframes flameFlicker {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.2) rotate(-8deg);
  }
  50% {
    transform: scale(1.3) rotate(8deg);
  }
  75% {
    transform: scale(1.2) rotate(-5deg);
  }
}

@keyframes flameGrow {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes countPop {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.5);
  }
  50% {
    transform: scale(0.9);
  }
  70% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

/* Effet de lueur pour la flamme */
.streak-display--animating .streak-display__flame {
  filter: drop-shadow(0 0 12px rgba(255, 107, 53, 0.9));
}

/* Animation subtile de la flamme en continu */
.streak-display__flame {
  animation: flameIdle 2s ease-in-out infinite;
}

@keyframes flameIdle {
  0%, 100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.05) translateY(-2px);
  }
}
</style>

