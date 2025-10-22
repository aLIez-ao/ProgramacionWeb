proyecto-youtube/
│
│   package.json       # Dependencias y scripts de desarrollo
│   README.md
│   vite.config.js     # Configuración de Vite (o del bundler que uses)
│
├───node_modules/      # Dependencias (no versionar)
│
├───public/            # Archivos estáticos que se copian tal cual
│   │   favicon.ico
│   └───images/        # Logos, íconos, miniaturas
│       └── YouTube-Logo.png
│
└───src/               # Código fuente
    │
    │   index.html     # Punto de entrada
    │   style.css      # Estilos globales
    │   main.js        # JS global / inicializador
    │
    ├───components/    # Componentes reutilizables (UI)
    │   │   Header.js
    │   │   Sidebar.js
    │   │   VideoCard.js
    │   └── Footer.js
    │
    ├───pages/         # Vistas / pantallas principales
    │   │   Home.js
    │   │   VideoPage.js
    │   └── SearchResults.js
    │
    ├───assets/        # Archivos importables (imágenes, SVGs, íconos)
    │   └── logo-principal.svg
    │
    ├───services/      # Lógica para datos externos / APIs
    │   └── api.js
    │
    ├───utils/         # Funciones auxiliares (formateos, helpers)
    │   └── helpers.js
    │
    └───styles/        # Estilos modularizados por componente o tema
        │   header.css
        │   sidebar.css
        │   videoCard.css
        └── theme.css
