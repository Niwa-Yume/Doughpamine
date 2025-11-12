<template>
  <ion-page>
    <ion-content class="ion-padding">
      <main class="score-page">
        <header class="score-header">
          <div class="header-top">
            <a href="#" class="back-arrow" aria-label="Retour" @click.prevent="goBack">
              <img src="/assets/SVG/back-arrow.svg" alt="Retour" />
            </a>
          </div>
          <h1 class="page-title">Score du compte</h1>
        </header>

        <div class="profile-summary">
          <img :src="mascotte" alt="Mascotte illustration" class="mascot-illustration" />
          <p class="level-info">
            <span class="level-label">Niveau :</span>&nbsp;&nbsp;{{ level }}
          </p>
        </div>

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
  { name: 'Cœur', icon: iconHeart },
  { name: 'Eau', icon: iconWater },
  { name: 'Horloge', icon: iconClock },
]);
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
  min-height: 844px;
  margin: 20px auto;
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
  margin-top: 20px;
  margin-bottom: 16px;
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
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}

.level-info {
  margin-top: 12px;
  font-family: var(--font-display), sans-serif;
  font-size: 22px;
  line-height: 28px;
  color: var(--text-color);
}

.level-label { text-decoration: underline; }

.progress-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 18px;
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
  margin-top: 12px;
  font-family: var(--font-body), sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  color: var(--text-color);
}

.badges-section { width: 100%; margin-top: 20px; padding-bottom: 10px; }

.badges-title {
  font-family: var(--font-display), sans-serif;
  font-size: 22px;
  line-height: 28px;
  color: var(--text-color);
  text-decoration: underline;
  text-align: left;
  margin: 0 0 12px 0;
}

.badges-grid { display: flex; flex-wrap: wrap; justify-content: space-between; row-gap: 15px; }

.badge-item { display: flex; flex-direction: column; align-items: center; width: 30%; }

.badge-icon-wrapper { width: 80px; height: 80px; display: flex; justify-content: center; align-items: center; position: relative; }

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
</style>
