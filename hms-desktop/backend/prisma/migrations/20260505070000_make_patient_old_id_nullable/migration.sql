-- New patients created after switching to readable patient IDs do not have a
-- former CUID. Keep old_id only as optional rollback/reference metadata.
ALTER TABLE "patients" ALTER COLUMN "old_id" DROP NOT NULL;
