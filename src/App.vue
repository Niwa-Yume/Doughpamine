<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { supabase } from '@/lib/supabaseClient';
import { onMounted } from 'vue';

// Gestion de la redirection auth avec Ionic Router
onMounted(() => {
  let isRedirecting = false;

  supabase.auth.onAuthStateChange((event, session) => {
    if (isRedirecting) return;

    const currentPath = window.location.pathname;
    const authed = !!session?.user;

    if (!authed) {
      if (currentPath !== '/auth' && currentPath !== '/login' && currentPath !== '/register') {
        isRedirecting = true;
        const redirectUrl = `/auth?redirect=${encodeURIComponent(currentPath)}`;
        window.location.href = redirectUrl;
      }
      return;
    }

    // Si authentifié et sur /auth, rediriger vers la page demandée
    if (['/auth', '/login', '/register', '/signup'].includes(currentPath)) {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/profile';
      isRedirecting = true;
      window.location.href = redirect;
    }
  });
});
</script>
