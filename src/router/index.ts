import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import ChatPage from '../views/ChatPage.vue';
import ScorePage from '../views/ScorePage.vue';
import ProfilePage from '../views/ProfilePage.vue';
import AuthPage from '../views/AuthPage.vue';
import CreateDough from '../views/CreateDough.vue';
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
    meta: { title: 'Accueil' }
  },
  {
    path: '/create-dough',
    name: 'CreateDough',
    component: CreateDough,
    meta: { title: 'Mon Levain', requiresAuth: true }
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
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { title: 'Profil', requiresAuth: true }
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

router.beforeEach(async (to, _from, next) => {
  // Récupération session une seule fois
  if (!sessionChecked) {
    await supabase.auth.getSession();
    sessionChecked = true;
  }
  const { data } = await supabase.auth.getSession();
  const authed = !!data.session?.user;

  if (to.meta?.requiresAuth && !authed) {
    next({ path: '/auth', query: { redirect: to.fullPath } });
    return;
  }
  if (['/auth','/login','/register','/signup'].includes(to.path) && authed) {
    next('/profile');
    return;
  }
  next();
});

export default router
