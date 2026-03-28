-- Seed: roles + admin user llleroiv@gmail.com
-- Idempotent: safe to run multiple times

-- 1. Roles
INSERT INTO "Roles" ("Name")
VALUES ('Admin'), ('User')
ON CONFLICT ("Name") DO NOTHING;

-- 2. Admin user
INSERT INTO "Users" ("Email", "CreatedAt")
VALUES ('llleroiv@gmail.com', NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Email") DO NOTHING;

-- 3. Admin user profile
INSERT INTO "UserProfiles" ("UserId", "FullName")
SELECT "Id", 'Admin'
FROM "Users"
WHERE "Email" = 'llleroiv@gmail.com'
ON CONFLICT ("UserId") DO NOTHING;

-- 4. Assign Admin role
INSERT INTO "UserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "Users" u
CROSS JOIN "Roles" r
WHERE u."Email" = 'llleroiv@gmail.com'
  AND r."Name" = 'Admin'
ON CONFLICT ("UserId", "RoleId") DO NOTHING;
