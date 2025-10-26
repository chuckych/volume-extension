# 📋 CHANGELOG - Amplificador de Volumen

## Versión 1.2.0 - 26 de Octubre 2025

### Nueva Característica: Ecualizador de 5 Bandas

#### 🎚️ Sistema de Ecualización

- **Ecualizador profesional de 5 bandas**:
  - 60 Hz (graves profundos)
  - 230 Hz (graves medios)
  - 910 Hz (medios)
  - 4 kHz (medios-agudos)
  - 14 kHz (agudos brillantes)

- **8 modos de ecualización predefinidos**:
  - **Normal**: Sin modificaciones de ecualización
  - **Refuerzo de Voz**: Potencia voces y claridad vocal (+5dB medios)
  - **Refuerzo de Graves**: Potencia graves para música electrónica (+8dB graves)
  - **Refuerzo de Agudos**: Potencia agudos para mayor detalle (+8dB agudos)
  - **Cine**: Optimizado para películas y diálogos
  - **Rock/Pop**: Curva en V - graves y agudos potenciados
  - **Clásica**: Equilibrado para música orquestal
  - **Gaming**: Graves para efectos + claridad de voces

- **Características del ecualizador**:
  - Ajuste manual personalizado de cada banda (-12dB a +12dB)
  - Interfaz con sliders verticales intuitivos
  - Switch para activar/desactivar ecualizador
  - **Aplicación automática en tiempo real** - Los cambios se aplican instantáneamente
  - Guardado de configuración EQ por sitio web

#### 🎯 Presets de Volumen Rápido

- **5 botones de acceso directo** con iconos visuales:
  - Bajo (50%)
  - Normal (100%)
  - Medio (200%)
  - Alto (300%)
  - Máximo (600%)

#### Mejoras de UX

- El ecualizador se aplica automáticamente al:
  - Activar/desactivar el switch
  - Cambiar de modo predefinido
  - Mover cualquier slider (si el switch está activado)
- El botón "Aplicar" es principalmente para guardar preferencias

## Versión 1.1.0 - 26 de Octubre 2025

### ✨ Lanzamiento Inicial

#### Características Principales

- Amplificación de audio hasta 600% usando Web Audio API
- Interfaz moderna con diseño de gradiente púrpura
- Control deslizante intuitivo (0% - 600%)
- Guardado de preferencias por sitio web
- Detección automática de elementos multimedia dinámicos
- Botón de reset a 100%
- Indicador visual del volumen actual

#### Privacidad y Seguridad

- 0% tracking o analytics
- 0% conexiones a servidores externos
- Procesamiento 100% local
- Solo 2 permisos mínimos (activeTab, storage)
- Código abierto y auditable

#### Tecnologías Implementadas

- Manifest V3 (última versión)
- Web Audio API con GainNode
- MutationObserver para detección dinámica
- Chrome Storage API para preferencias
- Service Worker moderno
- Content Scripts optimizados

### Compatibilidad

**Probado en:**

- Google Chrome 118+
- Microsoft Edge 118+
- Brave Browser

**Funciona con:**

- YouTube
- Vimeo
- Twitch
- SoundCloud
- Spotify Web
- Videos embebidos
- Elementos HTML5 audio/video

## 🤝 Contribuciones

Este es un proyecto personal de código abierto. Las contribuciones son bienvenidas.

### Áreas para contribuir:

- Reportar bugs
- Sugerir características
- Mejorar el diseño
- Mejorar documentación
- Añadir traducciones

---

## 📄 Licencia: MIT License

Este proyecto es software libre. Puedes usarlo, modificarlo y distribuirlo bajo los términos de la Licencia MIT.

**Última actualización:** 26 de octubre de 2025
**Versión actual:** 1.1.0
**Autor:** Norberto CH
