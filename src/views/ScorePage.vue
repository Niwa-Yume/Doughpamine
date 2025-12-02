<template>
  <ion-page>
    <ion-content class="ion-padding" :scrollY="false">
      <main class="score-page">
        <header class="score-header">
          <div class="header-top">
            <a href="#" class="back-arrow" aria-label="Retour" @click.prevent="goBack">
              <img src="/assets/SVG/back-arrow.svg" alt="Retour" />
            </a>
          </div>
          <h1 class="page-title">Compte</h1>
        </header>

        <div class="profile-summary">
          <img :src="mascotte" alt="Mascotte illustration" class="mascot-illustration" />
          <p class="level-info">
            <span class="level-label">Niveau :</span>&nbsp;&nbsp;{{ level }}
          </p>
        </div>

        <div class="content-wrapper">
          <div class="progress-section">
            <div class="progress-bar-container">
              <div class="progress-bar-bg"></div>
              <div class="progress-bar-value" :style="{ width: progressWidth }"></div>
            </div>
            <p class="xp-text">{{ currentXp }} / {{ nextLevelXp }} XP</p>
          </div>

          <section id="badges" class="badges-section">
            <h2 class="badges-title">Badges et succès :</h2>
            <div class="badges-grid">
              <div class="badge-item" v-for="(badge, idx) in badges" :key="idx">
                <div class="badge-icon-wrapper">
                  <img :src="badge.icon" :alt="badge.name + ' icon'" class="badge-icon" />
                </div>
                <p class="badge-name">{{ badge.name }}</p>
              </div>
            </div>
          </section>
        </div>

        <div class="main-actions">
          <button class="btn disconnect-btn" @click="logout" :disabled="signingOut">{{ signingOut ? 'Déconnexion...' : 'Déconnecter' }}</button>
          <button class="btn delete-account-btn" @click="deleteAccount" :disabled="deleting">{{ deleting ? 'Suppression...' : 'supprimer le compte' }}</button>
        </div>

        <p v-if="message" class="feedback success">{{ message }}</p>
        <p v-if="errorMsg" class="feedback error">{{ errorMsg }}</p>

      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

// Imports SVG (Vite gère public mais import explicite fiabilise la résolution)
import iconTrophy from '@/../public/assets/SVG/badges/trophy.svg';
import iconStar from '@/../public/assets/SVG/badges/star.svg';
import iconBread from '@/../public/assets/SVG/badges/bread.svg';
import iconPizza from '@/../public/assets/SVG/badges/pizza.svg';
import iconWheat from '@/../public/assets/SVG/badges/wheat.svg';
import iconFire from '@/../public/assets/SVG/badges/fire.svg';
import iconHeart from '@/../public/assets/SVG/badges/heart.svg';
import iconWater from '@/../public/assets/SVG/badges/water.svg';
import iconClock from '@/../public/assets/SVG/badges/clock.svg';
import {useAuth} from "@/composables/useAuth";

const router = useRouter();
const goBack = () => router.back();

// Données d'exemple; à relier plus tard au profil réel
const level = ref(1);
const currentXp = ref(870);
const nextLevelXp = ref(1000);
const progressWidth = computed(() => `${Math.min(100, Math.round((currentXp.value / nextLevelXp.value) * 100))}%`);

// Assets locaux
const mascotte = '/assets/mascott/Version de base.png';

// Badges avec icônes importées
const badges = ref([
  { name: 'Trophée', icon: iconTrophy },
  { name: 'Étoile', icon: iconStar },
  { name: 'Pain', icon: iconBread },
  { name: 'Pizza', icon: iconPizza },
  { name: 'Blé', icon: iconWheat },
  { name: 'Feu', icon: iconFire },
]);

const { user, signOut } = useAuth();

// États pour les boutons
const saving = ref(false);
const signingOut = ref(false);
const deleting = ref(false);
const errorMsg = ref('');
const message = ref('');

async function saveProfile() {
  saving.value = true;
  errorMsg.value = '';
  message.value = '';

  try {
    // Logique de sauvegarde du profil (à implémenter selon vos besoins)
    message.value = 'Profil sauvegardé avec succès';
  } catch (e: any) {
    errorMsg.value = e.message || 'Erreur lors de la sauvegarde';
  } finally {
    saving.value = false;
  }
}

async function logout() {
  signingOut.value = true;
  errorMsg.value = '';
  message.value = '';

  try {
    await signOut();
    router.push('/auth');
  } catch (e: any) {
    errorMsg.value = e.message || 'Erreur déconnexion';
  } finally {
    signingOut.value = false;
  }
}

async function deleteAccount() {
  deleting.value = true;
  errorMsg.value = '';
  message.value = '';

  try {
    if (!user.value?.id) throw new Error('Utilisateur non connecté');

    // Suppression du compte via Supabase Auth
    await signOut();
    router.push('/auth');

    message.value = 'Compte marqué pour suppression (implémentation serveur requise).';
  } catch (e: any) {
    errorMsg.value = e.message || 'Erreur suppression';
  } finally {
    deleting.value = false;
  }
}

