ALTER TABLE courses ADD COLUMN visibility TEXT DEFAULT "coming-soon" NOT NULL;

CREATE INDEX idx_courses_visibility ON courses(visibility);