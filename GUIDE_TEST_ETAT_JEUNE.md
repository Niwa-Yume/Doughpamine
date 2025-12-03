# Guide de Test - État "Jeune"

## 🧪 Scénario de Test Complet

### 1. Créer un nouveau levain from scratch

1. Se connecter à l'application
2. Aller sur la page "Création du levain"
3. Cliquer sur **"CRÉER UN LEVAIN"** (pas "Lier un levain existant")
4. Donner un nom au levain (ex: "Mon Premier Levain")
5. Cliquer sur "Valider"

**Résultat attendu:**
- Navigation vers la HomePage
- Le levain s'affiche avec l'état "Jeune"
- Vidéo affichée: `levain basique.mp4`
- Timer affiche: "6j" (6 jours restants)
- Couleur du timer: Vert

### 2. Vérifier le message d'incubation

**Résultat attendu:**
```
🌱 Période d'incubation

Votre levain est jeune et se développe ! Nourrissez-le quotidiennement 
pendant 6 jours pour qu'il devienne actif et prêt à faire du pain.

[Barre de progression à 0%]
6 jours restants
```

### 3. Nourrir le levain jeune

1. Cliquer sur le bouton "NOURRIR"

**Résultat attendu:**
- Le levain reste à l'état "Jeune" (ne passe pas à "Prêt")
- Le timer se réinitialise
- La streak augmente de 1 (si c'est le premier nourrissage du jour)
- Le message d'incubation reste affiché

### 4. Tester le mode accéléré (pour debug)

Pour tester plus rapidement, vous pouvez temporairement:

1. Dans `HomePage.vue`, activer le mode accéléré:
   ```typescript
   const DEBUG_ACCELERATED_MODE = true;
   ```

2. Dans `levainStateMachine.ts`, réduire le délai:
   ```typescript
   jeune: {
     label: 'Jeune levain en incubation',
     max_delay_h: 168,
     actions: {
       nourrir: { to: 'jeune' },
       rien_faire: { to: 'actif', delay_h: 0.1 } // 6 minutes au lieu de 6 jours
     }
   }
   ```

**Résultat attendu:**
- Après 6 minutes (sans nourrir), le levain passe automatiquement à l'état "Actif"
- Le message d'incubation disparaît
- La vidéo change pour `levain joyeux et actif.mp4`

### 5. Transition automatique vers "Actif"

Après 6 jours (144h) sans interruption:

**Résultat attendu:**
- Le levain passe automatiquement à l'état "Actif"
- Le message d'incubation disparaît
- La vidéo change
- Un log apparaît dans la console:
  ```
  🔄 Transition automatique: Jeune → Actif
  ```

## ✅ Checklist de Validation

- [ ] Le levain créé from scratch commence bien à l'état "Jeune"
- [ ] Le message d'incubation s'affiche correctement
- [ ] La barre de progression fonctionne (avance au fil du temps)
- [ ] Le compteur "X jours restants" est correct
- [ ] Le bouton "NOURRIR" maintient l'état "Jeune" (ne passe pas à "Prêt")
- [ ] Après 6 jours, transition automatique vers "Actif"
- [ ] La vidéo affichée est correcte pour chaque état
- [ ] Le timer affiche "6j" au début

## 🔍 Logs de Debug à Surveiller

Dans la console, vous devriez voir:

```
🕐 updateStateBasedOnTime: {
  currentState: 'Jeune',
  lastActionAt: [Date],
  now: [Date]
}

🔍 Résultat shouldAutoTransition: {
  shouldTransition: false,  // Tant que < 6 jours
  nextState: null
}
```

Puis après 6 jours:

```
🔍 Résultat shouldAutoTransition: {
  shouldTransition: true,
  nextState: 'Actif'
}

🔄 Transition automatique: Jeune → Actif

✅ Transition effectuée avec succès
```

## 🐛 Problèmes Potentiels

### Le levain ne passe pas à "Actif" après 6 jours

**Diagnostic:**
1. Vérifier les logs de `shouldAutoTransition`
2. Vérifier que `delay_h: 144` est bien configuré
3. Vérifier que `updateStateBasedOnTime()` est bien appelé

### Le message d'incubation ne s'affiche pas

**Diagnostic:**
1. Vérifier que `levain.current_state_name === 'Jeune'`
2. Vérifier le mapping dans `STATE_DB_TO_MACHINE`
3. Vérifier la BDD: la valeur doit être exactement `'Jeune'`

### La progression reste à 0%

**Diagnostic:**
1. Vérifier que `levain.created_at` existe et est valide
2. Vérifier le calcul dans `incubationProgress` computed property
3. Vérifier que la Date.now() fonctionne correctement

## 🎯 Comparaison avec "Lier un levain existant"

Pour vérifier que le flow est différent:

1. Créer un levain avec "LIER UN LEVAIN EXISTANT"

**Résultat attendu:**
- Le levain commence à l'état "Actif" (pas "Jeune")
- Pas de message d'incubation
- Utilisable immédiatement pour faire du pain

## 📊 Données en BDD

Pour un levain "Jeune", la table `levains` devrait contenir:

```sql
{
  id: [UUID],
  user_id: [UUID],
  name: "Mon Premier Levain",
  current_state_name: "Jeune",  -- État initial
  last_fed_at: "2024-12-03T10:00:00Z",
  streak: 0,
  created_at: "2024-12-03T10:00:00Z"
}
```

Après transition vers "Actif":

```sql
{
  ...
  current_state_name: "Actif",  -- Changé automatiquement
  ...
}
```

