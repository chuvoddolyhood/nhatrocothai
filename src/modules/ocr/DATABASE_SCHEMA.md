# Database Schema for OCR Meter Readings

## Supabase Storage

### Bucket: `meter-images`

**Settings:**
- Public: `true` (để có thể lấy public URL)
- File size limit: `5MB`
- Allowed MIME types: `image/jpeg`, `image/png`

**Folder Structure:**
```
meter-images/
├── meter-readings/
│   ├── {room_id}/
│   │   ├── {YYYY-MM}/
│   │   │   ├── {room_id}_{YYYY-MM}_electric_{timestamp}.jpg
│   │   │   └── {room_id}_{YYYY-MM}_water_{timestamp}.jpg
```

**Storage Policies:**

```sql
-- Policy 1: Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'meter-images');

-- Policy 2: Allow public read access
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'meter-images');

-- Policy 3: Allow users to delete their own uploads
CREATE POLICY "Allow delete own uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'meter-images');
```

---

## Database Tables

### Table: `meter_readings`

Cần thêm các columns cho OCR data:

```sql
-- Add OCR-related columns to existing meter_readings table
ALTER TABLE meter_readings
ADD COLUMN IF NOT EXISTS electric_image_url TEXT,
ADD COLUMN IF NOT EXISTS water_image_url TEXT,
ADD COLUMN IF NOT EXISTS electric_ocr_text TEXT,
ADD COLUMN IF NOT EXISTS water_ocr_text TEXT,
ADD COLUMN IF NOT EXISTS electric_ocr_confidence DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS water_ocr_confidence DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS electric_ocr_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS water_ocr_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN meter_readings.electric_image_url IS 'URL ảnh chụp đồng hồ điện';
COMMENT ON COLUMN meter_readings.water_image_url IS 'URL ảnh chụp đồng hồ nước';
COMMENT ON COLUMN meter_readings.electric_ocr_text IS 'Số OCR đọc được từ đồng hồ điện';
COMMENT ON COLUMN meter_readings.water_ocr_text IS 'Số OCR đọc được từ đồng hồ nước';
COMMENT ON COLUMN meter_readings.electric_ocr_confidence IS 'Độ tin cậy OCR điện (0-1)';
COMMENT ON COLUMN meter_readings.water_ocr_confidence IS 'Độ tin cậy OCR nước (0-1)';
COMMENT ON COLUMN meter_readings.electric_ocr_verified IS 'User đã xác nhận số điện?';
COMMENT ON COLUMN meter_readings.water_ocr_verified IS 'User đã xác nhận số nước?';
COMMENT ON COLUMN meter_readings.verified_by IS 'User ID người xác nhận';
COMMENT ON COLUMN meter_readings.verified_at IS 'Thời gian xác nhận';
```

### Example Record

```json
{
  "id": "uuid",
  "room_id": "room-123",
  "contract_id": "contract-456",
  "month": "2024-12",
  "electric_old": 12000,
  "electric_new": 12345,
  "electric_used": 345,
  "electric_image_url": "https://supabase.co/storage/v1/object/public/meter-images/...",
  "electric_ocr_text": "12345",
  "electric_ocr_confidence": 0.92,
  "electric_ocr_verified": true,
  "water_old": 50,
  "water_new": 55,
  "water_used": 5,
  "water_image_url": "https://supabase.co/storage/v1/object/public/meter-images/...",
  "water_ocr_text": "55",
  "water_ocr_confidence": 0.88,
  "water_ocr_verified": true,
  "verified_by": "user-789",
  "verified_at": "2024-12-15T10:30:00Z",
  "created_at": "2024-12-15T10:25:00Z",
  "updated_at": "2024-12-15T10:30:00Z"
}
```

---

## Migration Script

