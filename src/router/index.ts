import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import ChatPage from '../views/ChatPage.vue';
import ScorePage from '../views/ScorePage.vue';
import AuthPage from '../views/AuthPage.vue';
import CreateDough from '../views/CreateDough.vue';
import LiaisonLevainPage from '../views/LiaisonLevainPage.vue';
import CreationLevainPage from '../views/CreationLevainPage.vue';
import { supabase } from '@/lib/supabaseClient';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { title: 'Accueil', requiresAuth: true }
  },
  {
    path: '/create-dough',
    name: 'CreateDough',
    component: CreateDough,
    meta: { title: 'Mon Levain', requiresAuth: true }
  },
  {
    path: '/liaison-levain',
    name: 'LiaisonLevain',
    component: LiaisonLevainPage,
    meta: { title: 'Liaison du Levain', requiresAuth: true }
  },
  {
    path: '/creation-levain',
    name: 'CreationLevain',
    component: CreationLevainPage,
    meta: { title: 'Création du Levain' }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatPage,
    meta: { title: 'Chat AI', requiresAuth: true }
  },
  {
    path: '/score',
    name: 'Score',
    component: ScorePage,
    meta: { title: 'Score', requiresAuth: true }
  },
  {
    path: '/auth',
    alias: ['/login', '/register', '/signup'],
    name: 'Auth',
    component: AuthPage,
    meta: { title: 'Connexion / Inscription' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

let sessionChecked = false;

router.beforeEach(async (to, from, next) => {
  if (!sessionChecked) {
    await supabase.auth.getSession();
    sessionChecked = true;
  }
  const { data } = await supabase.auth.getSession();
  const authed = !!data.session?.user;

  // Si la route nécessite l'authentification et que l'utilisateur n'est pas connecté
  if (to.meta?.requiresAuth && !authed) {
    next({ path: '/auth', query: { redirect: to.fullPath } });
    return;
  }

  // Si l'utilisateur est connecté et tente d'accéder à /auth
  if (['/auth','/login','/register','/signup'].includes(to.path) && authed) {
    const queryRedirect = to.query?.redirect as string;

    // Ignorer les redirections vers profile/score (proviennent souvent de déconnexions)
    const shouldIgnoreRedirect = queryRedirect &&
      (queryRedirect.includes('/profile') || queryRedirect.includes('/score'));

    console.log('🔍 Router: queryRedirect=', queryRedirect, 'shouldIgnoreRedirect=', shouldIgnoreRedirect);

    // Si une redirection valide existe, l'utiliser
    if (queryRedirect && !shouldIgnoreRedirect) {
      console.log('✅ Router: Redirection vers', queryRedirect);
      next(queryRedirect);
      return;
    }

    // Vérifier si l'utilisateur a un levain pour déterminer où le rediriger
    if (data.session?.user?.id) {
      console.log('🔍 Router: Vérification levain pour user_id=', data.session.user.id);

      try {
        const { data: levainList, error: levainError } = await supabase
          .from('levains')
          .select('id, user_id, name')
          .eq('user_id', data.session.user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const levainData = levainList && levainList.length > 0 ? levainList[0] : null;

        console.log('🔍 Router: levainData=', levainData, 'error=', levainError);

        if (levainError) {
          console.warn('⚠️ Router: Erreur lors de la vérification du levain:', levainError);
        }

        // Rediriger vers /home si levain existe, sinon vers /create-dough
        const redirect = (levainData && !levainError) ? '/home' : '/create-dough';
        console.log('✅ Router: Redirection finale vers', redirect, 'hasLevain=', !!levainData);
        next(redirect);
        return;
      } catch (error) {
        console.error('❌ Router: Exception lors de la vérification du levain:', error);
        next('/create-dough');
        return;
      }
    }

    // Fallback si pas de session (ne devrait pas arriver)
    console.log('⚠️ Router: Fallback vers /create-dough (pas de session valide)');
    next('/create-dough');
    return;
  }

  // Vérification supplémentaire : si l'utilisateur va sur /home, vérifier qu'il a un levain
  if (to.path === '/home' && authed && data.session?.user?.id) {
    // Ne vérifier que si on ne vient pas de /create-dough ou /creation-levain
    // pour éviter les boucles de redirection
    const comingFromCreation = from.path === '/create-dough' ||
                               from.path === '/creation-levain' ||
                               from.path === '/liaison-levain';

    if (!comingFromCreation) {
      try {
        const { data: levainList, error: levainError } = await supabase
          .from('levains')
          .select('id')
          .eq('user_id', data.session.user.id)
          .limit(1);

        const hasLevain = levainList && levainList.length > 0 && !levainError;

        if (!hasLevain) {
          console.log('⚠️ Router: Accès à /home sans levain, redirection vers /create-dough');
          next('/create-dough');
          return;
        }
      } catch (error) {
        console.error('❌ Router: Erreur vérification levain pour /home:', error);
        // En cas d'erreur, laisser passer (HomePage s'en chargera)
      }
    }
  }

  next();
});

// La redirection onAuthStateChange est maintenant gérée dans App.vue avec useIonRouter
// pour une meilleure intégration avec Ionic

export default router
