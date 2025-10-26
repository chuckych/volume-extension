/**
 * Amplificador de Volumen - Popup Controller
 * Copyright (c) 2025 Norberto CH <nchaquer@gmail.com>
 * Licensed under the MIT License
 */

// Elementos del DOM
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const applyBtn = document.getElementById('applyBtn');
const resetBtn = document.getElementById('resetBtn');
const status = document.getElementById('status');
const rememberSite = document.getElementById('rememberSite');
const presetBtns = document.querySelectorAll('.preset-btn');
const eqToggle = document.getElementById('eqToggle');
const eqContent = document.getElementById('eqContent');
const eqMode = document.getElementById('eqMode');
const eqSliders = document.querySelectorAll('.eq-slider');

let currentTab;

// Presets del ecualizador (valores en dB para cada banda: 60Hz, 230Hz, 910Hz, 4kHz, 14kHz)
const EQ_PRESETS = {
  normal: [0, 0, 0, 0, 0],
  voice: [-3, 0, 5, 4, -2],      // Enfatiza medios para voz
  bass: [8, 5, 0, -2, -3],       // Potencia graves
  treble: [-3, -2, 0, 5, 8],     // Potencia agudos
  cinema: [6, 2, -1, 3, 5],      // Balance cinematográfico
  rock: [5, 3, -2, 3, 5],        // Curva en V
  classical: [-1, 0, 2, 3, 2],   // Suave y detallado
  gaming: [4, 1, 2, 4, 3]        // Balance para gaming
};

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
  // Obtener la pestaña actual
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;
  
  // Cargar configuración guardada
  await loadSavedVolume();
  
  // Configurar botones de presets
  setupPresets();
  
  // Configurar ecualizador
  setupEqualizer();
});

// Actualizar el valor mostrado cuando se mueve el slider
volumeSlider.addEventListener('input', (e) => {
  volumeValue.textContent = e.target.value;
  updatePresetButtons(parseInt(e.target.value));
});

// Aplicar el volumen
applyBtn.addEventListener('click', async () => {
  const volume = parseInt(volumeSlider.value);
  
  try {
    // Obtener configuración del ecualizador si está activo
    const eqEnabled = eqToggle.checked;
    const eqValues = eqEnabled ? getEqValues() : null;
    
    // Enviar mensaje al content script
    await chrome.tabs.sendMessage(currentTab.id, {
      action: 'setVolume',
      volume: volume,
      equalizer: eqEnabled ? {
        enabled: true,
        values: eqValues
      } : { enabled: false }
    });
    
    // Guardar configuración si está marcada la opción
    if (rememberSite.checked) {
      await saveVolumeForSite(volume);
      if (eqEnabled) {
        await saveEqualizerForSite(eqMode.value, eqValues);
      }
    }
    
    // Actualizar el badge del icono
    await updateBadge(volume);
    
    showStatus(`✓ Volumen ajustado a ${volume}%`, 'success');
  } catch (error) {
    showStatus('✗ Error al aplicar el volumen', 'error');
    console.error('Error:', error);
  }
});

// Resetear al 100%
resetBtn.addEventListener('click', async () => {
  volumeSlider.value = 100;
  volumeValue.textContent = '100';
  
  try {
    await chrome.tabs.sendMessage(currentTab.id, {
      action: 'setVolume',
      volume: 100
    });
    
    // Limpiar configuración guardada si existe
    if (rememberSite.checked) {
      await chrome.storage.sync.remove(getSiteKey());
    }
    
    // Limpiar el badge del icono
    await chrome.action.setBadgeText({ text: '' });
    
    showStatus('✓ Volumen reseteado a 100%', 'success');
  } catch (error) {
    showStatus('✗ Error al resetear el volumen', 'error');
    console.error('Error:', error);
  }
});

// Mostrar mensaje de estado
function showStatus(message, type = '') {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status ' + type;
  
  if (type) {
    setTimeout(() => {
      status.className = 'status';
      status.textContent = 'Ajusta el volumen y presiona Aplicar';
    }, 2000);
  }
}

// Obtener clave única para el sitio actual
function getSiteKey() {
  try {
    const url = new URL(currentTab.url);
    return `volume_${url.hostname}`;
  } catch {
    return 'volume_default';
  }
}

// Guardar volumen para el sitio
async function saveVolumeForSite(volume) {
  const key = getSiteKey();
  await chrome.storage.sync.set({ [key]: volume });
}

// Cargar volumen guardado
async function loadSavedVolume() {
  const key = getSiteKey();
  const result = await chrome.storage.sync.get(key);
  
  if (result[key]) {
    volumeSlider.value = result[key];
    volumeValue.textContent = result[key];
    rememberSite.checked = true;
    showStatus(`Volumen guardado: ${result[key]}%`);
    // Mostrar el badge si hay volumen guardado diferente de 100%
    if (result[key] !== 100) {
      await updateBadge(result[key]);
    }
  }
}

