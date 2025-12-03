# État "Jeune" - Levain en Incubation

## 🌱 Concept

L'état **"Jeune"** a été ajouté pour gérer le cas d'un levain créé from scratch (de zéro), par opposition à un levain existant qu'on lie à l'application.

## 📊 Flow Utilisateur

### 1. Création du levain
- L'utilisateur choisit "CRÉER UN LEVAIN" (au lieu de "LIER UN LEVAIN EXISTANT")
- Il donne un nom à son levain
- Le levain est créé avec l'état initial **"Jeune"**

### 2. Période d'incubation (6 jours)
- **Durée**: 144 heures (6 jours)
- **Actions utilisateur**: Nourrir quotidiennement le levain
- **Comportement**: 
  - Quand l'utilisateur nourrit le levain jeune, il reste à l'état "Jeune"
  - Le timer affiche le temps restant jusqu'à ce qu'il devienne actif
  - Un message informatif s'affiche expliquant la période d'incubation

### 3. Transition vers "Actif"
- **Automatique**: Après 6 jours (144h), le levain devient automatiquement "Actif"
- À partir de là, il suit le flow normal des états (Actif → Prêt → Affamé → etc.)

## 🎨 UX

### Message informatif
Quand le levain est à l'état "Jeune", un message s'affiche sur la HomePage :

```
🌱 Période d'incubation

Votre levain est jeune et se développe ! Nourrissez-le quotidiennement 
pendant 6 jours pour qu'il devienne actif et prêt à faire du pain.
```

### Visuel
- **Vidéo**: `levain basique.mp4` (version calme/neutre du levain)
- **Timer**: Affiche le temps restant jusqu'à la fin de l'incubation (6 jours max)
- **Couleur**: Vert (levain en bonne santé, en développement)

## ⚙️ Configuration Technique

### Machine à états
```typescript
jeune: {
  label: 'Jeune levain en incubation',
  max_delay_h: 168, // 7 jours maximum
  actions: {
    nourrir: { to: 'jeune' }, // Reste jeune quand nourri
    rien_faire: { to: 'actif', delay_h: 144 } // Devient actif après 6 jours
  }
}
```

### Mapping BDD
- **BDD**: `'Jeune'`
- **Machine**: `'jeune'`

## 🔄 Différences avec "Lier un levain existant"

| Aspect | Créer from scratch | Lier existant |
|--------|-------------------|---------------|
| État initial | **Jeune** | **Actif** |
| Période d'incubation | Oui (6 jours) | Non |
| Utilisable pour le pain | Après 6 jours | Immédiatement |
| Message informatif | Oui | Non |

## 🎯 Logique métier

Un vrai levain créé from scratch nécessite environ 5-7 jours de nourrissages quotidiens pour :
- Développer les bonnes levures et bactéries
- Atteindre un pH stable
- Être suffisamment actif pour faire lever le pain

Ce nouvel état respecte cette réalité biologique et guide l'utilisateur dans le processus.

## 📝 Fichiers modifiés

1. **levainStateMachine.ts**
   - Ajout de l'état "jeune" dans les mappings
   - Configuration de l'état avec ses transitions

2. **CreationLevainPage.vue**
   - Changement de l'état initial de `'Actif'` à `'Jeune'`

3. **HomePage.vue**
   - Ajout de la vidéo pour l'état "Jeune"
   - Ajout du message informatif d'incubation
   - Styles pour le message

## 🚀 Améliorations futures possibles

- Tracker le nombre de nourrissages et afficher la progression (ex: "3/7 nourrissages")
- Envoyer une notification quand le levain devient actif
- Afficher des conseils quotidiens pendant l'incubation
- Permettre de passer manuellement à "Actif" si l'utilisateur juge que le levain est prêt

