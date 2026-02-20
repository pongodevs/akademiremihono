CREATE TABLE "resetPasswords"(
  "_id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "expiryTime" INTEGER DEFAULT 0,
  PRIMARY KEY ("_id")
);

CREATE UNIQUE INDEX idx_reset_passwords_email ON resetPasswords(email);
