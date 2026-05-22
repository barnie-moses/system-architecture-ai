-- Repair schema drift from the early project model migration.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Project'
      AND column_name = 'canvasJasonPath'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Project'
      AND column_name = 'canvasJsonPath'
  ) THEN
    ALTER TABLE "Project" RENAME COLUMN "canvasJasonPath" TO "canvasJsonPath";
  ELSIF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Project'
      AND column_name = 'canvasJsonPath'
  ) THEN
    ALTER TABLE "Project" ADD COLUMN "canvasJsonPath" TEXT;
  END IF;
END $$;

-- Rename the misspelled collaborators table.
ALTER TABLE IF EXISTS "ProjectCollborators" RENAME TO "ProjectCollaborators";
