<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="create-dough-page app-container">
        <h1 class="page-title">Création du levain</h1>

        <img
          class="create-dough-page__mascot"
          alt="Mascotte de levain"
          :src="mascotIllustration"
        />

        <div class="create-dough-page__actions">
          <NewButton
            text="CRÉER UN LEVAIN"
            variant="primary"
            class="create-dough-page__button"
            @click="navigateToCreation"
          />

          <NewButton
            text="LIER UN LEVAIN EXISTANT"
            variant="secondary"
            class="create-dough-page__button"
            @click="navigateToLiaison"
          />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { IonPage, IonContent } from '@ionic/vue';
import NewButton from "@/components/NewButton.vue";

const router = useRouter();

// Assets
const mascotIllustration = ref("/assets/mascott/Version de base.png");

/**
 * Navigue vers la page de création de levain
 */
function navigateToCreation(): void {
  router.push('/creation-levain');
}

/**
 * Navigue vers la page de liaison de levain existant
 */
function navigateToLiaison(): void {
  router.push('/liaison-levain');
}
</script>

<style scoped>
.create-dough-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
}

.create-dough-page__mascot {
  width: 189px;
  height: 189px;
  object-fit: contain;
  mix-blend-mode: darken;
}

.create-dough-page__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 296px;
}

.create-dough-page__button {
  width: 100%;
  height: var(--button-height-sm);
}

/* ========================================
   RESPONSIVE - Tablet & Desktop
   ======================================== */
@media (min-width: 768px) {
  .create-dough-page {
    gap: var(--spacing-3xl);
    padding-top: var(--spacing-2xl);
  }

  .create-dough-page__mascot {
    width: 240px;
    height: 240px;
  }

  .create-dough-page__actions {
    max-width: 420px;
  }
}

@media (min-width: 1024px) {
  .create-dough-page {
    gap: var(--spacing-4xl);
    padding-top: var(--spacing-3xl);
  }

  .create-dough-page__mascot {
    width: 300px;
    height: 300px;
  }

  .create-dough-page__actions {
    max-width: 520px;
  }
}
</style>