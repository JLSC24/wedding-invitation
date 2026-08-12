# Sitio de la boda — Luis & Fernanda

## Estructura del proyecto

```
wedding-site/
├── index.html        Toda la estructura y el contenido de la página
├── css/
│   └── style.css      Todos los estilos
├── js/
│   └── main.js         Toda la lógica (RSVP, panel de organizadores, animaciones)
├── supabase/
│   └── schema.sql       Script SQL para crear la tabla en Supabase
├── netlify.toml         Configuración básica para Netlify
└── README.md
```

## Base de datos (Supabase)

Las confirmaciones de RSVP se guardan en Supabase, en la tabla `rsvp`
(creada con `supabase/schema.sql`). La URL del proyecto y la llave pública
("anon key") están directamente en `js/main.js` — es normal y seguro que la
llave pública esté visible en el código del navegador, así está pensado
Supabase.

**Nota de seguridad:** el panel de organizadores solo está protegido por una
contraseña dentro del código (no por un login real). Cualquiera que
inspeccione el código y consiga tu llave pública podría, en teoría, leer o
borrar confirmaciones directamente por la API de Supabase, sin pasar por esa
contraseña. Es un nivel de protección razonable para una web de boda entre
invitados, pero no es a prueba de un usuario malicioso decidido.

## Cómo desplegarlo en Netlify

**Opción A — arrastrar y soltar (la más rápida para probar):**
1. Entra a [app.netlify.com](https://app.netlify.com) y crea una cuenta gratis.
2. En el dashboard, arrastra la carpeta `wedding-site` completa al área que dice
   "Drag and drop your site output folder here".
3. Netlify te da un enlace tipo `nombre-random.netlify.app` al instante.

**Opción B — conectado a Git (recomendada a largo plazo):**
1. Sube esta carpeta a un repositorio en GitHub.
2. En Netlify: "Add new site" → "Import an existing project" → conecta el
   repositorio.
3. Como es HTML/CSS/JS puro, no hace falta configurar ningún build command —
   déjalo vacío y el "publish directory" como `.` (ya viene definido en
   `netlify.toml`).
4. Cada vez que hagas `git push`, Netlify vuelve a publicar el sitio solo.

## Dominio propio

Una vez publicado, en el panel de Netlify: "Domain settings" → "Add a custom
domain", y sigue las instrucciones para apuntar los DNS de tu dominio.
