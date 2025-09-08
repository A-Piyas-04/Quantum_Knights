/**
 * Camera Module
 * Creates and configures the perspective camera
 */

export function createCamera() {
    // Create perspective camera
    const camera = new THREE.PerspectiveCamera(
        75, // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1, // Near clipping plane
        1000 // Far clipping plane
    );
    
    // Position camera to view the terrain and character optimally
    camera.position.set(15, 20, 25);
    
    // Look at a point slightly above the terrain center to see character
    camera.lookAt(0, 2, 0);
    
    return camera;
}

export default createCamera;