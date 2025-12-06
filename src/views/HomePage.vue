<template>
  <ion-page>
    <ion-content :scrollY="false">
      <!-- Widget AI Jotform via composant dédié - Uniquement visible sur /home -->
      <JotformAgent v-if="isHomePage"  />

      <!-- Liste d'icônes (streak + profile) -->
      <IconListComponent v-if="levain" />

      <div class="home-page app-container">

        <div class="home-page__dough-section" v-if="levain">
          <DoughTimer
            :lastFeedTime="computedLastFeedTime"
            :size="240"
            :contentSize="200"
            :strokeWidth="6"
            :showTimeLabel="true"
            :acceleratedMode="DEBUG_ACCELERATED_MODE"
            :maxDuration="timeUntilHungry"
            @timeExpired="handleTimerExpired"
            @checkAutoTransition="updateStateBasedOnTime"
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


          <!-- Message d'information pour l'état "Jeune" -->
          <div v-if="levain.current_state_name === 'Jeune'" class="home-page__info-message home-page__info-message--incubation">
            <p class="info-message__title">🌱 Période d'incubation</p>
            <p class="info-message__text">
              Votre levain est jeune et se développe ! Nourrissez-le quotidiennement pendant 6 jours pour qu'il devienne actif et prêt à faire du pain.
            </p>
            <div class="info-message__progress">
              <div class="progress-bar">
                <div class="progress-bar__fill" :style="{ width: `${incubationProgress}%` }"></div>
              </div>
              <p class="progress-text">
                {{ daysUntilActive > 0 ? `${daysUntilActive} jour${daysUntilActive > 1 ? 's' : ''} restant${daysUntilActive > 1 ? 's' : ''}` : 'Presque prêt !' }}
              </p>
            </div>
          </div>

          <!-- Message d'information pour l'état "Mort" -->
          <div v-if="levain.current_state_name === 'Mort'" class="home-page__info-message home-page__info-message--mort">
            <p class="info-message__title">💀 Levain mort</p>
            <p class="info-message__text">
              Votre levain est mort, mais il n'est pas trop tard ! En le nourrissant, vous pourrez le relancer et il repassera par une phase d'incubation de 6 jours pour retrouver toute sa vitalité.
            </p>
          </div>

          <div class="home-page__name-container">
            <h1 class="home-page__name">{{ doughName }}</h1>
            <button
              class="home-page__edit-name"
              @click="openRenameModal"
              aria-label="Renommer le levain"
              title="Renommer le levain"
            >
              <ion-icon :icon="pencilOutline"></ion-icon>
              <span class="edit-name__label">Renommer</span>
            </button>
          </div>

          <!-- Sélecteur d'état du levain -->
          <select
            class="home-page__status-select"
            v-model="selectedState"
            aria-label="Sélection de l'état du levain"
          >
            <option v-for="opt in levainStates" :key="opt.name" :value="opt.name">
              {{ getStateDisplayName(opt.name) }}
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
      </div>

      <!-- Modal de renommage -->
      <RenameLevainModal
        :is-open="isRenameModalOpen"
        :current-name="doughName"
        @close="closeRenameModal"
        @renamed="handleRenamed"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { pencilOutline } from 'ionicons/icons'
import { useRoute, useRouter } from 'vue-router'
import NewButton from '@/components/NewButton.vue'
import JotformAgent from '@/components/JotformAgent.vue'
import DoughTimer from '@/components/DoughTimer.vue'
import IconListComponent from '@/components/IconListComponent.vue'
import RenameLevainModal from '@/components/RenameLevainModal.vue'
import { useDough } from '@/composables/useDough'
import { useStreakStore } from '@/stores/streakStore'
import { STATE_DB_TO_MACHINE, LEVAIN_STATE_MACHINE, parseDelayHours, getStateDisplayName } from '@/config/levainStateMachine'

const route = useRoute()
const router = useRouter()
const isHomePage = computed(() => route.path === '/home')

// Store de streak
const streakStore = useStreakStore()


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
  'Jeune': '/assets/video/levain oeuf.mp4',

  'Actif/prêt': '/assets/video/levain nourri.mp4',
  'Négligé': '/assets/video/levain-neglige.mp4',
  'Affamé': '/assets/video/levain-affame.mp4',
};

// Vidéo par défaut si l'état n'est pas reconnu
const DEFAULT_VIDEO = '/assets/video/levain basique.mp4';

// Récupère le levain courant (si connecté)
const { levain, states, feedLevain, updateLevainState, updateStateBasedOnTime, timeUntilHungry } = useDough();

// Calcule la durée maximale de l'état actuel (en heures)
const maxDurationHours = computed(() => {
  if (!levain.value?.current_state_name) return 24;

  const machineState = STATE_DB_TO_MACHINE[levain.value.current_state_name];
  const stateConfig = machineState ? LEVAIN_STATE_MACHINE.states[machineState] : null;
  const rienFaireAction = stateConfig?.actions.rien_faire;

  if (!rienFaireAction?.delay_h) return 24;

  return parseDelayHours(rienFaireAction.delay_h) || 24;
});

