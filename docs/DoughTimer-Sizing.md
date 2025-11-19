# 📐 Guide de Dimensionnement du Timer Circulaire

## 🎯 Comprendre les Dimensions

Le timer est composé de **3 éléments concentriques** :

```
┌───────────────────────────────────┐
│                                   │
│         ← size (240px) →          │
│    ┌─────────────────────┐        │
│    │     ← stroke (6px)  │        │
│    │  ┌───────────────┐  │        │
│    │  │               │  │        │
│    │🟢│  Espacement   │🟢│        │
│    │  │   (20px)      │  │        │
│    │🟢│ ┌─────────┐   │🟢│        │
│    │  │ │         │   │  │        │
│    │🟢│ │ Levain  │   │🟢│        │
│    │  │ │ (200px) │   │  │        │
│    │🟢│ │         │   │🟢│        │
│    │  │ └─────────┘   │  │        │
│    │🟢│               │🟢│        │
│    │  └───────────────┘  │        │
│    └─────────────────────┘        │
│                                   │
└───────────────────────────────────┘
```

---

## 📏 Les 3 Props à Ajuster

### 1. **size** (Diamètre total du cercle)
- **Type** : `number`
- **Défaut** : `240px`
- **Description** : Diamètre total du cercle SVG (incluant le stroke)

### 2. **strokeWidth** (Épaisseur du trait)
- **Type** : `number`
- **Défaut** : `6px`
- **Description** : Épaisseur du trait du cercle

### 3. **contentSize** (Taille du levain) ⭐ NOUVEAU
- **Type** : `number`
- **Défaut** : `200px`
- **Description** : Diamètre de l'image du levain au centre

---

## 🧮 Calcul de l'Espacement

**Formule** :
```
Espacement = (size - contentSize) / 2
```

**Exemples** :

| size | contentSize | Espacement | Visual |
|------|-------------|------------|--------|
| 240px | 200px | **20px** | Espacement moyen |
| 240px | 180px | **30px** | Espacement large |
| 240px | 220px | **10px** | Espacement serré |
| 300px | 240px | **30px** | Grand cercle |
| 200px | 160px | **20px** | Petit cercle |

---

## 💡 Exemples d'Utilisation

### Exemple 1 : Espacement Serré (10px)
```vue
<DoughTimer
  :lastFeedTime="feedDate"
  :size="240"
  :contentSize="220"
  :strokeWidth="6"
>
  <img src="/assets/gif/levain.gif" alt="Levain" />
</DoughTimer>
```

**Résultat** :
- Cercle : 240px de diamètre
- Levain : 220px de diamètre
- **Espacement : 10px** (cercle proche du levain)

---

### Exemple 2 : Espacement Large (40px)
```vue
<DoughTimer
  :lastFeedTime="feedDate"
  :size="280"
  :contentSize="200"
  :strokeWidth="6"
>
  <img src="/assets/gif/levain.gif" alt="Levain" />
</DoughTimer>
```

**Résultat** :
- Cercle : 280px de diamètre
- Levain : 200px de diamètre
- **Espacement : 40px** (cercle éloigné du levain)

---

### Exemple 3 : Trait Épais (12px)
```vue
<DoughTimer
  :lastFeedTime="feedDate"
  :size="240"
  :contentSize="200"
  :strokeWidth="12"
>
  <img src="/assets/gif/levain.gif" alt="Levain" />
</DoughTimer>
```

**Résultat** :
- Cercle : 240px de diamètre
- Levain : 200px de diamètre
- Trait : 12px (très visible)
- **Espacement : 20px**

---

### Exemple 4 : Grand Timer (pour tablet/desktop)
```vue
<DoughTimer
  :lastFeedTime="feedDate"
  :size="350"
  :contentSize="280"
  :strokeWidth="8"
>
  <img src="/assets/gif/levain.gif" alt="Levain" />
</DoughTimer>
```

**Résultat** :
- Cercle : 350px de diamètre
- Levain : 280px de diamètre
- Trait : 8px
- **Espacement : 35px**

---

## 🎨 Configurations Recommandées

### Mobile (390px de largeur)
```vue
<DoughTimer
  :size="240"
  :contentSize="200"
  :strokeWidth="6"
/>
```
**Espacement : 20px** (bien équilibré)

---

### Tablet (768px de largeur)
```vue
<DoughTimer
  :size="300"
  :contentSize="250"
  :strokeWidth="8"
/>
```
**Espacement : 25px** (proportionnel)

---

### Desktop (1024px+)
```vue
<DoughTimer
  :size="400"
  :contentSize="330"
  :strokeWidth="10"
/>
```
**Espacement : 35px** (grand et aéré)

---

## 📱 Responsive Dynamique

Vous pouvez adapter automatiquement les dimensions selon la taille de l'écran :

