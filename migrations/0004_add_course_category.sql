ALTER TABLE courses ADD COLUMN category TEXT DEFAULT 'programming';

CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_category ON courses(category);