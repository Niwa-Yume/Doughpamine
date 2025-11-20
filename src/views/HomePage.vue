<!--
  HomePage - Page d'accueil avec le levain et timer de nourrissage

  Affiche :
  - Widget AI Jotform pour assistance
  - Timer circulaire visuel (24h)
  - Nom du levain + sélection de statut
  - Bouton pour nourrir le levain
-->
<template>
  <div class="home-page app-container">
    <!-- Widget AI Jotform via composant dédié -->
    <JotformAgent />

    <!-- Timer circulaire avec le levain au centre -->
    <div class="home-page__dough-section">
      <DoughTimer
        :lastFeedTime="computedLastFeedTime"
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

      <!-- Nom du levain -->
      <h1 class="home-page__name">{{ doughName }}</h1>

      <!-- Sélecteur d'état du levain -->
      <select
        class="home-page__status-select"
        v-model="selectedStatus"
        @change="handleStatusChange"
        aria-label="Sélection de l'état du levain"
      >
        <option v-for="opt in STATUS_OPTIONS" :key="opt.code" :value="opt.code">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Bouton pour nourrir -->
    <NewButton
      text="NOURRIR"
      class="home-page__feed-button"
      @click="feedDough"
    />

   <!-- DEBUG: Contrôles de test du timer (À SUPPRIMER en production)
    <TimerDebugControls
      :lastFeedTime="computedLastFeedTime"
      @updateTime="updateDebugTime"
    />
    -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import NewButton from "@/components/NewButton.vue";
import JotformAgent from "@/components/JotformAgent.vue";
import DoughTimer from "@/components/DoughTimer.vue";
import { useDough } from "@/composables/useDough";
import { supabase } from "@/lib/supabaseClient";

// Assets
const doughGif = ref("/assets/gif/levain basique.gif");

// Récupère le levain courant (si connecté)
const { dough, feed } = useDough();

// Nom affiché (fallback "Roger")
const doughName = computed(() => dough.value?.name || "Roger");

// Fallback local pour last feed + mode debug
const localLastFeedTime = ref(new Date());

/**
 * MODE DEBUG : Active le mode accéléré pour voir le timer bouger
 * 1 seconde réelle = 1 heure de levain
 * À DÉSACTIVER EN PRODUCTION !
 */
const DEBUG_ACCELERATED_MODE = false; // ← Mode normal activé

// Date du dernier nourrissage: DB si dispo, sinon fallback local
const computedLastFeedTime = computed(() => {
  const iso = dough.value?.last_fed;
  return iso ? new Date(iso) : localLastFeedTime.value;
});

// Options de statut (FR ↔ codes)
const STATUS_OPTIONS = [
  { code: "active", label: "Actif" },
  { code: "fed", label: "Actif/prêt" },
  { code: "starving", label: "Négligé" },
  { code: "hungry", label: "Affamé" },
  { code: "frozen", label: "Au frais" },
  { code: "dead", label: "Mort" },
] as const;

type DoughStatus = "new" | "fed" | "active" | "hungry" | "starving" | "frozen" | "dead";

const selectedStatus = ref<DoughStatus>("active");

// Mettre à jour le select si le levain arrive/charge
watch(
  () => dough.value?.status,
  (s) => {
    if (s) selectedStatus.value = s as DoughStatus;
  },
  { immediate: true }
);

/**
 * Nourrit le levain et réinitialise le timer
 */
async function feedDough(): Promise<void> {
  if (dough.value) {
    await feed();
  } else {
    // Fallback local uniquement
    localLastFeedTime.value = new Date();
  }
  console.log('Levain nourri !', computedLastFeedTime.value);
}

/**
 * Persiste le statut si un levain existe
 */
async function handleStatusChange() {
  const next = selectedStatus.value;
  if (dough.value) {
    try {
      const { error } = await supabase
        .from('doughs')
        .update({ status: next })
        .eq('id', dough.value.id);
      if (error) throw error;
      // Met à jour localement
      dough.value.status = next;
    } catch (e) {
      console.error('Erreur de mise à jour du statut:', e);
    }
  } else {
    // Pas de persistance en mode local
    console.info('Statut modifié localement:', next);
  }
}

/**
 * Gère l'expiration du timer (24h écoulées)
 */
function handleTimerExpired(): void {
  console.warn('⚠️ Le levain n\'a pas été nourri depuis 24h !');
  // TODO: actions supplémentaires (notification, etc.)
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  gap: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  padding-bottom: var(--spacing-2xl);
  position: relative;
  min-height: 844px;
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

/* Nouveau: nom du levain */
.home-page__name {
  font-family: var(--font-display, system-ui, sans-serif);
  font-size: var(--font-size-3xl);
  font-weight: 400;
  color: var(--color-text-primary);
  letter-spacing: -0.73px;
  margin: 0;
  text-align: center;
}

/* Nouveau: select du statut */
.home-page__status-select {
  width: 200px;
  max-width: 80vw;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.2);
  font-family: var(--font-body, system-ui, sans-serif);
  font-size: 14px;
  background: #fff;
}

/* Conservé pour compatibilité (plus utilisé) */
.home-page__status {
  font-family: var(--font-display, system-ui, sans-serif);
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

  .home-page__name {
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