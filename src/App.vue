<template>
  <ion-app>
    <ion-router-outlet />
    <PWAUpdatePrompt />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import PWAUpdatePrompt from '@/components/PWAUpdatePrompt.vue';
import { supabase } from '@/lib/supabaseClient';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Gestion de la redirection auth avec Ionic Router
onMounted(() => {
  supabase.auth.onAuthStateChange(async (event) => {
    console.log('🔍 App.vue: Auth state changed, event=', event);

    const currentPath = window.location.pathname;

    // Gérer uniquement le retour OAuth après connexion Google
    // Le reste est géré par le router guard
    if (event === 'SIGNED_IN' && ['/auth', '/login', '/register', '/signup'].includes(currentPath)) {
      const params = new URLSearchParams(window.location.search);
      let redirect = params.get('redirect');

      console.log('🔍 App.vue: Connexion détectée, redirect=', redirect);

      // Si pas de redirection spécifiée, rediriger vers /home
      // HomePage gérera la logique pour rediriger vers /create-dough si nécessaire
      if (!redirect || redirect === '/auth' || redirect.includes('/login')) {
        redirect = '/home';
        console.log('✅ App.vue: Redirection calculée vers /home');
      }

      console.log('✅ App.vue: Redirection finale vers', redirect);
      if (redirect) {
        router.push(redirect);
      }
    }
  });
});
</script>
