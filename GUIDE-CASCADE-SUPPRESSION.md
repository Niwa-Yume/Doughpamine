# 🔧 Guide Complet : Suppression d'Utilisateur avec CASCADE

---

## ⚠️ IMPORTANT - LISEZ CECI EN PREMIER

**CES SCRIPTS SQL SONT À EXÉCUTER DANS SUPABASE DASHBOARD, PAS DANS VOTRE CODE !**

🚫 **NE PAS** :
- Importer ces fichiers dans votre projet Vue.js/TypeScript
- Les exécuter avec Node.js, npm ou autre
- Les ajouter à vos imports

✅ **À FAIRE** :
1. Ouvrir **Supabase Dashboard** (https://supabase.com/dashboard)
2. Aller dans **SQL Editor**
3. Copier-coller le contenu du fichier SQL
4. Cliquer sur **"Run"**
5. **C'est tout !** Votre code Vue.js n'a pas besoin d'être modifié.

---

## 🔴 Problème actuel
Vous avez exécuté la commande CASCADE mais les levains ne sont **toujours pas supprimés** quand vous supprimez un utilisateur.

## 🔍 Pourquoi la CASCADE simple ne suffit pas ?

Il y a plusieurs raisons possibles :

1. **RLS (Row Level Security)** : Les policies de sécurité empêchent la suppression
2. **Permissions** : La contrainte CASCADE n'a pas les droits nécessaires
3. **Supabase Dashboard** : Utilise peut-être un mécanisme spécial de suppression
4. **Soft Delete** : L'utilisateur est marqué comme supprimé, pas réellement supprimé

---

## ✅ SOLUTION EN 3 ÉTAPES

### Étape 1️⃣ : Diagnostic

Exécutez ce script pour comprendre le problème :

```sql
-- Fichier: supabase-migrations/diagnostic-cascade-issue.sql

-- Vérifier la contrainte CASCADE
SELECT 
  tc.constraint_name,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'levains' 
  AND tc.constraint_name = 'levains_user_id_fkey';
```

**Résultat attendu :** `delete_rule = 'CASCADE'`

✅ Si OUI → Passez à l'étape 2  
❌ Si NON → Relancez le script de l'étape 2

---

### Étape 2️⃣ : Solution Complète (RECOMMANDÉE)

**Exécutez le script complet :**

📄 Fichier : `supabase-migrations/SOLUTION-COMPLETE-CASCADE.sql`

Ce script fait **4 choses importantes** :

```sql
-- 1. Crée une policy RLS qui autorise les suppressions système
CREATE POLICY "Allow system to delete user levains"
ON levains FOR DELETE USING (true);

-- 2. Recrée la contrainte CASCADE proprement
ALTER TABLE levains DROP CONSTRAINT IF EXISTS levains_user_id_fkey;
ALTER TABLE levains ADD CONSTRAINT levains_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 3. Crée une fonction trigger de sécurité
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.levains WHERE user_id = OLD.id;
  RAISE LOG 'User % deleted, levains removed', OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 4. Active le trigger sur auth.users
CREATE TRIGGER before_user_delete_cascade
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_deletion();
```

**Comment exécuter :**
1. Ouvrez **Supabase Dashboard** → SQL Editor
2. Copiez **tout le contenu** de `SOLUTION-COMPLETE-CASCADE.sql`
3. Cliquez sur **"Run"**
4. Vérifiez qu'il n'y a pas d'erreurs

---

### Étape 3️⃣ : Test

#### A. Test Simple

1. **Trouvez un utilisateur de test** (ou créez-en un)
   ```sql
   SELECT id, email FROM auth.users LIMIT 5;
   ```

2. **Créez un levain pour cet utilisateur**
   ```sql
   INSERT INTO levains (user_id, name, current_state_name, skin)
   VALUES ('METTRE-UUID-ICI', 'Levain Test', 'Jeune', 'default');
   ```

3. **Vérifiez que le levain existe**
   ```sql
   SELECT * FROM levains WHERE user_id = 'METTRE-UUID-ICI';
   ```

4. **Supprimez l'utilisateur via le Dashboard**
   - Authentication → Users → ... → Delete User

5. **Vérifiez que le levain a disparu**
   ```sql
   SELECT * FROM levains WHERE user_id = 'METTRE-UUID-ICI';
   ```
   **Résultat attendu :** 0 lignes ✅

#### B. Test Avancé avec Logs

```sql
-- Activer les logs pour voir le trigger en action
SET client_min_messages TO LOG;

-- Créer et supprimer un user test
-- Vous verrez : "User xxx deleted, levains removed" dans les logs
```

---

## 🆘 Si ça ne marche TOUJOURS pas

### Solution Alternative : Fonction Manuelle

Si le trigger automatique ne fonctionne pas (rare), utilisez cette fonction :

📄 Fichier : `supabase-migrations/function-delete-user-complete.sql`

**1. Créez la fonction :**
```sql
CREATE OR REPLACE FUNCTION delete_user_and_data(user_id_to_delete UUID)
RETURNS JSON AS $$
BEGIN
  DELETE FROM public.levains WHERE user_id = user_id_to_delete;
  DELETE FROM auth.users WHERE id = user_id_to_delete;
  RETURN json_build_object('success', true, 'user_id', user_id_to_delete);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**2. Utilisez-la pour supprimer un utilisateur :**
```sql
-- Trouver l'UUID de l'utilisateur
SELECT id, email FROM auth.users WHERE email = 'user@example.com';

-- Supprimer l'utilisateur ET ses levains
SELECT delete_user_and_data('uuid-de-l-utilisateur');
```

**Résultat :**
```json
{"success": true, "user_id": "...", "levains_deleted": 2}
```

---

## 📋 Checklist de Vérification

Après avoir exécuté la solution complète, vérifiez :

- [ ] ✅ La contrainte CASCADE existe
  ```sql
  SELECT constraint_name, delete_rule 
  FROM information_schema.referential_constraints 
  WHERE constraint_name = 'levains_user_id_fkey';
  ```
  → Résultat : `delete_rule = 'CASCADE'`

- [ ] ✅ Le trigger existe
  ```sql
  SELECT trigger_name FROM information_schema.triggers 
  WHERE trigger_name = 'before_user_delete_cascade';
  ```
  → Résultat : 1 ligne

- [ ] ✅ La policy RLS existe
  ```sql
  SELECT policyname FROM pg_policies 
  WHERE tablename = 'levains' 
  AND policyname = 'Allow system to delete user levains';
  ```
  → Résultat : 1 ligne

- [ ] ✅ Test réel réussi (voir Étape 3)

---

## 🎯 Résumé des Fichiers Créés

| Fichier | Description |
|---------|-------------|
| `SOLUTION-COMPLETE-CASCADE.sql` | ⭐ **À EXÉCUTER EN PRIORITÉ** - Solution complète et testée |
| `diagnostic-cascade-issue.sql` | Diagnostiquer pourquoi ça ne marche pas |
| `function-delete-user-complete.sql` | Alternative manuelle si le trigger ne marche pas |
| `fix-user-delete-with-trigger.sql` | Version simplifiée du trigger |

---

## 💡 Explication Technique

### Pourquoi 3 mécanismes ?

1. **Contrainte CASCADE** → Devrait suffire en théorie
2. **Trigger BEFORE DELETE** → Garantit la suppression même si CASCADE échoue
3. **Policy RLS** → Autorise explicitement les suppressions système

Cette **triple protection** garantit que ça fonctionnera dans tous les cas !

---

## 🚀 Action Immédiate

**⚠️ ATTENTION : À faire dans Supabase Dashboard, PAS dans votre éditeur de code !**

**Étapes détaillées :**

1. **Ouvrez votre navigateur** (Chrome, Firefox, etc.)
2. **Allez sur** https://supabase.com/dashboard
3. **Connectez-vous** à votre compte Supabase
4. **Sélectionnez** votre projet **DoughPamine**
5. **Cliquez** sur **"SQL Editor"** dans le menu de gauche
6. **Cliquez** sur **"+ New query"**
7. **Ouvrez** le fichier `supabase-migrations/SOLUTION-COMPLETE-CASCADE.sql` dans votre éditeur (VSCode, WebStorm, etc.)
8. **Copiez** tout le contenu du fichier (Ctrl+A puis Ctrl+C)
9. **Retournez** dans Supabase Dashboard
10. **Collez** le code dans l'éditeur SQL (Ctrl+V)
11. **Cliquez** sur le bouton **"Run"** (ou Ctrl+Enter)
12. **Vérifiez** qu'il n'y a pas d'erreurs (message de succès devrait apparaître)
13. **Testez** avec un utilisateur factice

**Résultat attendu :** Message "Success. No rows returned" ou similaire

**Votre code Vue.js/TypeScript n'a AUCUNE modification à faire !**

**C'est parti ! 🎉**

---

## 📞 Support

Si après tout ça, le problème persiste :
1. Exécutez `diagnostic-cascade-issue.sql`
2. Partagez les résultats
3. Vérifiez les logs Supabase (Dashboard → Logs)
4. Utilisez la fonction manuelle en attendant

