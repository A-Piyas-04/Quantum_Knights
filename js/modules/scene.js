/**
 * Scene Module
 * Creates and configures the main Three.js scene
 */

export function createScene() {
    const scene = new THREE.Scene();
    
    // Set background color to a nice sky blue
    scene.background = new THREE.Color(0x87CEEB);
    
    // Optional: Add fog for depth perception
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    
    return scene;
}

export default createScene;