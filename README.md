# Sitio de la boda — Luis & Fernanda

## Estructura del proyecto

```
wedding-site/
├── index.html        Toda la estructura y el contenido de la página
├── css/
│   └── style.css      Todos los estilos
├── js/
│   └── main.js         Toda la lógica (RSVP, panel de organizadores, animaciones)
├── netlify.toml         Configuración básica para Netlify
└── README.md
```

## ⚠️ Importante antes de publicar

Este sitio guarda las confirmaciones de RSVP usando `window.storage`, una función
que **solo existe dentro del entorno de Claude**. Si subes este proyecto tal
cual a Netlify (o cualquier otro hosting), la página se verá y se navegará
perfecto, pero **el formulario de RSVP no va a guardar nada** — ni el panel de
organizadores va a poder leer confirmaciones.

Antes de publicarlo en tu dominio final, hay que reemplazar esas llamadas a
`window.storage` (están en `js/main.js`) por un backend real, como Supabase.
Cuando quieras, seguimos con ese paso.

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
