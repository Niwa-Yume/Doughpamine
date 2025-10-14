<template>
  <ion-page>
    <ModernNavBar />
    <ion-content :fullscreen="true" class="flex [--background:var(--ion-background-color)]">
      <div class="flex flex-col items-center justify-center h-full px-6 py-12">
        <div class="text-center mb-10">
          <div class="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
            <ion-img src="/assets/mascott/Version de base.png" alt="Logo" class="w-full h-full object-cover" />
          </div>
          <h1 class="text-3xl font-bold text-[var(--ion-color-primary)] mb-3">Bienvenue chez Doughpamine 🍪</h1>
          <p class="text-base text-[var(--ion-text-color)] opacity-80 max-w-md mx-auto">
            Commence ton aventure en créant ton propre levain ou lie-toi à un levain existant !
          </p>
        </div>

        <div class="w-full max-w-md flex flex-col gap-4">
          <ion-button
            expand="block"
            size="large"
            color="primary"
            class="h-16 text-lg font-semibold shadow-lg"
            @click="createNewDough"
          >
            <div class="flex flex-col items-center py-2">
              <span class="text-2xl mb-1">🌾</span>
              <span>Créer mon levain</span>
            </div>
          </ion-button>

          <ion-button
            expand="block"
            size="large"
            color="secondary"
            class="h-16 text-lg font-semibold shadow-lg"
            @click="linkExistingDough"
          >
            <div class="flex flex-col items-center py-2">
              <span class="text-2xl mb-1">🔗</span>
              <span>Lier mon levain</span>
            </div>
          </ion-button>
        </div>

        <div class="mt-8 text-center">
          <p class="text-sm text-[var(--ion-text-color)] opacity-60">
            Ton levain virtuel t'attend pour grandir avec toi !
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonImg } from '@ionic/vue';
import { useRouter } from 'vue-router';
import ModernNavBar from '@/components/ModernNavBar.vue';

const router = useRouter();

const createNewDough = () => {
  // TODO: Navigation vers la page de création de levain
  console.log('Créer un nouveau levain');
  // router.push('/create-dough/new');
};

const linkExistingDough = () => {
  // TODO: Navigation vers la page de liaison de levain
  console.log('Lier un levain existant');
  // router.push('/create-dough/link');
};
</script>

<style scoped>
ion-button {
  --border-radius: 16px;
  --box-shadow: 0 4px 14px rgba(123, 94, 59, 0.2);
  transition: transform 0.2s ease;
}

ion-button:active {
  transform: scale(0.98);
}

ion-button[color="primary"] {
  --background: var(--ion-color-primary);
  --background-hover: var(--ion-color-primary-tint);
  --background-activated: var(--ion-color-primary-shade);
}

ion-button[color="secondary"] {
  --background: var(--ion-color-secondary);
  --background-hover: var(--ion-color-secondary-tint);
  --background-activated: var(--ion-color-secondary-shade);
}
</style>

