-- CreateTable
CREATE TABLE "user" (
    "UserId" SERIAL NOT NULL,
    "Password" VARCHAR(255) NOT NULL,
    "FullName" VARCHAR(128) NOT NULL,
    "Email" VARCHAR(64) NOT NULL,
    "PhoneNumber" VARCHAR(16),
    "Role" VARCHAR(32) NOT NULL DEFAULT 'user',
    "DOB" DATE,
    "Gender" VARCHAR(16),
    "Address" VARCHAR(256),
    "Avatar" VARCHAR(256),
    "ProfileUrl" VARCHAR(128),
    "IsVerified" BOOLEAN NOT NULL DEFAULT false,
    "CreatedBy" INTEGER NOT NULL DEFAULT 1,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" INTEGER NOT NULL DEFAULT 1,
    "UpdatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("UserId")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_Email_key" ON "user"("Email");
