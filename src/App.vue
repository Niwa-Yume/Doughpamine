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

  supabase.auth.onAuthStateChange(async (event, session) => {
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

    // Si authentifié et sur /auth, rediriger vers la page appropriée
    if (['/auth', '/login', '/register', '/signup'].includes(currentPath)) {
      const params = new URLSearchParams(window.location.search);
      let redirect = params.get('redirect');

      // Ignorer les redirections vers profile/score (proviennent souvent de déconnexions)
      const shouldIgnoreRedirect = redirect &&
        (redirect.includes('/profile') || redirect.includes('/score'));

      console.log('🔍 App.vue: redirect=', redirect, 'shouldIgnoreRedirect=', shouldIgnoreRedirect);

      // Si pas de redirection valide, vérifier si l'utilisateur a un levain
      if (!redirect || shouldIgnoreRedirect) {
        if (session?.user) {
          console.log('🔍 App.vue: Vérification levain pour user_id=', session.user.id);

          try {
            // Prendre le levain le plus récent (order by created_at DESC + limit 1)
            const { data: levainList, error: levainError } = await supabase
              .from('levains')
              .select('id, user_id, name')
              .eq('user_id', session.user.id)
              .order('created_at', { ascending: false })
              .limit(1);

            const levainData = levainList && levainList.length > 0 ? levainList[0] : null;

            console.log('🔍 App.vue: levainData=', levainData, 'error=', levainError);

            if (levainError) {
              console.warn('⚠️ App.vue: Erreur lors de la vérification du levain:', levainError);
            }

            redirect = (levainData && !levainError) ? '/home' : '/create-dough';
            console.log('✅ App.vue: hasLevain=', !!levainData);
          } catch (error) {
            console.error('❌ App.vue: Exception lors de la vérification du levain:', error);
            redirect = '/create-dough';
          }
        } else {
          redirect = '/home';
        }
      }

      console.log('✅ App.vue: Redirection finale vers', redirect);
      isRedirecting = true;
      window.location.href = redirect;
    }
  });
});
</script>
