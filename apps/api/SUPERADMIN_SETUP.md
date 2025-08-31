# 🚀 Superadmin Setup Guide

## **Goal:** Make your "admin" user a superadmin with access to everything

## **Method 1: Direct Database Update (Recommended)**

### **Step 1: Connect to your PostgreSQL database**

```bash
# If using psql command line
psql -h localhost -U your_username -d your_database_name

# Or use your preferred database tool (pgAdmin, DBeaver, etc.)
```

### **Step 2: Create the superadmin role**

```sql
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
```

### **Step 3: Get the role and user IDs**

```sql
-- Get superadmin role ID
SELECT id, name FROM roles WHERE name = 'superadmin';

-- Get admin user ID
SELECT id, username, name FROM admin_users WHERE username = 'admin';
```

### **Step 4: Assign superadmin role to admin user**

```sql
-- Replace the UUIDs with the actual IDs from Step 3
INSERT INTO admin_user_roles (user_id, role_id)
VALUES ('ADMIN_USER_ID_HERE', 'SUPERADMIN_ROLE_ID_HERE');
```

### **Step 5: Verify the changes**

```sql
SELECT
  au.username,
  au.name,
  r.name as role_name,
  r.description as role_description
FROM admin_users au
JOIN admin_user_roles aur ON au.id = aur.user_id
JOIN roles r ON aur.role_id = r.id
WHERE au.username = 'admin';
```

## **Method 2: Run the SQL Script**

1. Copy the contents of `update-admin-to-superadmin.sql`
2. Run it in your database tool
3. The script will handle everything automatically

## **Method 3: Manual Database Tool Steps**

### **Using pgAdmin:**

1. Open pgAdmin
2. Connect to your database
3. Open Query Tool
4. Copy and paste the SQL commands from Method 1
5. Execute each step

### **Using DBeaver:**

1. Open DBeaver
2. Connect to your database
3. Open SQL Editor
4. Copy and paste the SQL commands
5. Execute each step

## **Expected Result:**

After running the commands, you should see:

```
username | name | role_name | role_description
---------|------|-----------|------------------
admin    | Admin| superadmin| Super Administrator with access to everything
```

## **What This Gives You:**

✅ **Full Access**: Access to all admin features regardless of permissions  
✅ **Countries Page**: Can view and manage countries  
✅ **All Modules**: Access to movies, users, analytics, etc.  
✅ **No Restrictions**: Bypasses all permission checks

## **Testing:**

1. Log out of the admin panel
2. Log back in with username "admin"
3. You should see a purple "🚀 Superadmin" badge in the header
4. All navigation items should be visible
5. Countries page should be accessible without warnings

## **Troubleshooting:**

- **Role not found**: Make sure you created the superadmin role first
- **User not found**: Verify the admin user exists
- **Permission denied**: Check that the role assignment was successful
- **Still can't access**: Clear browser cache and log out/in again
