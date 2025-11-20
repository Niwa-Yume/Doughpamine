<!--
  DoughTimer - Timer circulaire visuel pour le levain

  Affiche un cercle de progression autour du levain qui change de couleur :
  - Vert : 24h → 12h (levain nourri récemment)
  - Orange : 12h → 8h (levain commence à avoir faim)
  - Rouge : 8h → 0h (levain affamé, à nourrir d'urgence)

  Props:
  - lastFeedTime: Date du dernier nourrissage (timestamp ou Date)
  - size: Taille du cercle en pixels (défaut: 227)
  - strokeWidth: épaisseur du cercle
  - showTimeLabel: afficher le label du temps restant
  - acceleratedMode: mode accéléré (1s réelle = 1h de levain)
  - contentSize: taille (px) de la zone de contenu centrale

  Événements:
  - timeExpired: Émis quand le timer atteint 0

  Exemple:
  <DoughTimer :lastFeedTime="feedDate" :size="227" @timeExpired="handleExpired" />
-->
<template>
  <div
    class="dough-timer"
    :style="{ width: `${size}px`, height: `${size}px`, '--content-size': `${contentSize}px` } as any"
  >
    <!-- Cercle SVG de progression -->
    <svg
      class="dough-timer__svg"
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
    >
      <!-- Cercle de fond (gris clair) -->
      <circle
        class="dough-timer__bg"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke-width="strokeWidth"
      />

      <!-- Cercle de progression (coloré) -->
      <circle
        class="dough-timer__progress"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="currentColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        :style="{
          transform: 'rotate(-90deg)',
          transformOrigin: 'center'
        }"
      />
    </svg>

    <!-- Contenu central (slot pour l'image du levain) -->
    <div class="dough-timer__content">
      <slot />
    </div>

    <!-- Indicateur de temps restant (optionnel) -->
    <div v-if="showTimeLabel" class="dough-timer__label">
      {{ timeRemainingLabel }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Props {
  lastFeedTime: Date | number;
  size?: number;
  strokeWidth?: number;
  showTimeLabel?: boolean;
  acceleratedMode?: boolean;
  contentSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 227,
  strokeWidth: 8,
  showTimeLabel: false,
  acceleratedMode: false,
  contentSize: 200,
});

const emit = defineEmits<{
  timeExpired: []
}>();

// État réactif
const currentTime = ref(Date.now());
let intervalId: ReturnType<typeof setInterval> | null = null;

// Constantes pour le calcul du cercle SVG
const center = computed(() => props.size / 2);
const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);

/**
 * Calcule le temps écoulé en millisecondes depuis le dernier nourrissage
 * En mode accéléré : 1 seconde réelle = 1 heure de levain
 */
const elapsedTime = computed(() => {
  const feedTime = props.lastFeedTime instanceof Date
    ? props.lastFeedTime.getTime()
    : props.lastFeedTime;

  const realElapsed = currentTime.value - feedTime;

  // Mode accéléré : multiplie par 3600 (1s = 1h au lieu de 1s = 1s)
  if (props.acceleratedMode) {
    return realElapsed * 3600; // 3600 secondes = 1 heure
  }

  return realElapsed;
});

/**
 * Calcule le temps restant en millisecondes (24h max)
 */
const timeRemaining = computed(() => {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const remaining = TWENTY_FOUR_HOURS - elapsedTime.value;
  return Math.max(0, remaining);
});

/**
 * Calcule le pourcentage de progression (0-100)
 * 0% = vient d'être nourri, 100% = 24h écoulées
 */
const progressPercentage = computed(() => {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const percentage = (elapsedTime.value / TWENTY_FOUR_HOURS) * 100;
  return Math.min(100, Math.max(0, percentage));
});

/**
 * Calcule l'offset du stroke-dasharray pour animer le cercle
 * Le cercle PART PLEIN (0h) et se VIDE progressivement (vers 24h)
 *
 * Logique inversée :
 * - 0h écoulées = dashOffset 0 = cercle COMPLET (100% visible)
 * - 12h écoulées = dashOffset 50% = cercle à MOITIÉ (50% visible)
 * - 24h écoulées = dashOffset 100% = cercle VIDE (0% visible)
 */
const dashOffset = computed(() => {
  // Le cercle se VIDE : on va de 0 vers la circonférence
  return circumference.value * (progressPercentage.value / 100);
});

/**
 * Détermine la couleur du cercle selon le temps restant
 * - Vert : > 12h restantes (0-12h écoulées)
 * - Orange : 8h - 12h restantes (12-16h écoulées)
 * - Rouge : < 8h restantes (16-24h écoulées)
 */
const currentColor = computed(() => {
  const hoursRemaining = timeRemaining.value / (60 * 60 * 1000);

  if (hoursRemaining > 12) {
    return 'var(--color-timer-green, #4caf50)'; // Vert
  } else if (hoursRemaining > 8) {
    return 'var(--color-timer-orange, #ff9800)'; // Orange
  } else {
    return 'var(--color-timer-red, #f44336)'; // Rouge
  }
});

/**
 * Formate le temps restant en format lisible (ex: "14h 23m")
 */
const timeRemainingLabel = computed(() => {
  const totalMinutes = Math.floor(timeRemaining.value / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

/**
 * Met à jour le temps actuel toutes les secondes
 */
function startTimer() {
  intervalId = setInterval(() => {
    currentTime.value = Date.now();

    // Émettre l'événement si le temps est écoulé
    if (timeRemaining.value <= 0) {
      emit('timeExpired');
    }
  }, 1000); // Mise à jour toutes les secondes
}

/**
 * Nettoie l'intervalle quand le composant est détruit
 */
function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Lifecycle hooks
onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  stopTimer();
});
</script>

<style scoped>
.dough-timer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dough-timer__svg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  pointer-events: none;
}

.dough-timer__progress {
  transition: stroke var(--transition-slow),
              stroke-dashoffset 1s linear;
}

.dough-timer__content {
  position: relative;
  z-index: 1;
  width: var(--content-size, 200px);
  height: var(--content-size, 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
}

.dough-timer__label {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
  background-color: rgba(255, 255, 255, 0.9);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
}

/* Animation de pulsation quand le timer est en rouge (< 8h) */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.dough-timer__progress[stroke*="f44336"] {
  animation: pulse 2s ease-in-out infinite;
}
</style>
