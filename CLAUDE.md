# EnglishApp — CLAUDE.md

> Este archivo es el contexto principal del proyecto para Claude Code.
> Léelo completo antes de tocar cualquier archivo.

---

## Quién soy y qué es este proyecto

Soy Robles, estudiante de Ingeniería en Sistemas Computacionales en ITL y de Gestión de Proyectos en UVEG, León, Guanajuato. Nivel de inglés B2. En agosto de 2026 participo en un workcamp de voluntariado ambiental en el Lago Constanza, Alemania (Glocal / Vive México).

**EnglishApp** es mi herramienta personal para mejorar el inglés, construida con React + Flask, diseñada como PWA. También sirve como proyecto de portafolio para becas y entrevistas.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Flask (Python 3.11) + SQLAlchemy |
| Base de datos | SQLite (dev) → PostgreSQL (prod) |
| IA | Anthropic API (`claude-sonnet-4-20250514`) |
| Noticias | NewsAPI (newsapi.org) |
| Letras | Lyrics.ovh (gratuita, sin key) |
| Deploy | Vercel (frontend) + Render (backend) |
| Control de versiones | Git + GitHub (`Robleees`) |

---

## Estructura del proyecto

```
english-app/
├── CLAUDE.md               ← Este archivo
├── README.md
├── .env.example
├── .gitignore
│
├── frontend/               ← React + Vite
│   ├── public/
│   │   ├── manifest.json   ← PWA manifest
│   │   └── sw.js           ← Service worker
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/     ← Componentes reutilizables
│   │   │   ├── Layout/
│   │   │   ├── Flashcard/
│   │   │   ├── NewsCard/
│   │   │   └── ChatMessage/
│   │   ├── pages/          ← Una página por sección
│   │   │   ├── News.jsx
│   │   │   ├── Vocabulary.jsx
│   │   │   ├── Grammar.jsx
│   │   │   ├── Music.jsx
│   │   │   ├── Practice.jsx
│   │   │   └── Progress.jsx
│   │   ├── hooks/          ← Custom hooks
│   │   ├── services/       ← Llamadas a la API
│   │   │   └── api.js
│   │   └── store/          ← Estado global (Zustand)
│   ├── package.json
│   └── vite.config.js
│
└── backend/                ← Flask
    ├── app.py              ← Entry point
    ├── config.py
    ├── models/
    │   ├── user.py
    │   ├── vocabulary.py
    │   └── progress.py
    ├── routes/
    │   ├── news.py
    │   ├── vocabulary.py
    │   ├── grammar.py
    │   ├── music.py
    │   ├── practice.py
    │   └── progress.py
    ├── services/
    │   ├── claude_service.py   ← Toda interacción con Anthropic API
    │   ├── news_service.py
    │   └── lyrics_service.py
    ├── requirements.txt
    └── .env
```

---

## Las 6 secciones de la app

### 1. Noticias (`/news`)
- Fuente: NewsAPI — categorías: technology, sports, science, world, environment
- Cada artículo tiene botón "Analyze vocabulary" → llama a Claude
- Claude extrae 5 palabras clave con definición + ejemplo + nivel (A2–C1)
- Las palabras se pueden guardar directo al vocabulario personal
- **Categoría especial:** "Environment / Nature" para preparar vocabulario del workcamp

### 2. Vocabulario (`/vocabulary`)
- Sistema de flashcards con Spaced Repetition simple (intervalos: 1, 3, 7, 14, 30 días)
- Cada palabra: término, definición, ejemplo, origen (noticia/canción/manual), categoría, nivel
- Categorías predefinidas: General, Environment, Technology, Sports, Glocal Prep
- El usuario puede crear categorías propias
- Vista de estadísticas: palabras por nivel, por categoría, racha de repaso

### 3. Gramática (`/grammar`)
- Temas: Present Simple/Continuous/Perfect, Past Simple/Perfect, Future forms,
  Conditionals (0/1/2/3), Modal verbs, Prepositions, Articles, Passive voice
- Cada tema: explicación corta + 3 ejemplos + tabla de uso ("cuándo usarlo")
- Mini-quiz de 3 preguntas generadas por Claude según nivel del usuario
- Sección especial: "Verbos irregulares" con flashcard interactiva

### 4. Música (`/music`)
- Búsqueda por artista o canción vía Lyrics.ovh
- Modos de lectura:
  - **Explore:** letra completa, click en cualquier palabra → definición en tooltip
  - **Analyze:** Claude explica registro del idioma, expresiones idiomáticas, cultural context