// État du modal de renommage
const isRenameModalOpen = ref(false);

function openRenameModal() {
  isRenameModalOpen.value = true;
}

function closeRenameModal() {
  isRenameModalOpen.value = false;
}

function handleRenamed(newName: string) {
  console.log('✅ Levain renommé en:', newName);
  // Le levain est déjà mis à jour dans useDough, pas besoin de faire autre chose
}

// Vidéo dynamique basée sur l'état actuel
const currentVideo = computed(() => {
  const stateName = levain.value?.current_state_name;
  //console.log('🎬 État actuel:', stateName);

  if (!stateName) {
    //console.log('⚠️ Pas d\'état, vidéo par défaut:', DEFAULT_VIDEO);
    return DEFAULT_VIDEO;
  }

  const video = STATE_TO_VIDEO[stateName] || DEFAULT_VIDEO;
  //console.log('🎥 Vidéo sélectionnée:', video);

  return video;
});

// Nom affiché (fallback "Roger")
const doughName = computed(() => levain.value?.name || "Roger");

// Progression de l'incubation pour l'état "Jeune" (0-100%)
const incubationProgress = computed(() => {
  if (!levain.value || levain.value.current_state_name !== 'Jeune') return 0;

  const createdAt = new Date(levain.value.created_at).getTime();
  const now = Date.now();
  const elapsed = now - createdAt;
  const total = 144 * 60 * 60 * 1000; // 6 jours en millisecondes

  return Math.min(100, Math.max(0, (elapsed / total) * 100));
});

// Jours restants pour l'incubation
const daysUntilActive = computed(() => {
  if (!levain.value || levain.value.current_state_name !== 'Jeune') return 0;

  const createdAt = new Date(levain.value.created_at).getTime();
  const endTime = createdAt + (144 * 60 * 60 * 1000); // +6 jours
  const remaining = endTime - Date.now();

  return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
});

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
  console.log('🎯 handleFeed appelée !', levain.value);
  if (!levain.value) {
    console.log('❌ Pas de levain, annulation');
    return;
  }
  console.log('✅ Appel de feedLevain()');
  await feedLevain();

  // Mettre à jour la streak
  streakStore.updateStreakOnFeed();
}

/**
 * Navigue vers la page de liaison de levain existant
 */
function navigateToChat(): void {
  router.push('/chat');
}

/**
 * Gère l'expiration du timer
 */
function handleTimerExpired(): void {
  const duration = maxDurationHours.value;
  console.warn(`⚠️ Le levain n'a pas été nourri depuis ${duration}h !`);
  // Vérifier si une transition automatique est nécessaire
  updateStateBasedOnTime();
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
  //console.log('✅ VIDÉO CHARGÉE:', video.src);
}

/**
 * Redirection automatique vers /create-dough si pas de levain
 */
onMounted(() => {
  // Ne pas vérifier si skipCheck=true (utilisateur vient de créer un levain)
  const skipCheck = route.query?.skipCheck === 'true';

  if (skipCheck) {
    console.log('✅ HomePage: skipCheck=true, pas de vérification du levain au montage');
    // Nettoyer le paramètre de l'URL pour ne pas le garder indéfiniment
    router.replace({ path: '/home', query: {} });
    return;
  }

  // Vérifier si la streak doit expirer
  streakStore.checkStreakExpiry();
});

// Watcher pour surveiller si le levain disparaît (par exemple après suppression)
watch(levain, (newLevain) => {
  if (!newLevain && route.path === '/home') {
    console.log('⚠️ HomePage: Levain supprimé, redirection vers /create-dough');
    router.push('/create-dough');
  }
});
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md, 12px);
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px) var(--spacing-lg, 24px);
  position: relative;
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height pour mobile */
  justify-content: flex-start;
  overflow-y: auto;
}

/* Media queries pour petits mobiles (iPhone SE, 12 mini, etc.) */
@media (max-width: 375px) {
  .home-page {
    gap: var(--spacing-sm, 8px);
    padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px) var(--spacing-md, 16px);
  }
}

@media (max-height: 700px) {
  .home-page {
    gap: 30px;
    padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px) var(--spacing-md, 16px);
  }
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
  gap: var(--spacing-md, 12px);
  z-index: 1;
  margin-top: var(--spacing-md, 16px);
}


/* Ajustement pour petits mobiles */
@media (max-width: 375px) {
  .home-page__dough-section {
    gap: var(--spacing-sm, 8px);
    margin-top: var(--spacing-sm, 8px);
  }
}

@media (max-height: 670px) {
  .home-page__dough-section {
    gap: 30px;
    margin-top: var(--spacing-sm, 8px);
  }
}

