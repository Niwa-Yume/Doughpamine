<!--
  TimerDebugControls - Composant temporaire de debug pour tester le timer
  À SUPPRIMER en production !
-->
<template>
  <div class="timer-debug">
    <h3 class="timer-debug__title">🔧 Debug Timer</h3>

    <div class="timer-debug__buttons">
      <button @click="setTime(0)" class="debug-btn green">
        Juste nourri (24h)
      </button>

      <button @click="setTime(6)" class="debug-btn green">
        6h écoulées (vert)
      </button>

      <button @click="setTime(12)" class="debug-btn orange">
        12h écoulées (orange)
      </button>

      <button @click="setTime(14)" class="debug-btn orange">
        14h écoulées (orange)
      </button>

      <button @click="setTime(16)" class="debug-btn red">
        16h écoulées (rouge)
      </button>

      <button @click="setTime(20)" class="debug-btn red">
        20h écoulées (rouge)
      </button>

      <button @click="setTime(24)" class="debug-btn red">
        24h écoulées (expiré)
      </button>
    </div>

    <div class="timer-debug__info">
      <p><strong>Temps écoulé :</strong> {{ hoursElapsed }}h</p>
      <p><strong>Temps restant :</strong> {{ hoursRemaining }}h</p>
      <p><strong>Progression :</strong> {{ progress }}%</p>
      <p><strong>Couleur :</strong> {{ color }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  lastFeedTime: Date;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  updateTime: [date: Date]
}>();

const hoursElapsed = computed(() => {
  const elapsed = Date.now() - props.lastFeedTime.getTime();
  return Math.round((elapsed / (60 * 60 * 1000)) * 10) / 10;
});

const hoursRemaining = computed(() => {
  const remaining = 24 - hoursElapsed.value;
  return Math.max(0, Math.round(remaining * 10) / 10);
});

const progress = computed(() => {
  return Math.round((hoursElapsed.value / 24) * 100);
});

const color = computed(() => {
  if (hoursRemaining.value > 12) return '🟢 Vert';
  if (hoursRemaining.value > 8) return '🟠 Orange';
  return '🔴 Rouge';
});

function setTime(hoursAgo: number) {
  const newDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  emit('updateTime', newDate);
}
</script>

<style scoped>
.timer-debug {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: var(--spacing-md);
  z-index: 9999;
  max-height: 40vh;
  overflow-y: auto;
}

.timer-debug__title {
  font-size: var(--font-size-base);
  margin: 0 0 var(--spacing-sm);
  text-align: center;
}

.timer-debug__buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.debug-btn {
  padding: var(--spacing-sm);
  border: none;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  color: white;
}

.debug-btn.green {
  background-color: #4caf50;
}

.debug-btn.orange {
  background-color: #ff9800;
}

.debug-btn.red {
  background-color: #f44336;
}

.debug-btn:active {
  transform: scale(0.95);
}

.timer-debug__info {
  font-size: var(--font-size-xs);
  line-height: 1.6;
}

.timer-debug__info p {
  margin: var(--spacing-xs) 0;
}

@media (min-width: 768px) {
  .timer-debug__buttons {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>