```vue
<template>
  <DoughTimer
    :lastFeedTime="feedDate"
    :size="timerSize"
    :contentSize="levainSize"
    :strokeWidth="strokeSize"
  >
    <img src="/assets/gif/levain.gif" alt="Levain" />
  </DoughTimer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const screenWidth = ref(window.innerWidth);

// Ajuste automatiquement selon la largeur d'écran
const timerSize = computed(() => {
  if (screenWidth.value < 768) return 240;    // Mobile
  if (screenWidth.value < 1024) return 300;   // Tablet
  return 400;                                  // Desktop
});

const levainSize = computed(() => {
  if (screenWidth.value < 768) return 200;    // Mobile
  if (screenWidth.value < 1024) return 250;   // Tablet
  return 330;                                  // Desktop
});

const strokeSize = computed(() => {
  if (screenWidth.value < 768) return 6;      // Mobile
  if (screenWidth.value < 1024) return 8;     // Tablet
  return 10;                                   // Desktop
});

function updateScreenWidth() {
  screenWidth.value = window.innerWidth;
}

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth);
});
</script>
```

---

## 🔧 Ajuster Manuellement dans HomePage.vue

Actuellement dans `HomePage.vue` :

```vue
<DoughTimer
  :lastFeedTime="lastFeedTime"
  :size="240"           <!-- ← Changez ici le diamètre total -->
  :strokeWidth="6"      <!-- ← Changez ici l'épaisseur du trait -->
  :showTimeLabel="true"
>
  <img
    class="home-page__dough-image"
    :src="doughGif"
  />
</DoughTimer>
```

**Pour modifier l'espacement**, ajoutez la prop `contentSize` :

```vue
<DoughTimer
  :lastFeedTime="lastFeedTime"
  :size="240"
  :contentSize="200"    <!-- ← NOUVEAU : Taille du levain -->
  :strokeWidth="6"
  :showTimeLabel="true"
>
  <img
    class="home-page__dough-image"
    :src="doughGif"
  />
</DoughTimer>
```

**Et supprimez le CSS fixe** dans `home-page__dough-image` :

```css
/* AVANT (taille fixe dans le CSS) */
.home-page__dough-image {
  width: 200px;
  height: 200px;
  /* ... */
}

/* APRÈS (taille contrôlée par le timer) */
.home-page__dough-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
```

---

## 🎯 Exemples Visuels

### Espacement de 10px (serré)
```
┌─────────────┐
│  🟢🟢🟢🟢🟢  │  ← size: 240px
│ 🟢🟢   🟢🟢 │  ← contentSize: 220px
│ 🟢 😊  🟢  │  ← Espacement: 10px
│ 🟢🟢   🟢🟢 │
│  🟢🟢🟢🟢🟢  │
└─────────────┘
```

### Espacement de 30px (large)
```
┌─────────────┐
│  🟢🟢🟢🟢🟢  │  ← size: 240px
│ 🟢       🟢 │  ← contentSize: 180px
│ 🟢       🟢 │  ← Espacement: 30px
│ 🟢  😊   🟢 │
│ 🟢       🟢 │
│  🟢🟢🟢🟢🟢  │
└─────────────┘
```

### Espacement de 50px (très large)
```
┌─────────────┐
│  🟢🟢🟢🟢🟢  │  ← size: 260px
│ 🟢       🟢 │  ← contentSize: 160px
│ 🟢       🟢 │  ← Espacement: 50px
│ 🟢       🟢 │
│ 🟢  😊   🟢 │
│ 🟢       🟢 │
│  🟢🟢🟢🟢🟢  │
└─────────────┘
```

---

## ⚡ Quick Reference

| Besoin | Prop à modifier | Effet |
|--------|----------------|-------|
| Cercle plus grand | `size` ↑ | Tout le timer grandit |
| Cercle plus petit | `size` ↓ | Tout le timer rétrécit |
| Espacement plus large | `contentSize` ↓ | Levain plus petit, cercle s'éloigne |
| Espacement plus serré | `contentSize` ↑ | Levain plus grand, cercle se rapproche |
| Trait plus épais | `strokeWidth` ↑ | Cercle plus visible |
| Trait plus fin | `strokeWidth` ↓ | Cercle plus discret |

---

## 🧪 Tester Rapidement

Pour tester différentes configurations, utilisez le debug panel et ajoutez temporairement des contrôles :

```vue
<!-- Dans HomePage.vue (temporaire) -->
<div style="position: fixed; top: 10px; right: 10px; background: white; padding: 10px;">
  <label>Size: <input type="range" min="200" max="400" v-model.number="debugSize" /></label>
  <label>Content: <input type="range" min="150" max="350" v-model.number="debugContent" /></label>
  <label>Stroke: <input type="range" min="2" max="20" v-model.number="debugStroke" /></label>
  <p>Espacement: {{ (debugSize - debugContent) / 2 }}px</p>
</div>

<DoughTimer
  :size="debugSize"
  :contentSize="debugContent"
  :strokeWidth="debugStroke"
/>
```

---

**Avec ces props, vous avez un contrôle total sur le design du timer ! 🎨**

