/**
 * Controls Module
 * Creates and configures OrbitControls for camera movement
 */

export function createControls(camera, domElement) {
    // Create OrbitControls
    const controls = new THREE.OrbitControls(camera, domElement);
    
    // Configure controls settings
    controls.enableDamping = true; // Enable smooth camera movement
    controls.dampingFactor = 0.05; // Damping factor for smooth movement
    
    // Set target to look at the center of the terrain
    controls.target.set(0, 0, 0);
    
    // Limit vertical rotation (prevent camera from going below ground)
    controls.maxPolarAngle = Math.PI / 2; // 90 degrees
    controls.minPolarAngle = 0; // 0 degrees (straight down)
    
    // Set zoom limits
    controls.minDistance = 5; // Minimum zoom distance
    controls.maxDistance = 100; // Maximum zoom distance
    
    // Enable/disable controls
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    
    // Set pan speed
    controls.panSpeed = 0.8;
    
    // Set rotation speed
    controls.rotateSpeed = 0.4;
    
    // Set zoom speed
    controls.zoomSpeed = 0.6;
    
    // Auto rotate (optional - can be enabled for demo purposes)
    controls.autoRotate = false;
    controls.autoRotateSpeed = 2.0;
    
    return controls;
}

export default createControls;