-- AddColumn with defaults so existing rows don't violate NOT NULL
ALTER TABLE "User" ADD COLUMN "firstName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "lastName"  TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "middleName" TEXT;

-- Backfill: first word → firstName, rest → lastName (mirrors the old name field)
UPDATE "User"
SET
  "firstName" = SPLIT_PART("name", ' ', 1),
  "lastName"  = CASE
                  WHEN POSITION(' ' IN "name") > 0
                  THEN SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)
                  ELSE ''
                END;

-- Remove the column default now that existing rows are populated
ALTER TABLE "User" ALTER COLUMN "firstName" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "lastName"  DROP DEFAULT;

-- Drop old name column
ALTER TABLE "User" DROP COLUMN "name";
