/**
 * Amplificador de Volumen - Background Service Worker
 * Copyright (c) 2025 Norberto CH <nchaquer@gmail.com>
 * Licensed under the MIT License
 */

// Service Worker (Background Script)
console.log('🔊 Amplificador de Volumen - Service Worker iniciado');

// Escuchar cuando se instala la extensión
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('✓ Extensión instalada correctamente');
    
    // Configuración inicial si es necesaria
    chrome.storage.sync.set({
      defaultVolume: 100
    });
  } else if (details.reason === 'update') {
    console.log('✓ Extensión actualizada');
  }
});

// Mantener el service worker activo si es necesario
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Aquí puedes manejar mensajes globales si los necesitas
  return true;
});