```sql
-- ========================================
-- OCR Module Database Migration
-- Version: 1.0
-- Date: 2024-12-15
-- ========================================

-- Step 1: Create Storage Bucket (via Supabase Dashboard)
-- Bucket name: meter-images
-- Public: true

-- Step 2: Add OCR columns to meter_readings table
ALTER TABLE meter_readings
ADD COLUMN IF NOT EXISTS electric_image_url TEXT,
ADD COLUMN IF NOT EXISTS water_image_url TEXT,
ADD COLUMN IF NOT EXISTS electric_ocr_text TEXT,
ADD COLUMN IF NOT EXISTS water_ocr_text TEXT,
ADD COLUMN IF NOT EXISTS electric_ocr_confidence DECIMAL(3,2) CHECK (electric_ocr_confidence >= 0 AND electric_ocr_confidence <= 1),
ADD COLUMN IF NOT EXISTS water_ocr_confidence DECIMAL(3,2) CHECK (water_ocr_confidence >= 0 AND water_ocr_confidence <= 1),
ADD COLUMN IF NOT EXISTS electric_ocr_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS water_ocr_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_meter_readings_verified_by 
ON meter_readings(verified_by);

CREATE INDEX IF NOT EXISTS idx_meter_readings_verified_at 
ON meter_readings(verified_at);

-- Step 4: Create view for OCR statistics
CREATE OR REPLACE VIEW ocr_statistics AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_readings,
  COUNT(electric_image_url) as electric_with_image,
  COUNT(water_image_url) as water_with_image,
  AVG(electric_ocr_confidence) as avg_electric_confidence,
  AVG(water_ocr_confidence) as avg_water_confidence,
  COUNT(CASE WHEN electric_ocr_verified = true THEN 1 END) as electric_verified_count,
  COUNT(CASE WHEN water_ocr_verified = true THEN 1 END) as water_verified_count
FROM meter_readings
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Step 5: Create function to calculate OCR accuracy over time
CREATE OR REPLACE FUNCTION get_ocr_accuracy_trend(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS TABLE (
  date DATE,
  avg_confidence DECIMAL,
  reading_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    ROUND(AVG(COALESCE(electric_ocr_confidence, water_ocr_confidence))::numeric, 2) as avg_confidence,
    COUNT(*) as reading_count
  FROM meter_readings
  WHERE created_at BETWEEN start_date AND end_date
    AND (electric_ocr_confidence IS NOT NULL OR water_ocr_confidence IS NOT NULL)
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Add RLS policies if not exists
-- (Assuming RLS is already enabled on meter_readings)

-- Policy: Users can view their own meter readings
CREATE POLICY IF NOT EXISTS "Users can view own meter readings"
ON meter_readings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM contracts
    WHERE contracts.id = meter_readings.contract_id
    AND contracts.tenant_id = auth.uid()
  )
);

-- Policy: Landlords can view all meter readings
CREATE POLICY IF NOT EXISTS "Landlords can view all meter readings"
ON meter_readings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM rooms
    JOIN contracts ON contracts.room_id = rooms.id
    WHERE contracts.id = meter_readings.contract_id
    AND rooms.landlord_id = auth.uid()
  )
);

-- Policy: Landlords can insert meter readings
CREATE POLICY IF NOT EXISTS "Landlords can insert meter readings"
ON meter_readings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM rooms
    JOIN contracts ON contracts.room_id = rooms.id
    WHERE contracts.id = contract_id
    AND rooms.landlord_id = auth.uid()
  )
);

-- Policy: Landlords can update meter readings
CREATE POLICY IF NOT EXISTS "Landlords can update meter readings"
ON meter_readings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM rooms
    JOIN contracts ON contracts.room_id = rooms.id
    WHERE contracts.id = meter_readings.contract_id
    AND rooms.landlord_id = auth.uid()
  )
);

-- Verification: Check migration
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'meter_readings'
  AND column_name LIKE '%ocr%' OR column_name LIKE '%image%' OR column_name LIKE '%verified%'
ORDER BY ordinal_position;
```

---

## Usage Examples

### Insert meter reading with OCR data

```javascript
const { data, error } = await supabase
  .from('meter_readings')
  .insert([{
    room_id: 'room-123',
    contract_id: 'contract-456',
    month: '2024-12',
    electric_old: 12000,
    electric_new: 12345,
    electric_used: 345,
    electric_image_url: 'https://...',
    electric_ocr_text: '12345',
    electric_ocr_confidence: 0.92,
    electric_ocr_verified: true,
    verified_by: userId,
    verified_at: new Date().toISOString(),
  }])
  .select()
  .single();
```

### Query OCR statistics

```javascript
const { data } = await supabase
  .from('ocr_statistics')
  .select('*')
  .order('month', { ascending: false })
  .limit(12);
```

### Get OCR accuracy trend

```javascript
const { data } = await supabase
  .rpc('get_ocr_accuracy_trend', {
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  });
```

---

## Rollback Script

```sql
-- Remove OCR columns
ALTER TABLE meter_readings
DROP COLUMN IF EXISTS electric_image_url,
DROP COLUMN IF EXISTS water_image_url,
DROP COLUMN IF EXISTS electric_ocr_text,
DROP COLUMN IF EXISTS water_ocr_text,
DROP COLUMN IF EXISTS electric_ocr_confidence,
DROP COLUMN IF EXISTS water_ocr_confidence,
DROP COLUMN IF EXISTS electric_ocr_verified,
DROP COLUMN IF EXISTS water_ocr_verified,
DROP COLUMN IF EXISTS verified_by,
DROP COLUMN IF EXISTS verified_at;

-- Drop view
DROP VIEW IF EXISTS ocr_statistics;

-- Drop function
DROP FUNCTION IF EXISTS get_ocr_accuracy_trend;

-- Drop indexes
DROP INDEX IF EXISTS idx_meter_readings_verified_by;
DROP INDEX IF EXISTS idx_meter_readings_verified_at;

-- Delete storage bucket via Supabase Dashboard
```

---

## Environment Variables

Đảm bảo có các biến môi trường trong `.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Notes

- Image URLs được lưu trực tiếp từ Supabase Storage (public URLs)
- OCR confidence được lưu dạng DECIMAL(3,2) để hỗ trợ giá trị 0.00 - 1.00
- Verified flag cho biết user đã xác nhận số đọc được
- Verified_by và verified_at để audit trail
