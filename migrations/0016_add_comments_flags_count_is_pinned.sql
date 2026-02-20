ALTER TABLE comments ADD COLUMN flagsCount INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN isPinned INTEGER DEFAULT 0;

CREATE INDEX idx_comments_flags_count ON comments(flagsCount);
CREATE INDEX idx_comments_is_pinned ON comments(isPinned);