# 🕐 DoughTimer - Composant de Timer Circulaire

## 📖 Description

Composant de timer circulaire visuel pour le levain qui change de couleur selon le temps écoulé depuis le dernier nourrissage.

---

## 🎨 Fonctionnalités

### Système de Couleurs Progressif

Le cercle change de couleur automatiquement selon le temps restant :

| Temps restant | Couleur | Variable CSS | État du levain |
|---------------|---------|--------------|----------------|
| **24h → 12h** | 🟢 **Vert** | `--color-timer-green` | Levain bien nourri |
| **12h → 8h** | 🟠 **Orange** | `--color-timer-orange` | Levain commence à avoir faim |
| **8h → 0h** | 🔴 **Rouge** | `--color-timer-red` | Levain affamé (urgent) |

### Animation

- ✅ **Progression fluide** : Le cercle se remplit progressivement en 24h
- ✅ **Mise à jour en temps réel** : Rafraîchissement toutes les secondes
- ✅ **Animation de pulsation** : Quand le timer est en rouge (< 8h)
- ✅ **Transition douce** : Changement de couleur animé

---

## 🛠️ Props

```typescript
interface Props {
  lastFeedTime: Date | number;  // Date du dernier nourrissage (requis)
  size?: number;                 // Taille du cercle en px (défaut: 227)
  strokeWidth?: number;          // Épaisseur du cercle (défaut: 8)
  showTimeLabel?: boolean;       // Afficher le temps restant (défaut: false)
}
```

### Détails des Props

#### `lastFeedTime` (requis)
- **Type** : `Date | number`
- **Description** : Timestamp ou objet Date du dernier nourrissage
- **Exemple** : 
  ```vue
  :lastFeedTime="new Date()"
  :lastFeedTime="1700000000000"
  ```

#### `size` (optionnel)
- **Type** : `number`
- **Défaut** : `227`
- **Description** : Taille du cercle en pixels (largeur = hauteur)
- **Exemple** : 
  ```vue
  :size="200"
  :size="300"
  ```

#### `strokeWidth` (optionnel)
- **Type** : `number`
- **Défaut** : `8`
- **Description** : Épaisseur du trait du cercle
- **Exemple** : 
  ```vue
  :strokeWidth="10"
  :strokeWidth="6"
  ```

#### `showTimeLabel` (optionnel)
- **Type** : `boolean`
- **Défaut** : `false`
- **Description** : Affiche le temps restant sous le cercle (ex: "14h 23m")
- **Exemple** : 
  ```vue
  :showTimeLabel="true"
  ```

---

## 📤 Événements

### `timeExpired`

Émis quand le timer atteint 0 (24h écoulées).

```vue
<DoughTimer 
  :lastFeedTime="feedDate" 
  @timeExpired="handleExpired" 
/>
```

```typescript
function handleExpired() {
  // Le levain n'a pas été nourri depuis 24h
  console.warn('⚠️ Timer expiré !');
  // TODO: Changer l'état du levain
  // TODO: Envoyer une notification
  // TODO: Pénalité de score
}
```

---

## 📦 Slot

