<template>
  <ion-page>
    <ModernNavBar />
    <ion-content class="ion-padding">
      <h1>Score</h1>
      <p>Section des scores / progression utilisateur.</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import ModernNavBar from '@/components/ModernNavBar.vue';
</script>

<style scoped>
h1 { font-size: 22px; margin-bottom: 12px; }
</style>

