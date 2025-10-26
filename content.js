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
let eqFilters = []; // Filtros del ecualizador

// Inicializar el contexto de audio
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
  }
  return audioContext;
}

// Crear filtros del ecualizador
function createEqFilters(ctx) {
  const frequencies = [60, 230, 910, 4000, 14000];
  const filters = [];
  
  frequencies.forEach((freq, index) => {
    const filter = ctx.createBiquadFilter();
    
    if (index === 0) {
      filter.type = 'lowshelf'; // Primer filtro: low shelf
    } else if (index === frequencies.length - 1) {
      filter.type = 'highshelf'; // Último filtro: high shelf
    } else {
      filter.type = 'peaking'; // Filtros intermedios: peaking
    }
    
    filter.frequency.value = freq;
    filter.Q.value = 1.0;
    filter.gain.value = 0; // Inicialmente sin ganancia
    
    filters.push(filter);
  });
  
  return filters;
}

// Conectar filtros en cadena
function connectEqFilters(source, filters, destination) {
  let prevNode = source;
  
  filters.forEach(filter => {
    prevNode.connect(filter);
    prevNode = filter;
  });
  
  prevNode.connect(destination);
}

// Aplicar valores del ecualizador
function applyEqValues(filters, values) {
  filters.forEach((filter, index) => {
    filter.gain.value = values[index] || 0;
  });
}

// Aplicar amplificación a un elemento de audio/video
function applyVolumeBoost(element, volumePercent, equalizerConfig = null) {
  try {
    const ctx = initAudioContext();
    
    // Si el elemento ya está siendo procesado, solo actualizar valores
    if (mediaElements.has(element)) {
      const nodes = mediaElements.get(element);
      
      // Actualizar ganancia de volumen
      const gainValue = volumePercent / 100;
      nodes.gainNode.gain.value = gainValue;
      
      // Verificar si cambió el estado del ecualizador
      const hadEq = nodes.eqFilters !== null;
      const needsEq = equalizerConfig && equalizerConfig.enabled;
      
      // Si el estado del ecualizador cambió, necesitamos reconectar
      if (hadEq !== needsEq) {
        // Desconectar todo
        try {
          nodes.source.disconnect();
          nodes.gainNode.disconnect();
          if (nodes.eqFilters) {
            nodes.eqFilters.forEach(filter => filter.disconnect());
          }
        } catch (e) {
          console.warn('Error desconectando:', e);
        }
        
        // Reconectar con o sin EQ
        if (needsEq) {
          // Crear filtros nuevos
          nodes.eqFilters = createEqFilters(ctx);
          applyEqValues(nodes.eqFilters, equalizerConfig.values);
          connectEqFilters(nodes.source, nodes.eqFilters, nodes.gainNode);
        } else {
          // Sin ecualizador
          nodes.eqFilters = null;
          nodes.source.connect(nodes.gainNode);
        }
        
        nodes.gainNode.connect(ctx.destination);
        console.log(`🔄 Reconectado con EQ ${needsEq ? 'activado' : 'desactivado'}`);
      } else if (needsEq && nodes.eqFilters) {
        // Solo actualizar valores del EQ si está activo
        applyEqValues(nodes.eqFilters, equalizerConfig.values);
        console.log(`🎚️ Ecualizador actualizado:`, equalizerConfig.values);
      }
      
      console.log(`🔊 Volumen actualizado: ${volumePercent}%`);
      return;
    }
    
    // Elemento nuevo - crear toda la cadena de audio
    let source;
    try {
      source = ctx.createMediaElementSource(element);
    } catch (error) {
      console.warn('No se pudo crear source, puede que ya exista');
      return;
    }
    
    const elementGainNode = ctx.createGain();
    
    // Crear filtros del ecualizador si está habilitado
    let elementEqFilters = null;
    if (equalizerConfig && equalizerConfig.enabled) {
      elementEqFilters = createEqFilters(ctx);
      applyEqValues(elementEqFilters, equalizerConfig.values);
      
      // Conectar: source -> eq filters -> gain -> destination
      connectEqFilters(source, elementEqFilters, elementGainNode);
    } else {
      // Sin ecualizador: source -> gain -> destination
      source.connect(elementGainNode);
    }
    
    elementGainNode.connect(ctx.destination);
    
    // Establecer el nivel de ganancia
    const gainValue = volumePercent / 100;
    elementGainNode.gain.value = gainValue;
    
    // Guardar referencia
    mediaElements.set(element, {
      source: source,
      gainNode: elementGainNode,
      eqFilters: elementEqFilters
    });
    
    console.log(`🔊 Volumen aplicado: ${volumePercent}% a nuevo elemento`, element.tagName);
    if (equalizerConfig && equalizerConfig.enabled) {
      console.log(`🎚️ Ecualizador aplicado:`, equalizerConfig.values);
    }
    
  } catch (error) {
    console.error('❌ Error al aplicar amplificación:', error);
  }
}

// Buscar y procesar todos los elementos de audio/video
function processAllMediaElements(volumePercent, equalizerConfig = null) {
  const mediaElements = document.querySelectorAll('audio, video');
  let count = 0;
  
  mediaElements.forEach(element => {
    try {
      applyVolumeBoost(element, volumePercent, equalizerConfig);
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
            const equalizerConfig = JSON.parse(sessionStorage.getItem('equalizerConfig') || '{"enabled":false}');
            applyVolumeBoost(node, volume, equalizerConfig);
          }
        }
        // Buscar dentro del nodo agregado
        const mediaElements = node.querySelectorAll?.('audio, video');
        if (mediaElements && sessionStorage.getItem('volumeBoost')) {
          const volume = parseInt(sessionStorage.getItem('volumeBoost'));
          const equalizerConfig = JSON.parse(sessionStorage.getItem('equalizerConfig') || '{"enabled":false}');
          mediaElements.forEach(el => applyVolumeBoost(el, volume, equalizerConfig));
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
    const equalizer = request.equalizer || { enabled: false };
    
    // Guardar en sessionStorage para elementos que se carguen después
    sessionStorage.setItem('volumeBoost', volume);
    sessionStorage.setItem('equalizerConfig', JSON.stringify(equalizer));
    
    // Aplicar a todos los elementos existentes
    const count = processAllMediaElements(volume, equalizer);
    
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
    const equalizerConfig = JSON.parse(sessionStorage.getItem('equalizerConfig') || '{"enabled":false}');
    setTimeout(() => {
      processAllMediaElements(parseInt(savedVolume), equalizerConfig);
    }, 500); // Pequeño delay para asegurar que todo esté cargado
  }
});
