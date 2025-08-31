-- Update admin user to have superadmin role
-- This script will:
-- 1. Create the superadmin role if it doesn't exist
-- 2. Assign the superadmin role to the admin user

-- Step 1: Create superadmin role if it doesn't exist
INSERT INTO roles (id, name, description, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'superadmin',
  'Super Administrator with access to everything',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (name) DO NOTHING;

-- Step 2: Get the superadmin role ID
DO $$
DECLARE
  superadmin_role_id UUID;
  admin_user_id UUID;
BEGIN
  -- Get the superadmin role ID
  SELECT id INTO superadmin_role_id FROM roles WHERE name = 'superadmin';
  
  -- Get the admin user ID
  SELECT id INTO admin_user_id FROM admin_users WHERE username = 'admin';
  
  -- Check if both exist
  IF superadmin_role_id IS NULL THEN
    RAISE EXCEPTION 'Superadmin role not found';
  END IF;
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found';
  END IF;
  
  -- Remove any existing roles for admin user
  DELETE FROM admin_user_roles WHERE user_id = admin_user_id;
  
  -- Assign superadmin role to admin user
  INSERT INTO admin_user_roles (user_id, role_id)
  VALUES (admin_user_id, superadmin_role_id);
  
  RAISE NOTICE 'Successfully assigned superadmin role to admin user';
END $$;

-- Step 3: Verify the changes
SELECT 
  au.username,
  au.name,
  r.name as role_name,
  r.description as role_description
FROM admin_users au
JOIN admin_user_roles aur ON au.id = aur.user_id
JOIN roles r ON aur.role_id = r.id
WHERE au.username = 'admin';
