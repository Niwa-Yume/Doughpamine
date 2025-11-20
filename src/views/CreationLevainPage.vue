<template>
  <ion-page>
    <ion-content :scroll-y="false">
      <main class="sourdough-creation-container">
        <a href="#" class="back-link" @click.prevent="goBack">
          <img src="/assets/SVG/back-arrow.svg" alt="Retour en arrière">
        </a>
        <h1 class="title">Création du levain</h1>
        <div class="video-placeholder">
          <video
            src="/assets/video/video%20tuto%20levain.mp4"
            autoplay
            loop
            playsinline
          ></video>
        </div>
        <form class="creation-form" @submit.prevent="handleSubmit">
          <input
            type="text"
            class="sourdough-name-input"
            placeholder="Nom du levain ...."
            v-model="nomLevain"
            required
          >
          <button type="submit" class="submit-button" :disabled="isSubmitting">
            {{ isSubmitting ? 'Création...' : 'Valider' }}
          </button>
        </form>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { user } = useAuth();

const nomLevain = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

function goBack() {
  router.back();
}

async function handleSubmit() {
  if (!user.value) {
    errorMessage.value = 'Vous devez être connecté pour créer un levain';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // Créer le levain dans la base de données
    const { error } = await supabase
      .from('doughs')
      .insert([
        {
          user_id: user.value.id,
          name: nomLevain.value,
          status: 'new',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;

    successMessage.value = 'Levain créé avec succès !';

    // Réinitialiser le formulaire
    nomLevain.value = '';

    // Rediriger vers la page d'accueil après 1.5 secondes
    setTimeout(() => {
      router.push('/home');
    }, 1500);

  } catch (e: any) {
    errorMessage.value = e.message || 'Erreur lors de la création du levain';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}

.sourdough-creation-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 390px;
  margin: 0 auto;
  padding: 20px 24px 20px;
  background-color: #f4e2c9;
  min-height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  justify-content: center;
}

.title {
  color: #000000;
  font-family: var(--font-display, 'ADLaM Display', sans-serif);
  font-weight: 400;
  font-size: 36px;
  line-height: 1.2;
  text-align: center;
  letter-spacing: -0.72px;
  margin: 0 0 15px 0;
  width: 294px;
}

.video-placeholder {
  width: 180px;
  height: 320px;
  margin-bottom: 15px;
}

.video-placeholder img,
.video-placeholder video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
  background: transparent;
}

.creation-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
}

.sourdough-name-input {
  width: 294px;
  height: 55px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: inset 0px 0px 5px 3px rgba(0, 0, 0, 0.25);
  border: none;
  padding: 17px 13px;
  font-family: var(--font-display, 'ADLaM Display', sans-serif);
  font-size: 16px;
  line-height: 20.88px;
  text-align: center;
  letter-spacing: -0.32px;
  color: #000000;
}

.sourdough-name-input::placeholder {
  color: #000000;
  opacity: 1;
}

.submit-button {
  width: 294px;
  height: 53px;
  background-color: #955934;
  border: 2px solid #000000;
  border-radius: 4000px;
  box-shadow: 2px 4px 0px 0px #000000;
  color: #ffffff;
  font-family: var(--font-display, 'ADLaM Display', sans-serif);
  font-size: 18px;
  font-weight: 400;
  line-height: 23.48px;
  text-align: center;
  letter-spacing: -0.36px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 85px;
  transition: transform 0.1s ease;
}

.submit-button:active {
  transform: scale(0.98);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.back-link {
  margin-top: 15px;
  width: 59px;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: flex-start;
}

.back-link img {
  width: 100%;
  height: auto;
}

.error-message {
  color: #c32727;
  font-size: 14px;
  text-align: center;
  margin-top: 20px;
  font-family: var(--font-display, 'ADLaM Display', sans-serif);
}

.success-message {
  color: #1b7e26;
  font-size: 14px;
  text-align: center;
  margin-top: 20px;
  font-family: var(--font-display, 'ADLaM Display', sans-serif);
}
</style>