</script>

<style scoped>
.score-page {
  --bg-color: #f2e5ca;
  --title-color: #4b4b4b;
  --text-color: #000000;
  --progress-bg: #58cc02;
  --progress-value: #ffc800;
  --font-display: 'ADLaM Display', cursive, sans-serif;
  --font-body: 'Roboto', Arial, sans-serif;

  max-width: 390px;
  height: 100vh;
  margin: 0 auto;
  background-color: var(--bg-color);
  border-radius: 15px;
  padding: 0 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.score-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 8px;
}

.header-top {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.back-arrow {
  width: 36px;
  height: 36px;
}

.back-arrow img { width: 100%; height: 100%; display:block; }

.page-title {
  color: var(--title-color);
  font-family: var(--font-display), sans-serif;
  font-weight: 400;
  font-size: 38px;
  line-height: 1.1;
  text-align: center;
  margin: 6px 0 0 0;
  letter-spacing: -0.88px;
}

.profile-summary { display: flex; flex-direction: column; align-items: center; width: 100%; }

.mascot-illustration {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.level-info {
  margin-top: 8px;
  font-family: var(--font-display), sans-serif;
  font-size: 20px;
  line-height: 24px;
  color: var(--text-color);
}

.level-label { text-decoration: underline; }

.progress-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 12px;
}

.progress-bar-container {
  position: relative;
  width: 294px;
  height: 32px;
  border-radius: 8px;
  box-shadow: 2px 4px 0 0 #000000;
  overflow: hidden;
}

.progress-bar-bg {
  width: 100%;
  height: 100%;
  background-color: var(--progress-bg);
  border-radius: 8px;
}

.progress-bar-value {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: var(--progress-value);
  border-radius: 8px;
}

.xp-text {
  margin-top: 8px;
  font-family: var(--font-body), sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 18px;
  color: var(--text-color);
}

.badges-section { width: 100%; margin-top: 12px; padding-bottom: 8px; }

.badges-title {
  font-family: var(--font-display), sans-serif;
  font-size: 20px;
  line-height: 24px;
  color: var(--text-color);
  text-decoration: underline;
  text-align: left;
  margin: 0 0 8px 0;
}

.badges-grid { display: flex; flex-wrap: wrap; justify-content: space-between; row-gap: 10px; }

.badge-item { display: flex; flex-direction: column; align-items: center; width: 30%; }

.badge-icon-wrapper { width: 60px; height: 60px; display: flex; justify-content: center; align-items: center; position: relative; }

.badge-icon { max-width: 100%; max-height: 100%; object-fit: contain; color: var(--couleurs-icones); }

.badge-name {
  margin-top: 6px;
  font-family: var(--font-body), sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  text-align: center;
  color: var(--text-color);
}

/* Styles pour les boutons d'action */
.main-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 295px;
  margin: 12px auto 10px auto;
  align-items: center;
}

