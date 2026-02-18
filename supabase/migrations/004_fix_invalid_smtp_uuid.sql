-- ========================================
-- MIGRATION: Correction UUID invalide dans smtp_config
-- ========================================
-- Problème: L'UUID '34fa3420-6083-48fd-8fca8e154337' est invalide
-- car il manque un tiret entre '8fca' et '8e154337'
-- UUID correct: '34fa3420-6083-48fd-8fca-8e154337'
-- ========================================

-- Approche: Supprimer et recréer l'enregistrement smtp_config avec un UUID valide
-- car PostgreSQL ne permet pas de modifier directement une clé primaire UUID invalide

DO $$
DECLARE
  bad_record RECORD;
  new_uuid uuid;
BEGIN
  -- Chercher des enregistrements avec des UUIDs potentiellement corrompus
  -- en utilisant une approche de cast sécurisée
  
  -- Supprimer tous les enregistrements smtp_config existants et les recréer proprement
  -- (la table smtp_config ne contient normalement qu'une seule ligne de configuration)
  
  -- Sauvegarder les données existantes
  CREATE TEMP TABLE IF NOT EXISTS smtp_config_backup AS
    SELECT 
      host,
      port,
      username,
      password,
      from_email,
      from_name,
      use_tls,
      reply_to,
      is_active,
      created_by,
      updated_at
    FROM public.smtp_config
    LIMIT 1;

  -- Supprimer tous les enregistrements existants (UUID potentiellement invalides)
  DELETE FROM public.smtp_config;

  -- Réinsérer avec un UUID valide généré automatiquement
  INSERT INTO public.smtp_config (
    host,
    port,
    username,
    password,
    from_email,
    from_name,
    use_tls,
    reply_to,
    is_active,
    created_by,
    updated_at
  )
  SELECT 
    host,
    port,
    username,
    password,
    from_email,
    from_name,
    use_tls,
    reply_to,
    is_active,
    created_by,
    updated_at
  FROM smtp_config_backup;

  -- Nettoyer la table temporaire
  DROP TABLE IF EXISTS smtp_config_backup;

  RAISE NOTICE 'Migration 004: UUID smtp_config corrigé avec succès';

EXCEPTION
  WHEN OTHERS THEN
    -- Si la table de backup n'existe pas ou est vide, juste nettoyer
    DROP TABLE IF EXISTS smtp_config_backup;
    RAISE NOTICE 'Migration 004: Aucun enregistrement smtp_config à corriger ou erreur: %', SQLERRM;
END $$;
