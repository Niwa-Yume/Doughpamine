<template>
  <ion-page>
    <ModernNavBar />
    <ion-content class="ion-padding">
      <h1>Profil</h1>
      <div v-if="!sessionLoaded">Chargement de la session...</div>
      <div v-else-if="!user">
        <p>Non connecté.</p>
        <ion-button @click="goAuth" expand="block">Se connecter</ion-button>
      </div>
      <div v-else class="profile-box">
        <p><strong>Email :</strong> {{ user.email }}</p>
        <p><strong>ID :</strong> {{ user.id }}</p>
        <ion-button color="secondary" expand="block" @click="logout" :disabled="loading">Se déconnecter</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonButton } from '@ionic/vue';
import ModernNavBar from '@/components/ModernNavBar.vue';
import { useAuth } from '@/composables/useAuth';
import { ref } from 'vue';

const { user, signOut, sessionLoaded } = useAuth();
const router = useRouter();
const loading = ref(false);

function goAuth() { router.push('/auth'); }
async function logout() {
  loading.value = true;
  try { await signOut(); } finally { loading.value = false; }
  router.replace('/home');
}
</script>

<style scoped>
h1 { font-size: 22px; margin-bottom: 12px; }
.profile-box { background: #fff; border: 1px solid var(--app-color-highlight); padding: 1rem; border-radius: 14px; display: flex; flex-direction: column; gap: .4rem; }
</style>