// Actualizar el badge del icono con el nivel de volumen
async function updateBadge(volume) {
  if (volume === 100) {
    // Si es 100%, no mostrar badge
    await chrome.action.setBadgeText({ text: '' });
  } else {
    // Mostrar el porcentaje en el badge
    await chrome.action.setBadgeText({ text: `${volume}%` });
    
    // Color del badge según el nivel
    let color;
    if (volume < 100) {
      color = '#4285f4'; // Azul para volumen bajo
    } else if (volume <= 200) {
      color = '#34a853'; // Verde para volumen moderado
    } else if (volume <= 400) {
      color = '#fbbc04'; // Amarillo/naranja para volumen alto
    } else {
      color = '#ea4335'; // Rojo para volumen muy alto
    }
    
    await chrome.action.setBadgeBackgroundColor({ color: color });
  }
}

// Configurar botones de presets
function setupPresets() {
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const volume = parseInt(btn.dataset.volume);
      volumeSlider.value = volume;
      volumeValue.textContent = volume;
      updatePresetButtons(volume);
    });
  });
  
  // Actualizar botones según el valor inicial
  updatePresetButtons(parseInt(volumeSlider.value));
}

// Actualizar estado visual de los botones de preset
function updatePresetButtons(currentVolume) {
  presetBtns.forEach(btn => {
    const btnVolume = parseInt(btn.dataset.volume);
    if (btnVolume === currentVolume) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Configurar ecualizador
function setupEqualizer() {
  // Toggle del ecualizador
  eqToggle.addEventListener('change', () => {
    if (eqToggle.checked) {
      eqContent.classList.add('active');
      // Aplicar automáticamente cuando se activa
      applyCurrentSettings();
    } else {
      eqContent.classList.remove('active');
      // Aplicar automáticamente cuando se desactiva
      applyCurrentSettings();
    }
  });
  
  // Cambio de modo predefinido
  eqMode.addEventListener('change', () => {
    const mode = eqMode.value;
    const values = EQ_PRESETS[mode];
    setEqSliders(values);
    
    // Aplicar automáticamente si el EQ está activo
    if (eqToggle.checked) {
      applyCurrentSettings();
    }
  });
  
  // Listener para sliders individuales
  eqSliders.forEach(slider => {
    slider.addEventListener('input', () => {
      // Aplicar automáticamente si el EQ está activo
      if (eqToggle.checked) {
        applyCurrentSettings();
      }
    });
  });
  
  // Cargar configuración guardada del ecualizador
  loadSavedEqualizer();
}

// Aplicar configuración actual (volumen + ecualizador)
async function applyCurrentSettings() {
  const volume = parseInt(volumeSlider.value);
  const eqEnabled = eqToggle.checked;
  const eqValues = eqEnabled ? getEqValues() : null;
  
  try {
    // Enviar mensaje al content script
    await chrome.tabs.sendMessage(currentTab.id, {
      action: 'setVolume',
      volume: volume,
      equalizer: eqEnabled ? {
        enabled: true,
        values: eqValues
      } : { enabled: false }
    });
    
    // Actualizar el badge del icono
    await updateBadge(volume);
    
    console.log('✓ Configuración aplicada:', { volume, eqEnabled, eqValues });
  } catch (error) {
    console.error('Error al aplicar configuración:', error);
  }
}

// Establecer valores en los sliders del ecualizador
function setEqSliders(values) {
  eqSliders.forEach((slider, index) => {
    slider.value = values[index];
  });
}

// Obtener valores actuales del ecualizador
function getEqValues() {
  return Array.from(eqSliders).map(slider => parseFloat(slider.value));
}

// Guardar configuración del ecualizador para el sitio
async function saveEqualizerForSite(mode, values) {
  const key = getSiteKey();
  await chrome.storage.sync.set({ 
    [`eq_mode_${key}`]: mode,
    [`eq_values_${key}`]: values 
  });
}

// Cargar configuración guardada del ecualizador
async function loadSavedEqualizer() {
  const key = getSiteKey();
  const result = await chrome.storage.sync.get([`eq_mode_${key}`, `eq_values_${key}`]);
  
  if (result[`eq_mode_${key}`]) {
    eqToggle.checked = true;
    eqContent.classList.add('active');
    eqMode.value = result[`eq_mode_${key}`];
    
    if (result[`eq_values_${key}`]) {
      setEqSliders(result[`eq_values_${key}`]);
    } else {
      setEqSliders(EQ_PRESETS[result[`eq_mode_${key}`]]);
    }
  }
}
