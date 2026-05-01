-- Crear extensión si se necesita (Supabase ya lo tiene en general)
-- EXTENSION "uuid-ossp";

-- 1. Crear la tabla principal de mascotas con soporte médico avanzado
CREATE TABLE public.pets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    animal_type TEXT NOT NULL,
    breed TEXT,
    age TEXT,
    chip_number TEXT,
    photo_url TEXT,
    medical_conditions TEXT,
    surgeries TEXT,
    deworming TEXT,
    additional_notes TEXT,
    medical_documents JSONB DEFAULT '[]'::JSONB, -- Array de URLs o metadata de archivos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar la seguridad a nivel de filas (RLS)
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acceso (Solo el dueño de la mascota puede ver o modificar su data)
CREATE POLICY "Dueños pueden ver sus propias mascotas" 
  ON public.pets FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Dueños pueden insertar sus mascotas" 
  ON public.pets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Dueños pueden actualizar sus mascotas" 
  ON public.pets FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Dueños pueden borrar sus mascotas" 
  ON public.pets FOR DELETE 
  USING (auth.uid() = user_id);

-- 4. Creación del Storage para guardar imágenes y archivos veterinarios.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pets', 'pets', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Políticas de almacenamiento de Storage
CREATE POLICY "Acceso público de visualización de archivos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'pets');

CREATE POLICY "Usuarios autenticados pueden subir archivos" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'pets' AND auth.role() = 'authenticated');

CREATE POLICY "Usuarios pueden actualizar archivos" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'pets' AND auth.role() = 'authenticated');

CREATE POLICY "Usuarios pueden borrar archivos" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'pets' AND auth.role() = 'authenticated');
