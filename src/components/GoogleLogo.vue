<template>
  <svg :width="size" :height="size" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Logo Google" class="google-logo">
    <!-- Source: Adaptation du logo Google G multi-couleur (utilisation décorative) -->
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.61l6.9-6.9C35.89 1.64 30.37 0 24 0 14.6 0 6.37 5.38 2.49 13.22l7.99 6.21C12.43 13.17 17.73 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.5 24c0-1.64-.15-3.22-.44-4.76H24v9.02h12.65c-.55 2.97-2.21 5.49-4.73 7.18l7.37 5.73C43.76 37.41 46.5 31.17 46.5 24z"/>
    <path fill="#FBBC05" d="M10.48 29.57A14.46 14.46 0 0 1 9.5 24c0-1.94.37-3.8.99-5.52l-7.99-6.21A23.867 23.867 0 0 0 0 24c0 3.91.93 7.61 2.57 10.9l7.91-5.33z"/>
    <path fill="#34A853" d="M24 47.5c6.37 0 11.78-2.1 15.7-5.72l-7.37-5.73c-2.04 1.37-4.66 2.19-8.33 2.19-6.27 0-11.57-3.67-13.52-8.94l-7.91 5.33C6.37 42.62 14.6 47.5 24 47.5z"/>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'GoogleLogo',
  props: {
    size: { type: [Number, String], default: 49.35 }
  }
});
</script>

<style scoped>
.google-logo { display: block; }
</style>

