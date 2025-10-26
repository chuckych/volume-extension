/**
 * Amplificador de Volumen - Content Script
 * Copyright (c) 2025 Norberto CH <nchaquer@gmail.com>
 * Licensed under the MIT License
 */

// Content Script - Se ejecuta en cada página web
console.log('🔊 Amplificador de Volumen cargado');

// Contexto de audio para procesamiento
let audioContext;
let gainNode;
let mediaElements = new Map(); // Almacena los elementos y sus nodos de audio

// Inicializar el contexto de audio
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
  }
  return audioContext;
}

// Aplicar amplificación a un elemento de audio/video
function applyVolumeBoost(element, volumePercent) {
  try {
    // Si el elemento ya está siendo procesado, actualizar ganancia
    if (mediaElements.has(element)) {
      const nodes = mediaElements.get(element);
      const gainValue = volumePercent / 100;
      nodes.gainNode.gain.value = gainValue;
      console.log(`🔊 Volumen actualizado a ${volumePercent}% para elemento existente`);
      return;
    }
    
    // Inicializar contexto si es necesario
    const ctx = initAudioContext();
    
    // Crear nodos de audio para este elemento
    const source = ctx.createMediaElementSource(element);
    const elementGainNode = ctx.createGain();
    
    // Conectar: source -> gain -> destination
    source.connect(elementGainNode);
    elementGainNode.connect(ctx.destination);
    
    // Establecer el nivel de ganancia
    const gainValue = volumePercent / 100;
    elementGainNode.gain.value = gainValue;
    
    // Guardar referencia
    mediaElements.set(element, {
      source: source,
      gainNode: elementGainNode
    });
    
    console.log(`🔊 Volumen aplicado: ${volumePercent}% a elemento`, element.tagName);
    
  } catch (error) {
    console.error('❌ Error al aplicar amplificación:', error);
  }
}

// Buscar y procesar todos los elementos de audio/video
function processAllMediaElements(volumePercent) {
  const mediaElements = document.querySelectorAll('audio, video');
  let count = 0;
  
  mediaElements.forEach(element => {
    try {
      applyVolumeBoost(element, volumePercent);
      count++;
    } catch (error) {
      console.error('Error procesando elemento:', error);
    }
  });
  
  console.log(`✓ Procesados ${count} elementos multimedia`);
  return count;
}

// Observer para detectar nuevos elementos de audio/video agregados dinámicamente
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) { // Element node
        if (node.tagName === 'AUDIO' || node.tagName === 'VIDEO') {
          // Si hay un volumen guardado en la sesión, aplicarlo
          if (sessionStorage.getItem('volumeBoost')) {
            const volume = parseInt(sessionStorage.getItem('volumeBoost'));
            applyVolumeBoost(node, volume);
          }
        }
        // Buscar dentro del nodo agregado
        const mediaElements = node.querySelectorAll?.('audio, video');
        if (mediaElements && sessionStorage.getItem('volumeBoost')) {
          const volume = parseInt(sessionStorage.getItem('volumeBoost'));
          mediaElements.forEach(el => applyVolumeBoost(el, volume));
        }
      }
    });
  });
});

// Iniciar observación del DOM
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Escuchar mensajes desde el popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setVolume') {
    const volume = request.volume;
    
    // Guardar en sessionStorage para elementos que se carguen después
    sessionStorage.setItem('volumeBoost', volume);
    
    // Aplicar a todos los elementos existentes
    const count = processAllMediaElements(volume);
    
    sendResponse({ 
      success: true, 
      message: `Volumen ajustado a ${volume}%`,
      elementsProcessed: count
    });
  }
  
  return true; // Mantener el canal de mensajes abierto
});

// Aplicar volumen guardado al cargar la página
window.addEventListener('load', () => {
  const savedVolume = sessionStorage.getItem('volumeBoost');
  if (savedVolume) {
    setTimeout(() => {
      processAllMediaElements(parseInt(savedVolume));
    }, 500); // Pequeño delay para asegurar que todo esté cargado
  }
});
