import { createScene } from './modules/scene.js';
import { createCamera } from './modules/camera.js';
import { createRenderer } from './modules/renderer.js';
import { createControls } from './modules/controls.js';
import { createLighting } from './modules/lighting.js';
import { createTerrain } from './modules/terrain.js';
import { loadCharacter } from './modules/character.js';

class QuantumKnightsApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.terrain = null;
        this.character = null;
        
        this.init();
    }
    
    init() {
        // Create core Three.js components
        this.scene = createScene();
        this.camera = createCamera();
        this.renderer = createRenderer();
        
        // Add renderer to DOM
        const container = document.getElementById('canvas-container');
        container.appendChild(this.renderer.domElement);
        
        // Create controls
        this.controls = createControls(this.camera, this.renderer.domElement);
        
        // Create lighting
        const lighting = createLighting();
        this.scene.add(lighting.directionalLight);
        this.scene.add(lighting.ambientLight);
        
        // Create terrain
        this.terrain = createTerrain();
        this.scene.add(this.terrain);
        
        // Load character model
        loadCharacter(this.scene, (character) => {
            this.character = character;
            console.log('Character added to scene');
        });
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Start render loop
        this.animate();
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuantumKnightsApp();
});

export default QuantumKnightsApp;