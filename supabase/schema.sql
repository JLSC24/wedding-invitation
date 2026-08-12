-- Tabla de confirmaciones de asistencia (RSVP)
create table rsvp (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  attending text not null check (attending in ('si', 'no')),
  message text,
  submitted_at timestamptz not null default now()
);

-- Habilitar seguridad a nivel de fila (obligatorio en Supabase)
alter table rsvp enable row level security;

-- Permitir que cualquiera (el formulario público) inserte su confirmación
create policy "Cualquiera puede confirmar asistencia"
  on rsvp for insert
  to anon
  with check (true);

-- Permitir que cualquiera con el enlace lea la lista (necesario para el panel de organizadores)
create policy "Cualquiera puede leer las confirmaciones"
  on rsvp for select
  to anon
  using (true);

-- Permitir eliminar filas (lo usa el botón "Eliminar" y "Reiniciar invitados" del panel)
create policy "Cualquiera puede eliminar confirmaciones"
  on rsvp for delete
  to anon
  using (true);
