/**
 * MAIN ENTRYPOINT & CONTROLLER
 * Initializes cosmic starfield with 2-second supernova and 3D face planet.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Cosmic Starfield (Gravitational pull + 2-second Supernova)
  const starfield = new CosmicStarfield('starfield-canvas');

  // 2. Initialize 3D Profile Planet (Cartesian 0,0 center, clear lighting)
  const planet = new CosmicPlanet('planet-canvas');

  // Window resize handler
  window.addEventListener('resize', () => {
    if (planet && typeof planet.onResize === 'function') {
      planet.onResize();
    }
    if (starfield && typeof starfield.resize === 'function') {
      starfield.resize();
    }
  });
});
