<template>
  <ion-page>
    <ion-content :scroll-y="true">
      <div class="auth-page app-container">
        <h1 class="page-title">DoughPamine</h1>

        <p class="auth-page__description">
          Avec Doughpamine, nourrir ton levain devient une routine fun, ludique et motivante.
        </p>

        <img
          class="auth-page__mascot"
          alt="Mascotte de levain"
          :src="mascotGif"
        />

        <button
          class="auth-page__google-button"
          @click="handleGoogleSignIn"
          @keydown.enter="handleGoogleSignIn"
        >
          <GoogleLogo class="auth-page__google-logo" />
          <span class="auth-page__google-text">Continuer avec Google</span>
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { useAuth } from "@/composables/useAuth";
import { useRoute } from "vue-router";
import GoogleLogo from "@/components/GoogleLogo.vue";

// Assets
const mascotGif = "/assets/gif/levain crop.gif";

const { signInWithGoogle } = useAuth();
const route = useRoute();

/**
 * Gère l'authentification Google
 * Redirige vers la page demandée après connexion (ou /profile par défaut)
 */
function handleGoogleSignIn(): void {
  const redirectPath = (route.query.redirect as string) || '/profile';
  const callbackUrl = `/auth?redirect=${encodeURIComponent(redirectPath)}`;
  signInWithGoogle(callbackUrl);
}
</script>

<style scoped>
.auth-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-bottom: var(--spacing-xl);
}

.auth-page__description {
  color: var(--color-text-primary);
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  margin: var(--spacing-md) 0 0;
  max-width: 294px;
  padding: 0 var(--spacing-md);
}

.auth-page__mascot {
  height: 372px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  margin-top: var(--spacing-xl);
}

.auth-page__google-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  background-color: var(--color-surface);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-button);
  height: var(--button-height-md);
  width: 100%;
  max-width: 294px;
  margin-top: var(--spacing-2xl);
  padding: var(--spacing-xs) var(--spacing-md);
  cursor: pointer;
  border: none;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.auth-page__google-button:hover {
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.23), 0px 0px 2px rgba(0, 0, 0, 0.15);
}

.auth-page__google-button:active {
  transform: scale(0.99);
}

.auth-page__google-logo {
  width: 49px;
  height: 49px;
  flex-shrink: 0;
}

.auth-page__google-text {
  color: var(--color-text-light);
  font-size: var(--font-size-lg);
  font-weight: 500;
  white-space: nowrap;
}

/* ========================================
   RESPONSIVE - Tablet & Desktop
   ======================================== */
@media (min-width: 768px) {
  .auth-page {
    padding-top: var(--spacing-2xl);
  }

  .auth-page__description {
    font-size: var(--font-size-lg);
    max-width: 400px;
    margin-top: var(--spacing-lg);
  }

  .auth-page__mascot {
    height: 450px;
    margin-top: var(--spacing-2xl);
  }

  .auth-page__google-button {
    max-width: 400px;
    height: 80px;
    margin-top: var(--spacing-3xl);
  }

  .auth-page__google-logo {
    width: 56px;
    height: 56px;
  }

  .auth-page__google-text {
    font-size: var(--font-size-xl);
  }
}

@media (min-width: 1024px) {
  .auth-page {
    padding-top: var(--spacing-3xl);
    justify-content: center;
  }

  .auth-page__description {
    max-width: 450px;
  }

  .auth-page__mascot {
    height: 380px;
    margin-top: var(--spacing-xl);
  }

  .auth-page__google-button {
    max-width: 450px;
    height: 85px;
  }

  .auth-page__google-button:hover {
    transform: translateY(-2px);
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.23), 0px 0px 4px rgba(0, 0, 0, 0.15);
  }

  .auth-page__google-button:active {
    transform: translateY(0) scale(0.99);
  }

  .auth-page__google-logo {
    width: 60px;
    height: 60px;
  }
}
</style>