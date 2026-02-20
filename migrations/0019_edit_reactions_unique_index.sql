-- 1. Drop old index
DROP INDEX idx_unique_reaction;

-- 2. Create new one
CREATE UNIQUE INDEX idx_unique_reaction 
ON reactions(userId, targetId, targetType);