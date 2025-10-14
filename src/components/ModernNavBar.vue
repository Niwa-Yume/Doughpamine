<template>
  <ion-header class="modern-header" role="navigation" aria-label="Navigation principale">
    <ion-toolbar class="nav-toolbar">
      <nav class="nav-tabs" aria-label="Onglets">
        <ion-button v-for="item in navItems" :key="item.path" fill="clear" class="nav-button"
                    :class="{ active: isActive(item) }" @click="go(item.path)" :aria-label="item.label">
          <ion-icon :icon="isActive(item) ? item.iconActive : item.icon" />
          <span class="label">{{ item.label }}</span>
        </ion-button>
      </nav>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { IonHeader, IonToolbar, IonButton, IonIcon } from '@ionic/vue';
import { homeOutline, home, chatbubbleOutline, chatbubble, trophyOutline, trophy, personCircleOutline, personCircle } from 'ionicons/icons';

const router = useRouter();
const route = useRoute();

interface NavItem {
  label: string;
  path: string;
  icon: any;
  iconActive: any;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/home', icon: homeOutline, iconActive: home },
  { label: 'Chat AI', path: '/chat', icon: chatbubbleOutline, iconActive: chatbubble },
  { label: 'Score', path: '/score', icon: trophyOutline, iconActive: trophy },
  { label: 'Profil', path: '/profile', icon: personCircleOutline, iconActive: personCircle }
];

const currentPath = computed(() => route.path);

const isActive = (item: NavItem) => currentPath.value === item.path;

const go = (path: string) => {
  if (currentPath.value !== path) router.push(path);
};
</script>

<style scoped>
.modern-header { --background: var(--ion-background-color); --color: var(--ion-text-color); }
.nav-toolbar { --min-height: 64px; display: flex; align-items: stretch; background: var(--ion-background-color); border-bottom: 1px solid var(--app-color-highlight); }
.nav-tabs { display: flex; width: 100%; justify-content: space-around; align-items: stretch; }
.nav-button { flex: 1 1 0; --background: transparent; --color: var(--ion-color-primary); --padding-start: 0; --padding-end: 0; margin: 0; border-radius: 0; height: 64px; flex-direction: column; gap: 4px; }
.nav-button ion-icon { font-size: 22px; }
.nav-button .label { font-size: 11.5px; font-weight: 600; letter-spacing: .4px; }
.nav-button.active { --color: var(--ion-color-primary-contrast); background: var(--ion-color-primary); }
.nav-button.active ion-icon { filter: drop-shadow(0 1px 1px rgba(0,0,0,0.15)); }
.nav-button.active .label { color: var(--ion-color-primary-contrast); }
@media (min-width: 640px) { .nav-toolbar { --min-height: 70px; } .nav-button { height: 70px; } }
</style>