.btn {
  padding: 12px;
  border-radius: 4000px;
  color: var(--pure-white, #FEFAE0);
  font-family: var(--font-display), sans-serif;
  font-weight: 400;
  font-size: 16px;
  width: 100%;
  border: 2px solid var(--color-border, #4B4B4B);
  box-shadow: 2px 4px 0 0 var(--color-border, #4B4B4B);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 0 var(--color-border, #4B4B4B);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-btn {
  background-color: var(--color-progress-bg, #58CC02);
}

.disconnect-btn {
  background-color: var(--marron, #BC6C25);
}

.delete-account-btn {
  background-color: var(--color-error, #C1121F);
  border-radius: 4000px;
  padding: 12px;
  color: var(--pure-white, #FEFAE0);
  font-family: var(--font-display), sans-serif;
  font-weight: 400;
  font-size: 14px;
  width: 100%;
  border: 2px solid var(--color-border, #4B4B4B);
  box-shadow: 2px 4px 0 0 var(--color-border, #4B4B4B);
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-account-btn:hover:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 0 var(--color-border, #4B4B4B);
  opacity: 0.9;
}

.delete-account-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback {
  width: 100%;
  max-width: 295px;
  margin: 4px auto;
  font-size: 14px;
  text-align: center;
  font-family: var(--font-body), sans-serif;
}

.feedback.success {
  color: var(--color-success, #58CC02);
}

.feedback.error {
  color: var(--color-error, #C1121F);
}

/* Media queries pour desktop - Refonte complète */
@media (min-width: 768px) {
  .score-page {
    max-width: 900px;
    height: 100vh;
    padding: 15px 30px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    display: grid;
    grid-template-columns: 280px 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      "header header"
      "profile content"
      "actions actions";
    gap: 12px 25px;
    align-items: start;
    overflow: hidden;
  }

  .score-header {
    grid-area: header;
    margin-top: 0;
    margin-bottom: 0;
  }

  .header-top {
    justify-content: flex-start;
  }

  .back-arrow {
    width: 32px;
    height: 32px;
    transition: transform 0.2s;
  }

  .back-arrow:hover {
    transform: translateX(-4px);
  }

  .page-title {
    font-size: 32px;
    margin: 6px 0 0 0;
  }

  .profile-summary {
    grid-area: profile;
    justify-content: flex-start;
    align-items: center;
    padding: 15px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    height: fit-content;
  }

  .mascot-illustration {
    width: 120px;
    height: 120px;
    border: 3px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .level-info {
    margin-top: 10px;
    font-size: 20px;
    line-height: 26px;
  }

  /* Wrapper pour progression et badges */
  .content-wrapper {
    grid-area: content;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    max-height: 100%;
    padding-right: 5px;
  }

  .content-wrapper::-webkit-scrollbar {
    width: 6px;
  }

  .content-wrapper::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }

  .content-wrapper::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .content-wrapper::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }

  .progress-section {
    align-items: flex-start;
    margin-top: 0;
    padding: 15px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  .progress-bar-container {
    width: 100%;
    max-width: 100%;
    height: 32px;
    border-radius: 10px;
    box-shadow: 2px 4px 0 0 #000000;
  }

  .progress-bar-bg {
    border-radius: 10px;
  }

  .progress-bar-value {
    border-radius: 10px;
  }

  .xp-text {
    margin-top: 10px;
    font-size: 15px;
    line-height: 20px;
    font-weight: 600;
  }

  .badges-section {
    margin-top: 0;
    padding: 15px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  .badges-title {
    font-size: 18px;
    line-height: 24px;
    margin: 0 0 12px 0;
  }

  .badges-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    justify-items: center;
  }

  .badge-item {
    width: 100%;
    transition: transform 0.2s;
  }

  .badge-item:hover {
    transform: translateY(-3px);
  }

  .badge-icon-wrapper {
    width: 65px;
    height: 65px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .badge-name {
    margin-top: 6px;
    font-size: 12px;
    line-height: 16px;
    font-weight: 600;
  }

  .main-actions {
    grid-area: actions;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    max-width: 100%;
    margin: 0;
  }

  .btn {
    padding: 12px 40px;
    font-size: 16px;
    width: auto;
    min-width: 280px;
    transition: all 0.2s ease;
  }

  .btn:hover:not(:disabled) {
    transform: translateY(2px);
    box-shadow: 0 2px 0 0 var(--color-border, #4B4B4B);
  }

  .disconnect-btn {
    min-width: 280px;
  }

  .delete-account-btn {
    padding: 12px 40px;
    font-size: 14px;
    width: auto;
    min-width: 280px;
    border-radius: 4000px;
    border: 2px solid var(--color-border, #4B4B4B);
    box-shadow: 2px 4px 0 0 var(--color-border, #4B4B4B);
    transition: all 0.2s ease;
  }

  .delete-account-btn:hover:not(:disabled) {
    transform: translateY(2px);
    box-shadow: 0 2px 0 0 var(--color-border, #4B4B4B);
    opacity: 0.85;
  }

  .feedback {
    grid-area: actions;
    max-width: 100%;
    font-size: 13px;
    margin: 5px auto 0 auto;
    align-self: end;
  }
}

@media (min-width: 1024px) {
  .score-page {
    max-width: 1000px;
    padding: 20px 40px;
    grid-template-columns: 320px 1fr;
    gap: 15px 30px;
  }

  .page-title {
    font-size: 36px;
  }

  .profile-summary {
    padding: 18px;
  }

  .mascot-illustration {
    width: 140px;
    height: 140px;
  }

  .level-info {
    font-size: 22px;
    line-height: 28px;
  }

  .content-wrapper {
    gap: 15px;
  }

  .progress-section {
    padding: 18px;
  }

  .progress-bar-container {
    height: 36px;
  }

  .xp-text {
    font-size: 16px;
    line-height: 22px;
  }

  .badges-section {
    padding: 18px;
  }

  .badges-title {
    font-size: 20px;
    line-height: 26px;
    margin: 0 0 14px 0;
  }

  .badges-grid {
    gap: 14px;
  }

  .badge-icon-wrapper {
    width: 75px;
    height: 75px;
  }

  .badge-name {
    font-size: 13px;
    line-height: 18px;
  }

  .btn {
    padding: 14px 50px;
    font-size: 18px;
    min-width: 320px;
  }

  .disconnect-btn {
    min-width: 320px;
  }

  .delete-account-btn {
    padding: 14px 50px;
    font-size: 15px;
    min-width: 320px;
    border-radius: 4000px;
    border: 2px solid var(--color-border, #4B4B4B);
    box-shadow: 2px 4px 0 0 var(--color-border, #4B4B4B);
  }

  .feedback {
    font-size: 14px;
  }
}
</style>
