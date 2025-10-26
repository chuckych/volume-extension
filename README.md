# 🔊 Amplificador de Volumen

**Extensión de Chrome para amplificar el volumen de audio y video hasta 600% con total privacidad**

## Características

- **Control de volumen hasta 600%** - Amplifica el audio más allá del límite del navegador
- **100% Privado** - Todo el procesamiento es local, sin servidores externos
- **Recordar por sitio** - Guarda tus preferencias para cada página web
- **Rápido y ligero** - Sin impacto en el rendimiento
- **Detección automática** - Funciona con videos y audios cargados dinámicamente
- **Indicador visual del volumen** actual en el icono de la extensión

## Instalación

### Método 1: Modo Desarrollador (Recomendado para uso personal)

1. **Abre Chrome** y navega a `chrome://extensions/` o en Brave a `brave://extensions/`
2. **Activa el "Modo de desarrollador"** en la esquina superior derecha
3. **Haz clic en "Cargar extensión sin empaquetar"**
4. **Selecciona la carpeta** `extension-volumen`
5. **¡Listo!** Verás el icono 🔊 en tu barra de herramientas.
6. **Anclar la extensión:** Haz clic en el icono de puzzle 🧩 y luego en el pin 📌 junto a "Amplificador de Volumen" para tener acceso rápido en cualquier momento.

### Método 2: Crear un paquete .crx (Opcional)

```bash
# En Chrome, ve a chrome://extensions/
# Haz clic en "Empaquetar extensión"
# Selecciona la carpeta de la extensión
# Chrome generará un archivo .crx que puedes instalar
```

## Uso

1. **Abre cualquier página web** con audio o video (YouTube, Netflix, Spotify Web, etc.)
2. **Haz clic en el icono de la extensión** en la barra de herramientas
3. **Ajusta el slider** al nivel de volumen deseado (0% - 600%)
4. **Presiona "Aplicar"** para activar la amplificación
5. **Opcional:** Marca "Recordar para este sitio" para guardar la configuración

### Atajos

- **Resetear:** Vuelve al volumen normal (100%)
- **Recordar por sitio:** Guarda automáticamente tu preferencia para esa página

## Tecnología

La extensión utiliza:

- **Web Audio API** - Para el procesamiento de audio en tiempo real
- **Manifest V3** - Última versión del sistema de extensiones de Chrome
- **Chrome Storage API** - Para guardar preferencias (local, sin servidores)

## Privacidad

-  **Sin seguimiento** - No hay analytics ni telemetría
-  **Sin conexiones externas** - Todo es procesado localmente
-  **Sin recopilación de datos** - Tus preferencias se guardan solo en tu navegador
-  **Código abierto** - Puedes revisar todo el código fuente

### Permisos utilizados:

- **activeTab** - Para acceder a la pestaña actual cuando haces clic en la extensión
- **storage** - Para guardar tus preferencias de volumen por sitio

## Compatibilidad

- Google Chrome
- Microsoft Edge
- Brave Browser
- Opera
- Cualquier navegador basado en Chromium

## Solución de problemas

**La extensión no funciona en un video:**

- Asegúrate de que el video esté reproduciendo
- Intenta pausar y reproducir nuevamente después de aplicar el volumen
- Algunos sitios con protección DRM pueden no ser compatibles

**El audio suena distorsionado:**

- Reduce el nivel de amplificación
- Algunos audios de baja calidad pueden distorsionarse al amplificarse mucho

**No se guarda mi configuración:**

- Verifica que tengas marcada la opción "Recordar para este sitio"
- Los datos se guardan en Chrome Sync si tienes la sincronización activada

## Notas técnicas

### Cómo funciona:

1. La extensión inyecta un script (`content.js`) en cada página web
2. Detecta todos los elementos `<audio>` y `<video>` en la página
3. Crea un nodo de ganancia (gain node) usando Web Audio API
4. Conecta cada elemento al nodo de ganancia
5. Ajusta el nivel de ganancia según tu selección (1.0 = 100%, 6.0 = 600%)

### Limitaciones:

- No funciona con audio protegido por DRM en algunos servicios de streaming
- El audio original debe existir en la página (no puede amplificar si no hay audio)
- Algunos sitios web pueden reiniciar el audio y necesitarás reaplicar el volumen

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.

**En resumen:**

- ✅ Uso comercial permitido
- ✅ Modificación permitida
- ✅ Distribución permitida
- ✅ Uso privado permitido
- ℹ️ Se requiere incluir el aviso de copyright y licencia

## Contribuciones

Si encuentras errores o tienes ideas para mejorar la extensión, ¡eres bienvenido a modificar el código!

---

**Desarrollado para mantener tu privacidad**

*Última actualización: Octubre 2025*

<!-- Autor -->

*Desarrollado por Norberto CH - nchaquer@gmail.com*
