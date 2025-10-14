<template>
  <ion-page>
    <ModernNavBar />
    <ion-content class="ion-padding">
      <h1>Chat AI</h1>
      <p>Ici viendra l'interface de discussion avec l'IA.</p>
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

