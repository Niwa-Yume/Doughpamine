<!--
  AppHeader - Composant header réutilisable avec bouton retour optionnel

  Props:
  - title: Titre de la page (requis)
  - showBackButton: Afficher le bouton retour (défaut: true)

  Événements:
  - back: Émis quand l'utilisateur clique sur le bouton retour

  Exemple:
  <AppHeader title="Mon Profil" @back="goBack" />
-->
<template>
  <header class="app-header">
    <button
      v-if="showBackButton"
      class="back-button"
      aria-label="Retour"
      @click="handleBack"
    >
      <img src="/assets/SVG/back-arrow.svg" alt="Retour" />
    </button>
    <h1 class="app-header__title">{{ title }}</h1>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

/**
 * Props du composant
 */
interface Props {
  title: string;
  showBackButton?: boolean;
}

withDefaults(defineProps<Props>(), {
  showBackButton: true,
});

const emit = defineEmits<{
  back: []
}>();

const router = useRouter();

/**
 * Gère le clic sur le bouton retour
 * Émet l'événement 'back' si un parent l'écoute, sinon utilise router.back()
 */
function handleBack() {
  emit('back');
  // Si le parent n'a pas géré l'événement, on utilise le comportement par défaut
  router.back();
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: var(--spacing-lg) 0;
  width: 100%;
}

.back-button {
  position: absolute;
  left: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  transition: transform var(--transition-fast);
}

.back-button:hover {
  transform: scale(1.1);
}

.back-button:active {
  transform: scale(0.95);
}

.back-button img {
  width: 24px;
  height: 24px;
}

.app-header__title {
  font-family: var(--h1-font-family);
  font-size: var(--font-size-2xl);
  font-weight: var(--h1-font-weight);
  color: var(--color-text-primary);
  text-align: center;
  letter-spacing: var(--h1-letter-spacing);
  margin: 0;
}

/* Responsive */
@media (min-width: 768px) {
  .app-header__title {
    font-size: var(--font-size-3xl);
  }
}

@media (min-width: 1024px) {
  .app-header__title {
    font-size: var(--h1-font-size);
  }
}
</style>

