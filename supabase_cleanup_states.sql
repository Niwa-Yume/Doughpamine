-- ================================================
-- NETTOYAGE DES ÉTATS DU LEVAIN (levain_states)
-- ================================================
-- Ce script supprime les doublons et réinsère uniquement les 6 états corrects
-- SANS ACCENTS pour éviter les problèmes d'encodage
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier les doublons (optionnel - pour voir le problème)
SELECT name, COUNT(*) as count
FROM levain_states
GROUP BY name
HAVING COUNT(*) > 1;

-- 2. Vérifier tous les états actuels
SELECT * FROM levain_states ORDER BY name;

-- 3. Supprimer tous les états existants
DELETE FROM levain_states;

-- 4. Réinsérer uniquement les 6 états corrects (SOT - Source of Truth)
-- Note: SANS ACCENTS (é → e, ê → e)
INSERT INTO levain_states (name, description) VALUES
  ('Actif', 'Levain bien nourri, pret a l''usage'),
  ('Actif/pret', 'Juste nourri, pleinement operationnel'),
  ('Neglige', 'Nourri il y a longtemps, commence a souffrir'),
  ('Affame', 'Tres long delai sans nourriture'),
  ('Au frais', 'Stocke au frigo, metabolisme ralenti'),
  ('Mort', 'Levain probablement irrecuperable')
ON CONFLICT (name) DO NOTHING;

-- 5. Vérifier que tout est correct (doit retourner EXACTEMENT 6 lignes)
SELECT * FROM levain_states ORDER BY name;

-- 6. Corriger les levains existants qui utilisent les anciens noms avec accents
UPDATE levains SET current_state_name = 'Actif/pret' WHERE current_state_name IN ('Actif/prêt', 'Actif prêt', 'ActifPret');
UPDATE levains SET current_state_name = 'Neglige' WHERE current_state_name IN ('Négligé', 'Neglige', 'négligé');
UPDATE levains SET current_state_name = 'Affame' WHERE current_state_name IN ('Affamé', 'Affame', 'affamé');
UPDATE levains SET current_state_name = 'Au frais' WHERE current_state_name IN ('Congelé', 'Congele', 'congelé');

-- 7. Vérifier qu'aucun levain n'utilise un état invalide
SELECT DISTINCT current_state_name
FROM levains
WHERE current_state_name NOT IN ('Actif', 'Actif/pret', 'Neglige', 'Affame', 'Au frais', 'Mort');
-- Cette requête doit retourner 0 lignes

-- 8. Résumé final
SELECT
  (SELECT COUNT(*) FROM levain_states) as total_states,
  (SELECT COUNT(DISTINCT current_state_name) FROM levains) as states_in_use;
-- total_states doit être 6, states_in_use doit être <= 6


