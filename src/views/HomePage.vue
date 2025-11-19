<!--
  HomePage - Page d'accueil avec le levain et timer de nourrissage

  Affiche :
  - Widget AI Jotform pour assistance
  - Timer circulaire visuel (24h)
  - État du levain (actif/affamé/etc.)
  - Bouton pour nourrir le levain
-->
<template>
  <div class="home-page app-container">
    <!-- Widget AI Jotform via composant dédié -->
    <JotformAgent />

    <!-- Timer circulaire avec le levain au centre -->
    <div class="home-page__dough-section">
      <DoughTimer
        :lastFeedTime="lastFeedTime"
        :size="240"
        :contentSize="200"
        :strokeWidth="6"
        :showTimeLabel="true"
        :acceleratedMode="DEBUG_ACCELERATED_MODE"
        @timeExpired="handleTimerExpired"
      >
        <img
          class="home-page__dough-image"
          alt="Levain"
          :src="doughGif"
        />
      </DoughTimer>

      <!-- État du levain -->
      <p class="home-page__status">{{ doughStatus }}</p>
    </div>

    <!-- Bouton pour nourrir -->
    <NewButton
      text="NOURRIR"
      class="home-page__feed-button"
      @click="feedDough"
    />

    <!-- DEBUG: Contrôles de test du timer (À SUPPRIMER en production) -->
    <TimerDebugControls
      :lastFeedTime="lastFeedTime"
      @updateTime="updateDebugTime"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import NewButton from "@/components/NewButton.vue";
import JotformAgent from "@/components/JotformAgent.vue";
import DoughTimer from "@/components/DoughTimer.vue";
import TimerDebugControls from "@/components/TimerDebugControls.vue";

// Assets
const doughGif = ref("/assets/gif/levain basique.gif");

/**
 * Temps du dernier nourrissage
 * TODO: Récupérer depuis Supabase ou localStorage
 */
const lastFeedTime = ref(new Date()); // Levain fraîchement nourri (pour test)

/**
 * MODE DEBUG : Active le mode accéléré pour voir le timer bouger
 * 1 seconde réelle = 1 heure de levain
 * À DÉSACTIVER EN PRODUCTION !
 */
const DEBUG_ACCELERATED_MODE = true; // ← Mettez à false pour désactiver

// Si le mode accéléré est activé, on démarre avec 10h d'écart pour voir l'animation
if (DEBUG_ACCELERATED_MODE) {
  lastFeedTime.value = new Date(Date.now() - 10 * 1000); // 10 secondes = 10h
}

/**
 * Calcule le statut du levain selon le temps écoulé
 */
const doughStatus = computed(() => {
  const elapsed = Date.now() - lastFeedTime.value.getTime();
  const hoursElapsed = elapsed / (60 * 60 * 1000);

  if (hoursElapsed < 12) {
    return "Actif"; // Vert
  } else if (hoursElapsed < 16) {
    return "Affamé"; // Orange
  } else if (hoursElapsed < 24) {
    return "Très affamé"; // Rouge
  } else {
    return "Négligé"; // Au-delà de 24h
  }
});

/**
 * Nourrit le levain et réinitialise le timer
 */
function feedDough(): void {
  lastFeedTime.value = new Date();

  // TODO: Sauvegarder dans Supabase
  // TODO: Augmenter le score/XP
  // TODO: Changer l'animation du levain

  console.log('Levain nourri !', lastFeedTime.value);
}

/**
 * Gère l'expiration du timer (24h écoulées)
 */
function handleTimerExpired(): void {
  console.warn('⚠️ Le levain n\'a pas été nourri depuis 24h !');

  // TODO: Changer l'état du levain à "mort" ou "négligé"
  // TODO: Envoyer une notification push
  // TODO: Pénalité sur le score
}

/**
 * Met à jour le temps pour le debug (temporaire)
 */
function updateDebugTime(newDate: Date): void {
  lastFeedTime.value = newDate;
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  padding-bottom: var(--spacing-2xl);
  position: relative;
  min-height: 844px;
}

/**
 * Décor d'arrière-plan (effet carrousel)
 * Image de levain en transparence à droite
 */
.home-page::after {
  content: "";
  position: absolute;
  top: 247px;
  right: -70px;
  width: 227px;
  height: 227px;
  background: url("/assets/mascott/Version_de_base-removebg-preview.png") center / contain no-repeat;
  opacity: 0.25;
  filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.15));
  pointer-events: none;
  z-index: 0;
}

.home-page__dough-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  z-index: 1;
  margin-top: var(--spacing-4xl);
}

.home-page__dough-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  border-radius: 50%;
}

.home-page__status {
  font-family: var(--font-display);
  font-size: var(--font-size-3xl);
  font-weight: 400;
  color: var(--color-text-primary);
  letter-spacing: -0.73px;
  margin: 0;
  text-align: center;
}

.home-page__feed-button {
  width: 100%;
  max-width: 298px;
  z-index: 1;
}

/* ========================================
   RESPONSIVE - Tablet & Desktop
   ======================================== */
@media (min-width: 768px) {
  .home-page {
    gap: var(--spacing-2xl);
    padding-top: var(--spacing-2xl);
    min-height: auto;
  }

  .home-page__dough-section {
    margin-top: var(--spacing-3xl);
  }

  .home-page__status {
    font-size: calc(var(--font-size-3xl) * 1.1);
  }

  .home-page__feed-button {
    max-width: 360px;
  }
}

@media (min-width: 1024px) {
  .home-page {
    gap: var(--spacing-3xl);
    padding-top: var(--spacing-3xl);
  }

  .home-page__dough-section {
    margin-top: var(--spacing-4xl);
  }

  .home-page__feed-button {
    max-width: 400px;
  }
}
</style>