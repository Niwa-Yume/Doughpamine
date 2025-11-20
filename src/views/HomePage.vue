<!--
  HomePage - Page d'accueil avec le levain et timer de nourrissage

  Affiche :
  - Widget AI Jotform pour assistance
  - Timer circulaire visuel (24h)
  - Nom du levain + sélection de statut
  - Bouton pour nourrir le levain
-->
<template>
  <ion-page>
    <ion-content>
      <!-- Widget AI Jotform via composant dédié -->
      <JotformAgent />

      <div class="home-page app-container">

        <!-- Timer circulaire avec le levain au centre -->
        <div class="home-page__dough-section" v-if="levain">
          <DoughTimer
            :lastFeedTime="computedLastFeedTime"
            :size="240"
            :contentSize="200"
            :strokeWidth="6"
            :showTimeLabel="true"
            :acceleratedMode="DEBUG_ACCELERATED_MODE"
            @timeExpired="handleTimerExpired"
          >
            <video
              :key="currentVideo"
              class="home-page__dough-image"
              :src="currentVideo"
              autoplay
              loop
              muted
              playsinline
              @error="onVideoError"
              @loadeddata="onVideoLoaded"
            ></video>
          </DoughTimer>

          <!-- Nom du levain -->
          <h1 class="home-page__name">{{ doughName }}</h1>

          <!-- Sélecteur d'état du levain -->
          <select
            class="home-page__status-select"
            v-model="selectedState"
            aria-label="Sélection de l'état du levain"
          >
            <option v-for="opt in levainStates" :key="opt.name" :value="opt.name">
              {{ opt.name }}
            </option>
          </select>
        </div>

        <p v-else class="home-page__empty">Aucun levain trouvé.</p>

        <!-- Bouton pour nourrir -->
        <NewButton
          text="NOURRIR"
          class="home-page__feed-button"
          @click="handleFeed"
          :disabled="!levain"
        />

       <!-- DEBUG: Contrôles de test du timer (À SUPPRIMER en production)
        <TimerDebugControls
          :lastFeedTime="computedLastFeedTime"
          @updateTime="updateDebugTime"
        />
        -->
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import NewButton from '@/components/NewButton.vue'
import JotformAgent from '@/components/JotformAgent.vue'
import DoughTimer from '@/components/DoughTimer.vue'
import { useDough } from '@/composables/useDough'


// Mapping des états vers les vidéos
// Fichiers renommés SANS accents pour éviter problèmes d'encodage
const STATE_TO_VIDEO: Record<string, string> = {
  // Noms SANS accents (nouveaux)
  'Actif': '/assets/video/levain joyeux et actif.mp4',
  'Actif/pret': '/assets/video/levain nourri.mp4',
  'Neglige': '/assets/video/levain-neglige.mp4',
  'Affame': '/assets/video/levain-affame.mp4',
  'Au frais': '/assets/video/levain-congele.mp4',
  'Mort': '/assets/video/levain mort.mp4',

  // Fallback pour anciens noms AVEC accents (BDD pas encore migrée)
  'Actif/prêt': '/assets/video/levain nourri.mp4',
  'Négligé': '/assets/video/levain-neglige.mp4',
  'Affamé': '/assets/video/levain-affame.mp4',
};

// Vidéo par défaut si l'état n'est pas reconnu
const DEFAULT_VIDEO = '/assets/video/levain basique.mp4';

// Récupère le levain courant (si connecté)
const { levain, states, feedLevain, updateLevainState } = useDough();

// Vidéo dynamique basée sur l'état actuel
const currentVideo = computed(() => {
  const stateName = levain.value?.current_state_name;
  console.log('🎬 État actuel:', stateName);

  if (!stateName) {
    console.log('⚠️ Pas d\'état, vidéo par défaut:', DEFAULT_VIDEO);
    return DEFAULT_VIDEO;
  }

  const video = STATE_TO_VIDEO[stateName] || DEFAULT_VIDEO;
  console.log('🎥 Vidéo sélectionnée:', video);

  return video;
});

// Nom affiché (fallback "Roger")
const doughName = computed(() => levain.value?.name || "Roger");

// États du levain disponibles (SOT: levain_states dans Supabase)
const levainStates = computed(() => states.value);

// État sélectionné dans le sélecteur - initialisé avec le statut actuel du levain
const selectedState = computed({
  get: () => levain.value?.current_state_name || 'Actif',
  set: (val: string) => {
    if (levain.value) {
      updateLevainState(val);
    }
  }
});

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
  const iso = levain.value?.last_fed_at;
  return iso ? new Date(iso) : localLastFeedTime.value;
});

/**
 * Nourrit le levain et réinitialise le timer
 */
async function handleFeed(): Promise<void> {
  if (!levain.value) return;
  await feedLevain();
}


/**
 * Gère l'expiration du timer (24h écoulées)
 */
function handleTimerExpired(): void {
  console.warn('⚠️ Le levain n\'a pas été nourri depuis 24h !');
  // TODO: actions supplémentaires (notification, etc.)
}

/**
 * Debug: Erreur de chargement vidéo
 */
function onVideoError(event: Event): void {
  const video = event.target as HTMLVideoElement;
  console.error('❌ ERREUR VIDÉO:', {
    src: video.src,
    error: video.error,
    networkState: video.networkState,
    readyState: video.readyState
  });
}

/**
 * Debug: Vidéo chargée avec succès
 */
function onVideoLoaded(event: Event): void {
  const video = event.target as HTMLVideoElement;
  console.log('✅ VIDÉO CHARGÉE:', video.src);
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

.home-page__empty {
  color: var(--color-text-secondary, #555);
  font-family: var(--font-body, system-ui, sans-serif);
  margin-top: var(--spacing-3xl);
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
  color: #000;
}

.home-page__status-select option {
  color: #000;
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