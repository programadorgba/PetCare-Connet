# 🗄️ PetCare Connect — Base de Datos

> **Plataforma:** Supabase (PostgreSQL)  
> **Creada:** Mayo 2026  
> **Proyecto:** PetCare-connect  

---

## 📦 Estructura general

```
PetCare Connect — Supabase
│
├── 👤 profiles          → datos del usuario (trigger automático al registrarse)
├── 🐾 pets              → mascotas del usuario
├── 💉 vaccines          → historial de vacunas
├── 🩺 consultations     → consultas veterinarias
├── 💊 medications       → medicación activa e historial
├── ✂️  surgeries         → cirugías e intervenciones
├── 🐛 deworming         → desparasitaciones
├── ⚖️  weight_logs       → registros de peso + gráfica
├── 📄 documents         → PDFs e informes veterinarios
│
└── 📦 Storage
    ├── pets/            → fotos de mascotas (público, 5 MB)
    └── documents/       → documentos veterinarios (privado, 10 MB)
```

---

## 🔐 Seguridad

- **RLS (Row Level Security)** activado en las 9 tablas
- Cada usuario **solo accede a sus propios datos**
- El storage organizado por carpetas `{uid}/archivo`
- Bucket `pets` → público (URLs directas para fotos)
- Bucket `documents` → privado (URLs firmadas)

---

## 👤 profiles

Vinculada a `auth.users`. Se crea automáticamente al registrarse via trigger.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK — referencia a auth.users |
| `name` | TEXT | Nombre del usuario |
| `role` | TEXT | `owner` o `vet` |
| `avatar_url` | TEXT | URL foto de perfil (Google/Apple) |
| `phone` | TEXT | Teléfono de contacto |
| `created_at` | TIMESTAMPTZ | Fecha de registro |
| `updated_at` | TIMESTAMPTZ | Última actualización |

---

## 🐾 pets

Mascotas vinculadas al usuario dueño.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK generado automáticamente |
| `user_id` | UUID | FK → auth.users |
| `name` | TEXT | Nombre de la mascota |
| `animal_type` | TEXT | `dog` `cat` `bird` `rabbit` `fish` `other` |
| `breed` | TEXT | Raza |
| `age` | TEXT | Edad o fecha de nacimiento |
| `chip_number` | TEXT | Número de microchip |
| `photo_url` | TEXT | URL foto en Storage bucket `pets` |
| `medical_conditions` | TEXT | Condiciones médicas conocidas |
| `surgeries` | TEXT | Notas de cirugías |
| `deworming` | TEXT | Notas de desparasitación |
| `additional_notes` | TEXT | Notas adicionales del dueño |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

---

## 💉 vaccines

Historial de vacunas por mascota.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `pet_id` | UUID | FK → pets |
| `name` | TEXT | Nombre de la vacuna |
| `date` | DATE | Fecha de aplicación |
| `next_date` | DATE | Fecha de la próxima dosis |
| `vet` | TEXT | Nombre del veterinario |
| `batch` | TEXT | Número de lote |
| `notes` | TEXT | Observaciones |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

---

## 🩺 consultations

Historial de consultas veterinarias.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `pet_id` | UUID | FK → pets |
| `date` | DATE | Fecha de la consulta |
| `reason` | TEXT | Motivo de la consulta |
| `diagnosis` | TEXT | Diagnóstico |
| `treatment` | TEXT | Tratamiento prescrito |
| `vet` | TEXT | Nombre del veterinario |
| `notes` | TEXT | Notas adicionales |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

---

## 💊 medications

Medicación activa e historial.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `pet_id` | UUID | FK → pets |
| `name` | TEXT | Nombre del medicamento |
| `dose` | TEXT | Dosis (ej: 250mg) |
| `frequency` | TEXT | Frecuencia (ej: cada 12h) |
| `start_date` | DATE | Fecha de inicio |
| `end_date` | DATE | Fecha de fin (null = sin fecha fin) |
| `active` | BOOLEAN | true = en curso |
| `vet` | TEXT | Veterinario que lo prescribió |
| `notes` | TEXT | Observaciones |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

---

## ✂️ surgeries

Cirugías e intervenciones quirúrgicas.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `pet_id` | UUID | FK → pets |
| `name` | TEXT | Nombre de la cirugía |
| `date` | DATE | Fecha de la intervención |
| `vet` | TEXT | Cirujano/Veterinario |
| `clinic` | TEXT | Clínica o hospital |
| `notes` | TEXT | Descripción y observaciones |
| `recovery` | TEXT | Notas de recuperación |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

---

## 🐛 deworming

Desparasitaciones internas y externas.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `pet_id` | UUID | FK → pets |
| `type` | TEXT | `interna` o `externa` |
| `product` | TEXT | Nombre del producto |
| `date` | DATE | Fecha de aplicación |
| `next_date` | DATE | Próxima aplicación |
| `vet` | TEXT | Veterinario (opcional) |
| `notes` | TEXT | Observaciones |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

---

## ⚖️ weight_logs

Registros de peso para la gráfica de evolución.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `pet_id` | UUID | FK → pets |
| `weight` | DECIMAL(5,2) | Peso en kg (ej: 24.50) |
| `date` | DATE | Fecha del pesaje |
| `notes` | TEXT | Observaciones |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

---

## 📄 documents

Archivos y documentos veterinarios.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `pet_id` | UUID | FK → pets |
| `name` | TEXT | Nombre descriptivo del documento |
| `file_url` | TEXT | URL en Storage bucket `documents` |
| `file_type` | TEXT | `PDF` `JPG` `PNG` |
| `file_size` | TEXT | Tamaño legible (ej: 1.2 MB) |
| `category` | TEXT | `analitica` `radiografia` `informe` `cartilla` `otro` |
| `date` | DATE | Fecha del documento |
| `notes` | TEXT | Observaciones |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

---

## 📦 Storage

### Bucket `pets` — fotos de mascotas
- **Acceso:** Público
- **Límite:** 5 MB por archivo
- **Formatos:** `image/jpeg` `image/png` `image/webp`
- **Ruta:** `pets/{user_id}/{pet_id}.jpg`

### Bucket `documents` — documentos veterinarios
- **Acceso:** Privado (URLs firmadas)
- **Límite:** 10 MB por archivo
- **Formatos:** `application/pdf` `image/jpeg` `image/png`
- **Ruta:** `documents/{user_id}/{document_id}.pdf`

---

## 🔗 Relaciones

```
auth.users
    │
    ├──── profiles (1:1)
    │
    └──── pets (1:N)
              │
              ├──── vaccines      (1:N)
              ├──── consultations (1:N)
              ├──── medications   (1:N)
              ├──── surgeries     (1:N)
              ├──── deworming     (1:N)
              ├──── weight_logs   (1:N)
              └──── documents     (1:N)
```

---

## 📝 Notas importantes

- Todas las claves primarias son **UUID** generados automáticamente
- Todas las tablas tienen `ON DELETE CASCADE` — si se borra un usuario, se borran todas sus mascotas y datos
- El trigger `on_auth_user_created` crea el perfil automáticamente al registrarse con email, Google o Apple
- Los campos `updated_at` se actualizarán manualmente desde el frontend al editar registros