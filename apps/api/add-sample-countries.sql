-- Add sample countries for testing
INSERT INTO countries (id, name, code, native_name, flag, flag_url, description, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'United States', 'US', 'United States', '🇺🇸', NULL, 'United States of America', true, NOW(), NOW()),
  (gen_random_uuid(), 'Thailand', 'TH', 'ประเทศไทย', '🇹🇭', NULL, 'Kingdom of Thailand', true, NOW(), NOW()),
  (gen_random_uuid(), 'Japan', 'JP', '日本', '🇯🇵', NULL, 'Japan', true, NOW(), NOW()),
  (gen_random_uuid(), 'South Korea', 'KR', '대한민국', '🇰🇷', NULL, 'Republic of Korea', true, NOW(), NOW()),
  (gen_random_uuid(), 'China', 'CN', '中国', '🇨🇳', NULL, 'People''s Republic of China', true, NOW(), NOW()),
  (gen_random_uuid(), 'India', 'IN', 'भारत', '🇮🇳', NULL, 'Republic of India', true, NOW(), NOW()),
  (gen_random_uuid(), 'United Kingdom', 'GB', 'United Kingdom', '🇬🇧', NULL, 'United Kingdom of Great Britain and Northern Ireland', true, NOW(), NOW()),
  (gen_random_uuid(), 'France', 'FR', 'France', '🇫🇷', NULL, 'French Republic', true, NOW(), NOW()),
  (gen_random_uuid(), 'Germany', 'DE', 'Deutschland', '🇩🇪', NULL, 'Federal Republic of Germany', true, NOW(), NOW()),
  (gen_random_uuid(), 'Canada', 'CA', 'Canada', '🇨🇦', NULL, 'Canada', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Verify the countries were added
SELECT id, name, code, native_name, flag, is_active FROM countries ORDER BY name;
