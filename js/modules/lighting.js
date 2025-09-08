/**
 * Lighting Module
 * Creates and configures lighting for the scene
 */

export function createLighting() {
    const lighting = {};
    
    // Create directional light (sun)
    lighting.directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    lighting.directionalLight.position.set(20, 30, 10);
    
    // Configure shadows for larger terrain (200x200)
    lighting.directionalLight.castShadow = true;
    lighting.directionalLight.shadow.mapSize.width = 4096;
    lighting.directionalLight.shadow.mapSize.height = 4096;
    lighting.directionalLight.shadow.camera.near = 0.5;
    lighting.directionalLight.shadow.camera.far = 150;
    lighting.directionalLight.shadow.camera.left = -120;
    lighting.directionalLight.shadow.camera.right = 120;
    lighting.directionalLight.shadow.camera.top = 120;
    lighting.directionalLight.shadow.camera.bottom = -120;
    lighting.directionalLight.shadow.bias = -0.0001;
    
    // Add ambient light for overall scene illumination
    lighting.ambientLight = new THREE.AmbientLight(0x404040, 0.3); // Soft white light
    
    // Optional: Add hemisphere light for more natural lighting
    lighting.hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x228B22, 0.2);
    
    return lighting;
}

export default createLighting;