<template>
  <div class="streak-display" :class="{ 'streak-display--animating': isAnimating }">
    <!-- Icône flamme style Duolingo -->
    <svg
      class="streak-display__icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Flamme avec dégradé orange -->
      <defs>
        <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#FFA500;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FF6B35;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path
        class="streak-display__flame"
        d="M12 2c2 4-1 5-1 7s2 3 2 5-2 4-4 4-4-2-4-4.5 2-3.5 2-5.5S7 5 8 2c2 2 4 3 6 1z"
        fill="url(#flameGradient)"
      />
      <!-- Petite flamme intérieure jaune -->
      <path
        class="streak-display__inner-flame"
        d="M12 8c1 2-0.5 2.5-0.5 3.5s1 1.5 1 2.5-1 2-2 2-2-1-2-2.25 1-1.75 1-2.75S10 8.5 10.5 7c1 1 1.5 1.5 2.5 0.5z"
        fill="#FFD700"
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
  gap: 4px;
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  border: none;
  transition: transform 0.3s ease;
}

.streak-display__icon {
  color: #FF6B35;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.streak-display__flame {
  transform-origin: center bottom;
}

.streak-display__inner-flame {
  transform-origin: center bottom;
}

.streak-display__count {
  font-family: var(--font-display, system-ui, sans-serif);
  font-size: 14px;
  font-weight: 700;
  color: #FF6B35;
  line-height: 1;
  min-width: auto;
  text-align: center;
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
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes flameFlicker {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.2) rotate(-5deg);
  }
  50% {
    transform: scale(1.25) rotate(5deg);
  }
  75% {
    transform: scale(1.2) rotate(-3deg);
  }
}

@keyframes flameGrow {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
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
    transform: scale(1.4);
  }
  50% {
    transform: scale(0.95);
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Effet de lueur pour la flamme lors de l'animation */
.streak-display--animating .streak-display__flame {
  filter: drop-shadow(0 0 8px rgba(255, 165, 0, 0.8));
}

/* Animation subtile de la flamme en continu */
.streak-display__flame {
  animation: flameIdle 2s ease-in-out infinite;
}

.streak-display__inner-flame {
  animation: innerFlameIdle 1.5s ease-in-out infinite;
}

@keyframes flameIdle {
  0%, 100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.05) translateY(-1px);
  }
}

@keyframes innerFlameIdle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}
</style>