Le composant expose un **slot par défaut** pour insérer du contenu au centre du cercle (typiquement l'image/GIF du levain).

```vue
<DoughTimer :lastFeedTime="feedDate">
  <!-- Contenu centré dans le cercle -->
  <img src="/assets/gif/levain.gif" alt="Levain" />
</DoughTimer>
```

---

## 💡 Exemples d'Utilisation

### Exemple 1 : Basique

```vue
<template>
  <DoughTimer 
    :lastFeedTime="lastFeedTime"
    :size="227"
  >
    <img src="/assets/gif/levain basique.gif" alt="Levain" />
  </DoughTimer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DoughTimer from '@/components/DoughTimer.vue';

const lastFeedTime = ref(new Date());
</script>
```

### Exemple 2 : Avec gestion du temps expiré

```vue
<template>
  <DoughTimer 
    :lastFeedTime="lastFeedTime"
    :size="250"
    :showTimeLabel="true"
    @timeExpired="handleTimerExpired"
  >
    <video autoplay loop muted>
      <source src="/assets/video/levain.mp4" type="video/mp4" />
    </video>
  </DoughTimer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DoughTimer from '@/components/DoughTimer.vue';

const lastFeedTime = ref(new Date(Date.now() - 20 * 60 * 60 * 1000)); // 20h ago

function handleTimerExpired() {
  alert('⚠️ Ton levain a faim ! Nourris-le vite !');
  // Envoyer une notification push
  // Changer l'état du levain à "négligé"
}
</script>
```

### Exemple 3 : Personnalisé

```vue
<template>
  <DoughTimer 
    :lastFeedTime="lastFeedTime"
    :size="300"
    :strokeWidth="12"
    :showTimeLabel="true"
  >
    <div class="custom-content">
      <img src="/assets/mascott/active.png" alt="Levain actif" />
      <p>{{ status }}</p>
    </div>
  </DoughTimer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import DoughTimer from '@/components/DoughTimer.vue';

const lastFeedTime = ref(new Date());

const status = computed(() => {
  const elapsed = Date.now() - lastFeedTime.value.getTime();
  const hours = elapsed / (60 * 60 * 1000);
  
  if (hours < 12) return "Actif";
  if (hours < 16) return "Affamé";
  return "Négligé";
});
</script>

<style scoped>
.custom-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
</style>
```

---

## 🎨 Personnalisation CSS

Vous pouvez personnaliser les couleurs via les variables CSS :

```css
:root {
  /* Couleurs par défaut */
  --color-timer-green: #4caf50;   /* Vert */
  --color-timer-orange: #ff9800;  /* Orange */
  --color-timer-red: #f44336;     /* Rouge */
}

/* Thème personnalisé */
.my-custom-theme {
  --color-timer-green: #00e676;   /* Vert électrique */
  --color-timer-orange: #ffa726;  /* Orange clair */
  --color-timer-red: #ef5350;     /* Rouge saumon */
}
```

---

## 🧮 Logique Interne

### Calcul du Temps Restant

```typescript
const timeRemaining = computed(() => {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24h en ms
  const elapsed = Date.now() - lastFeedTime.value.getTime();
  return Math.max(0, TWENTY_FOUR_HOURS - elapsed);
});
```

### Calcul de la Couleur

```typescript
const currentColor = computed(() => {
  const hoursRemaining = timeRemaining.value / (60 * 60 * 1000);
  
  if (hoursRemaining > 12) return '--color-timer-green';
  if (hoursRemaining > 8) return '--color-timer-orange';
  return '--color-timer-red';
});
```

### Calcul de la Progression SVG

```typescript
const circumference = 2 * Math.PI * radius;
const progress = elapsedTime / (24 * 60 * 60 * 1000); // 0-1
const dashOffset = circumference * (1 - progress);
```

---

## ⚡ Performance

- ✅ **Mise à jour optimisée** : Intervalle de 1 seconde (pas de rendu inutile)
- ✅ **Cleanup automatique** : L'intervalle est nettoyé quand le composant est détruit
- ✅ **Pas de re-render global** : Seules les propriétés calculées changent

---

## 🐛 Debugging

### Afficher le temps restant en console

```vue
<script setup lang="ts">
import { watch } from 'vue';

watch(timeRemaining, (newVal) => {
  console.log('Temps restant:', Math.floor(newVal / 60000), 'minutes');
});
</script>
```

### Forcer une mise à jour manuelle

```typescript
const currentTime = ref(Date.now());

function forceUpdate() {
  currentTime.value = Date.now();
}
```

---

## 📋 Checklist d'Intégration

Après avoir intégré le composant :

- [ ] Le cercle tourne bien dans le sens horaire
- [ ] La couleur change automatiquement (vert → orange → rouge)
- [ ] L'événement `timeExpired` est émis après 24h
- [ ] Le contenu du slot est bien centré
- [ ] Le timer se réinitialise quand `lastFeedTime` change
- [ ] Responsive OK sur mobile, tablette, desktop
- [ ] Pas d'erreur console
- [ ] Performance OK (60fps)

---

## 🚀 Évolutions Futures

- [ ] Ajout d'un mode "pause" pour congeler le timer
- [ ] Support de durées personnalisées (pas que 24h)
- [ ] Animations de félicitations quand on nourrit à temps
- [ ] Son/vibration quand le timer passe en rouge
- [ ] Mode "dark mode" avec couleurs adaptées

---

**Créé le** : 19 novembre 2025  
**Version** : 1.0.0  
**Auteur** : GitHub Copilot

