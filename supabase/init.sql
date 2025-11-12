-- Create enum for teacher names
CREATE TYPE teacher_type AS ENUM ('Daemen', 'Martina');

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    student_number VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    class VARCHAR(255) NOT NULL,
    topic TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create slots table
CREATE TABLE IF NOT EXISTS slots (
    id BIGSERIAL PRIMARY KEY,
    date VARCHAR(10) NOT NULL, -- YYYY-MM-DD format
    time VARCHAR(5) NOT NULL,  -- HH:MM format
    teacher teacher_type NOT NULL,
    available BOOLEAN DEFAULT true NOT NULL,
    student_number VARCHAR(255) REFERENCES students(student_number),
    present BOOLEAN DEFAULT false NOT NULL,
    notes TEXT,
    completed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_slots_teacher ON slots(teacher);
CREATE INDEX IF NOT EXISTS idx_slots_date ON slots(date);
CREATE INDEX IF NOT EXISTS idx_slots_student_number ON slots(student_number);
CREATE INDEX IF NOT EXISTS idx_students_student_number ON students(student_number);

-- Create a view for slots with student information
CREATE OR REPLACE VIEW slots_with_students AS
SELECT 
    s.*,
    st.name as student_name,
    st.class as student_class,
    st.topic as student_topic
FROM slots s
LEFT JOIN students st ON s.student_number = st.student_number;

-- Add row level security policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;

-- Create policies for students table
CREATE POLICY "Allow public read access to students"
    ON students FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert to students"
    ON students FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow update of own student record"
    ON students FOR UPDATE
    USING (true);

-- Create policies for slots table
CREATE POLICY "Allow public read access to slots"
    ON slots FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert to slots"
    ON slots FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow update of slots"
    ON slots FOR UPDATE
    USING (true);

CREATE POLICY "Allow delete of unbooked slots"
    ON slots FOR DELETE
    USING (student_number IS NULL);

-- Create teacher users
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES
  ('daemen@example.com', crypt('EvaAdmin', gen_salt('bf')), now(), 'authenticated'),
  ('martina@example.com', crypt('MahrnordAdmin', gen_salt('bf')), now(), 'authenticated')
ON CONFLICT (email) DO NOTHING;

-- Set up RLS policies for authenticated users
CREATE POLICY "Enable access for authenticated users only"
ON slots
FOR ALL
TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable access for authenticated users only"
ON students
FOR ALL
TO authenticated
USING (auth.role() = 'authenticated');