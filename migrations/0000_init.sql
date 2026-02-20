-- Users
CREATE TABLE "users"(
  "_id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT, 
  "dateCreated" INTEGER DEFAULT (unixepoch()), 
  "avatarUrl" TEXT, 
  "password" TEXT, 
  "isRegistered" INTEGER NOT NULL, 
  "verificationCode" TEXT, 
  "verificationCodeExpiryTime" INTEGER DEFAULT 0, 
  "accountType" TEXT NOT NULL,
  PRIMARY KEY ("_id")
);

CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Comments
CREATE TABLE "comments"(
  "_id" TEXT NOT NULL,
  "videoId" TEXT NOT NULL,
  "parentId" TEXT,
  "userId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "likeCount" INTEGER DEFAULT 0,
  "dislikeCount" INTEGER DEFAULT 0,
  "createdAt" INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY ("_id")
);

CREATE INDEX idx_comments_video_id ON comments(videoId);
CREATE INDEX idx_comments_parent_id ON comments(parentId);
CREATE INDEX idx_comments_user_id ON comments(userId);
CREATE INDEX idx_comments_created_at ON comments(createdAt);

-- Reaction
CREATE TABLE "reactions"(
  "_id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "createdAt" INTEGER DEFAULT (unixepoch()),
  "value" INTEGER NOT NULL,
  PRIMARY KEY ("_id")
);

CREATE INDEX idx_reactions_user_id ON reactions(userId);
CREATE INDEX idx_reactions_target_id ON reactions(targetId);
CREATE UNIQUE INDEX idx_unique_reaction ON reactions(userId, targetId);

-- Video Views
CREATE TABLE "videoViews"(
  "_id" TEXT NOT NULL,
  "videoId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "watchedSeconds" INTEGER DEFAULT 0,
  "createdAt" INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY ("_id")
);

CREATE INDEX idx_video_views_video_id ON videoViews(videoId);
CREATE INDEX idx_video_views_user_id ON videoViews(userId);

-- Courses
CREATE TABLE "courses"(
  "_id" TEXT NOT NULL,
  "creatorId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "rating" REAL,
  "ratingCount" INTEGER DEFAULT 0,
  "price" REAL,
  "languagesAvailability" TEXT,
  "createdAt" INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY("_id")
);

CREATE INDEX idx_courses_creator_id ON courses(creatorId);
CREATE INDEX idx_courses_title ON courses(title);

-- Course Section
CREATE TABLE "courseSections" (
  "_id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "createdAt" INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY("_id")
);

CREATE INDEX idx_course_sections_course_id ON courseSections(courseId);

-- Videos
CREATE TABLE "contents"(
  "_id" TEXT NOT NULL,
  "sectionId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT DEFAULT "",
  "thumbnailUrl" TEXT,
  "type" TEXT NOT NULL,
  "sourceUrl" TEXT,
  
  -- video fields
  "durationSeconds" INTEGER DEFAULT 0,

  -- file fileds
  "fileSize" INTEGER,
  "fileType" TEXT,

  "visibility" TEXT NOT NULL, 
  "position" INTEGER NOT NULL,

  "viewCount" INTEGER DEFAULT 0,
  "likeCount" INTEGER DEFAULT 0,
  "dislikeCount" INTEGER DEFAULT 0,
  "commentCount" INTEGER DEFAULT 0,

  "publishedAt" INTEGER DEFAULT 0,
  "createdAt" INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY ("_id")
);

CREATE INDEX idx_contents_section_id ON contents(sectionId);
CREATE INDEX idx_contents_title ON contents(title);
CREATE INDEX idx_contents_created_at ON contents(createdAt);

