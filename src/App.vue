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
    console.log('[App] Auth state changed:', event, 'authed:', !!session?.user);

    if (isRedirecting) {
      console.log('[App] Déjà en redirection, skip');
      return;
    }

    const currentPath = window.location.pathname;
    const authed = !!session?.user;

    if (!authed) {
      console.log('[App] User non authentifié, current path:', currentPath);
      if (currentPath !== '/auth' && currentPath !== '/login' && currentPath !== '/register') {
        console.log('[App] Redirection forcée vers /auth via window.location');
        isRedirecting = true;
        setTimeout(() => {
          const redirectUrl = `/auth?redirect=${encodeURIComponent(currentPath)}`;
          console.log('[App] Navigation vers:', redirectUrl);
          window.location.href = redirectUrl;
        }, 100);
      }
      return;
    }

    // Si authentifié et sur /auth, rediriger vers la page demandée
    console.log('[App] User authentifié, current path:', currentPath);
    if (['/auth', '/login', '/register', '/signup'].includes(currentPath)) {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/profile';
      console.log('[App] Sur page auth, redirection forcée vers:', redirect);
      isRedirecting = true;
      setTimeout(() => {
        console.log('[App] Navigation vers:', redirect);
        window.location.href = redirect;
      }, 100);
    }
  });
});
</script>
