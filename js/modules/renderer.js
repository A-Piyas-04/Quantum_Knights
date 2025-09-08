/**
 * Renderer Module
 * Creates and configures the WebGL renderer
 */

export function createRenderer() {
    // Create WebGL renderer
    const renderer = new THREE.WebGLRenderer({
        antialias: true, // Enable antialiasing for smoother edges
        alpha: true // Enable transparency
    });
    
    // Set renderer size to full window
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Set pixel ratio for high DPI displays
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Enable shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Set clear color (background)
    renderer.setClearColor(0x87CEEB, 1);
    
    // Enable gamma correction for more realistic lighting
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    
    return renderer;
}

export default createRenderer;