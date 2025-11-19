<template>
  <ion-page>
    <ion-content :scroll-y="false">
      <section class="liaison-container">
        <img
          src="/assets/mascott/Version_de_base-removebg-preview.png"
          alt="Mascotte levain"
          class="mascot-image"
        >
        <h1 class="title">liaison du levain</h1>
        <form class="liaison-form" @submit.prevent="handleSubmit">
          <input
            type="text"
            class="form-input"
            placeholder="Nom du levain ...."
            v-model="nomLevain"
            required
          >
          <input
            type="text"
            class="form-input"
            placeholder="âge du levain ...."
            v-model="ageLevain"
            required
          >
          <input
            type="text"
            class="form-input form-input-date"
            placeholder="Dernier moment ou il a été nourri"
            v-model="dernierNourri"
            required
          >
          <button type="submit" class="submit-button" :disabled="isSubmitting">
            {{ isSubmitting ? 'Liaison en cours...' : 'Valider liaison' }}
          </button>
        </form>
        <a href="#" class="back-arrow" @click.prevent="goBack">
          <img src="/assets/SVG/back-arrow.svg" alt="Flèche retour en arrière">
        </a>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </section>
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
const ageLevain = ref('');
const dernierNourri = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

function goBack() {
  router.back();
}

async function handleSubmit() {
  if (!user.value) {
    errorMessage.value = 'Vous devez être connecté pour lier un levain';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // Créer le levain dans la base de données
    const { data, error } = await supabase
      .from('doughs')
      .insert([
        {
          user_id: user.value.id,
          name: nomLevain.value,
          age: ageLevain.value,
          last_fed: dernierNourri.value,
          status: 'active',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;

    successMessage.value = 'Levain lié avec succès !';

    // Réinitialiser le formulaire
    nomLevain.value = '';
    ageLevain.value = '';
    dernierNourri.value = '';

    // Rediriger vers la page d'accueil après 1.5 secondes
    setTimeout(() => {
      router.push('/home');
    }, 1500);

  } catch (e: any) {
    errorMessage.value = e.message || 'Erreur lors de la liaison du levain';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.liaison-container {
  max-width: 390px;
  margin: 0 auto;
  background-color: #f2e5ca;
  border-radius: 15px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 24px 20px;
  min-height: 100vh;
  max-height: 100vh;
  justify-content: center;
}

.mascot-image {
  width: 140px;
  height: 140px;
  object-fit: contain;
  margin-bottom: 10px;
  background: transparent;
}

.title {
  color: #000000;
  font-family: var(--font-display, 'ADLaM Display', cursive);
  font-weight: 400;
  font-size: 36px;
  line-height: 1.2;
  letter-spacing: -0.72px;
  text-align: center;
  margin: 0 0 20px 0;
  max-width: 294px;
}

.liaison-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 294px;
  gap: 18px;
}

.form-input {
  background-color: #ffffff;
  border: none;
  border-radius: 10px;
  box-shadow: inset 0px 0px 5px 3px rgba(0, 0, 0, 0.25);
  padding: 17px 13px;
  font-family: var(--font-display, 'ADLaM Display', cursive);
  font-weight: 400;
  font-size: 16px;
  line-height: 20.875px;
  letter-spacing: -0.32px;
  text-align: center;
  color: #000000;
  width: 100%;
}

.form-input::placeholder {
  color: #000000;
  opacity: 1;
  font-family: var(--font-display, 'ADLaM Display', cursive);
  font-weight: 400;
  font-size: 16px;
  letter-spacing: -0.32px;
  text-align: center;
}

.form-input-date::placeholder {
  font-size: 14px;
  line-height: 18.26px;
  letter-spacing: -0.28px;
}

.submit-button {
  background-color: #955934;
  border: 2px solid #000000;
  border-radius: 4000px;
  box-shadow: 2px 4px 0px 0px #000000;
  padding: 15px;
  color: #ffffff;
  font-family: var(--font-display, 'ADLaM Display', cursive);
  font-weight: 400;
  font-size: 18px;
  line-height: 23.48px;
  letter-spacing: -0.36px;
  text-align: center;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
  transition: transform 0.1s ease;
}

.submit-button:active {
  transform: scale(0.98);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.back-arrow {
  display: block;
  margin-top: 20px;
}

.back-arrow img {
  width: 59px;
  height: 44px;
  display: block;
}

.error-message {
  color: #c32727;
  font-size: 14px;
  text-align: center;
  margin-top: 20px;
  font-family: var(--font-display, 'ADLaM Display', cursive);
}

.success-message {
  color: #1b7e26;
  font-size: 14px;
  text-align: center;
  margin-top: 20px;
  font-family: var(--font-display, 'ADLaM Display', cursive);
}
</style>