/* Ajustement spécifique pour iPhone SE et petits mobiles (375x667) */
@media (max-width: 375px) and (max-height: 670px) {
  .home-page__dough-section {
    gap: var(--spacing-lg, 16px);
    margin-bottom: var(--spacing-md, 12px);
  }

  .home-page {
    gap: var(--spacing-lg, 20px);
  }
}

.home-page__dough-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  border-radius: 50%;
}

/* Container pour le nom + bouton d'édition */
.home-page__name-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm, 12px);
  width: 100%;
  max-width: 90vw;
}

/* Nouveau: nom du levain */
.home-page__name {
  font-family: var(--font-display, system-ui, sans-serif);
  font-size: var(--font-size-2xl, 24px);
  font-weight: 400;
  color: var(--color-text-primary);
  letter-spacing: -0.73px;
  margin: 0;
  text-align: center;
  flex-shrink: 1;
  min-width: 0;
}

/* Ajustement pour écrans plus grands */
@media (min-width: 390px) {
  .home-page__name {
    font-size: var(--font-size-3xl);
  }
}

.home-page__edit-name {
  background: var(--pure-white, #FFFFFF);
  border: 2px solid var(--color-border, #000);
  border-radius: var(--border-radius-md, 8px);
  cursor: pointer;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--marron, #955934);
  box-shadow: var(--shadow-sm, 2px 3px 0 0 rgba(0, 0, 0, 0.85));
  transition: all var(--transition-fast, 120ms ease);
  flex-shrink: 0;
  font-family: var(--font-body, system-ui, sans-serif);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.home-page__edit-name ion-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.edit-name__label {
  display: inline-block;
  line-height: 1;
}

/* Masquer le texte sur très petits écrans */
@media (max-width: 360px) {
  .edit-name__label {
    display: none;
  }

  .home-page__edit-name {
    padding: 8px;
    border-radius: 50%;
  }
}

.home-page__edit-name:hover {
  background-color: var(--marron, #955934);
  color: var(--pure-white, #FFFFFF);
  transform: translateY(-2px);
  box-shadow: 2px 5px 0 0 rgba(0, 0, 0, 0.85);
}

.home-page__edit-name:active {
  transform: translateY(1px);
  box-shadow: 1px 2px 0 0 rgba(0, 0, 0, 0.85);
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

/* Message d'information pour l'état "Jeune" */
.home-page__info-message {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: var(--border-radius-md, 12px);
  padding: var(--spacing-sm, 12px);
  margin: var(--spacing-sm, 12px) 0;
  border-left: 4px solid #4caf50;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1);
  max-width: 90vw;
  width: 100%;
}

@media (min-width: 390px) {
  .home-page__info-message {
    padding: var(--spacing-md, 16px);
    margin: var(--spacing-md, 16px) 0;
  }
}

/* Variante pour l'état "Mort" */
.home-page__info-message--mort {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-left-color: #f44336;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.1);
}

.home-page__info-message--mort .info-message__title {
  color: #c62828;
}

.home-page__info-message--mort .info-message__text {
  color: #b71c1c;
}

.info-message__title {
  font-family: var(--font-display, 'ADLaM Display', sans-serif);
  font-size: var(--font-size-md, 18px);
  font-weight: 600;
  color: #2e7d32;
  margin: 0 0 var(--spacing-xs, 8px) 0;
}

.info-message__text {
  font-family: var(--font-body, system-ui, sans-serif);
  font-size: var(--font-size-sm, 14px);
  color: #1b5e20;
  margin: 0;
  line-height: 1.5;
}

.info-message__progress {
  margin-top: var(--spacing-sm, 12px);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: rgba(46, 125, 50, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--spacing-xs, 8px);
}

.progress-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, #66bb6a 0%, #4caf50 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-family: var(--font-body, system-ui, sans-serif);
  font-size: var(--font-size-xs, 12px);
  font-weight: 600;
  color: #2e7d32;
  margin: 0;
  text-align: center;
}

/* ========================================
   RESPONSIVE - Tablet & Desktop
   ======================================== */

@media (min-width: 390px) {
  .home-page {
    gap: var(--spacing-xl);
    justify-content: space-evenly;
  }
}


@media (min-width: 768px) {
  .home-page {
    gap: var(--spacing-2xl);
    padding-top: var(--spacing-2xl);
    min-height: auto;
    justify-content: space-evenly;
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
    justify-content: space-evenly;
    height: fit-content;
  }

  .home-page__dough-section {
    margin-top: var(--spacing-4xl);
  }

  .home-page__edit-name {
    padding: 8px 16px;
    font-size: 14px;
  }

  .home-page__edit-name ion-icon {
    font-size: 20px;
  }

  .edit-name__label {
    display: inline-block;
  }

  .home-page__info-message {
    max-width: 600px;
  }

  .info-message__title {
    font-size: var(--font-size-lg, 20px);
  }

  .info-message__text {
    font-size: var(--font-size-md, 16px);
  }

  .home-page__feed-button {
    max-width: 400px;
  }
}
</style>