- No se reproducen letras completas externamente — todo es interactivo dentro de la app

### 5. Chat de práctica (`/practice`)
- Motor: Claude API con system prompt de tutor de inglés
- Modos:
  - **Free conversation:** charla libre, corrección suave al final
  - **Roleplay — Glocal:** situaciones del workcamp (presentarse, trabajar en equipo, hablar con coordinadores, describir tareas de conservación)
  - **Grammar drill:** práctica de un tiempo verbal específico
  - **Text correction:** el usuario pega un texto y Claude lo corrige con explicaciones
- Historial de sesiones guardado en SQLite

### 6. Mi progreso (`/progress`)
- Racha de días consecutivos (streak)
- Palabras aprendidas esta semana / total
- Temas de gramática completados
- Sesiones de chat: minutos totales, temas practicados
- Gráfica simple de actividad (últimos 30 días)

---

## Reglas de desarrollo

### Git workflow
```bash
# Rama principal: main
# Ramas de feature: feature/nombre-seccion
# Ejemplo:
git checkout -b feature/vocabulary-flashcards
# Al terminar:
git add .
git commit -m "feat(vocabulary): add spaced repetition logic"
git push origin feature/vocabulary-flashcards
# Luego merge a main via PR en GitHub
```

### Convenciones de commits (Conventional Commits)
```
feat(section): descripción corta
fix(section): qué se corrigió
refactor(section): cambio sin nueva funcionalidad
docs: actualización de documentación
chore: configs, dependencias
```

### Variables de entorno — NUNCA hardcodear keys
```bash
# backend/.env (nunca al repo)
ANTHROPIC_API_KEY=sk-ant-...
NEWS_API_KEY=...
SECRET_KEY=...
DATABASE_URL=sqlite:///app.db

# frontend/.env.local (nunca al repo)
VITE_API_BASE_URL=http://localhost:5000
```

### Estilo de código
- Python: snake_case, docstrings en funciones públicas, type hints donde sea posible
- React/JS: camelCase, componentes en PascalCase
- Tailwind: utility-first, extraer clases repetidas a componentes
- No CSS inline salvo casos excepcionales

---

## Servicios externos — límites importantes

| Servicio | Plan gratuito | Límite |
|----------|-------------|--------|
| NewsAPI | Free | 100 req/día — cachear respuestas 1 hora |
| Lyrics.ovh | Free | Sin key, rate limit informal |
| Anthropic API | Pay per use | Usar `claude-haiku-4-5` para drafts, `claude-sonnet-4-20250514` para features finales |
| Render (backend) | Free tier | Se duerme tras 15 min inactividad — mostrar loading apropiado |

---

## Contexto personal importante para los agentes

- **Objetivo inmediato:** mejorar inglés para workcamp en Lago Constanza, Alemania (agosto 22 – septiembre 5, 2026)
- **Vocabulario prioritario:** conservación ambiental, naturaleza, trabajo en equipo internacional, vida cotidiana en Alemania
- **Deadline de vuelo:** julio 3, 2026 — la app debe tener al menos Noticias + Vocabulario + Chat funcionando antes de esa fecha
- **Yo aprendo mientras construyo** — prefiero código explicado con comentarios clave, no código sin contexto
- **Tengo experiencia con:** Flask, React básico, SQLAlchemy, Git básico, JS vanilla
- **Estoy aprendiendo:** React avanzado (hooks, estado global), APIs REST, deploy en la nube

---

## Orden de implementación recomendado

1. **Setup:** repo GitHub, estructura de carpetas, React+Vite, Flask base, `.env`, deploy vacío
2. **Vocabulario:** modelo de datos, CRUD, flashcard component, spaced repetition
3. **Noticias:** NewsAPI integration, card component, "analyze vocabulary" con Claude
4. **Gramática:** contenido estático primero, luego quiz dinámico con Claude
5. **Chat de práctica:** Claude API integration, system prompts por modo, historial
6. **Música:** Lyrics.ovh, word tooltip, analyze mode
7. **Progreso:** stats, streak, gráfica
8. **PWA:** manifest, service worker, offline básico
9. **Pulir UI + README + deploy final**

---

## Cómo pedirme ayuda mientras trabajas

Cuando no sepas cómo continuar, dime:
- Qué sección estás implementando
- Qué ya hiciste
- Qué error específico tienes (pega el error completo)
- Qué intentaste

Prefiero entender el error antes de que lo "arregles" sin explicar qué pasó.
