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

let currentTab;

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
  // Obtener la pestaña actual
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;
  
  // Cargar configuración guardada
  await loadSavedVolume();
});

// Actualizar el valor mostrado cuando se mueve el slider
volumeSlider.addEventListener('input', (e) => {
  volumeValue.textContent = e.target.value;
});

// Aplicar el volumen
applyBtn.addEventListener('click', async () => {
  const volume = parseInt(volumeSlider.value);
  
  try {
    // Enviar mensaje al content script
    await chrome.tabs.sendMessage(currentTab.id, {
      action: 'setVolume',
      volume: volume
    });
    
    // Guardar configuración si está marcada la opción
    if (rememberSite.checked) {
      await saveVolumeForSite(volume);
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
