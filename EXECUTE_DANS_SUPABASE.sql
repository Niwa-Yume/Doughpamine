-- ================================================
-- NETTOYAGE AVEC MIGRATION - COPIE-COLLE TOUT
-- ================================================
-- Ce script corrige d'ABORD les levains, PUIS nettoie les états

-- Étape 1 : Voir les états actuels
SELECT * FROM levain_states ORDER BY name;

-- Étape 2 : Voir les levains existants et leurs états
SELECT id, name, current_state_name FROM levains;

-- Étape 3 : CRÉER les nouveaux états (s'ils n'existent pas déjà)
INSERT INTO levain_states (name, description) VALUES
  ('Actif', 'Levain bien nourri, pret a l''usage'),
  ('Actif/pret', 'Juste nourri, pleinement operationnel'),
  ('Neglige', 'Nourri il y a longtemps, commence a souffrir'),
  ('Affame', 'Tres long delai sans nourriture'),
  ('Au frais', 'Stocke au frigo, metabolisme ralenti'),
  ('Mort', 'Levain probablement irrecuperable')
ON CONFLICT (name) DO NOTHING;

-- Étape 4 : MIGRER tous les levains vers les nouveaux noms d'états
UPDATE levains SET current_state_name = 'Actif/pret' WHERE current_state_name IN ('Actif/prêt', 'Nourri', 'nourri');
UPDATE levains SET current_state_name = 'Neglige' WHERE current_state_name IN ('Négligé', 'négligé');
UPDATE levains SET current_state_name = 'Affame' WHERE current_state_name IN ('Affamé', 'affamé');
UPDATE levains SET current_state_name = 'Au frais' WHERE current_state_name IN ('Congelé', 'congelé', 'Congele', 'congele');

-- Étape 5 : Vérifier que TOUS les levains ont maintenant des états valides
SELECT id, name, current_state_name FROM levains;

-- Étape 6 : MAINTENANT on peut supprimer les anciens états
DELETE FROM levain_states WHERE name IN ('Affamé', 'Négligé', 'Actif/prêt', 'Congelé', 'Nourri', 'nourri', 'congelé', 'négligé', 'affamé');

-- Étape 7 : Vérifier qu'il reste EXACTEMENT 6 états
SELECT * FROM levain_states ORDER BY name;

-- Étape 8 : FINAL - Comptage
SELECT COUNT(*) as total_states FROM levain_states;
-- DOIT RETOURNER: 6

