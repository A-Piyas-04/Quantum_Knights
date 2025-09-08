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
        
        // Movement and input state
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false
        };
        this.moveSpeed = 0.3;
        this.isAttacking = false;
        this.attackDuration = 500; // milliseconds
        
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
        
        // Setup keyboard controls
        this.setupKeyboardControls();
        
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
        
        // Update character movement
        this.updateCharacterMovement();
        
        // Update camera to follow character
        this.updateCameraFollow();
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    setupKeyboardControls() {
        // Keyboard event listeners
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'KeyW':
                    this.keys.w = true;
                    break;
                case 'KeyA':
                    this.keys.a = true;
                    break;
                case 'KeyS':
                    this.keys.s = true;
                    break;
                case 'KeyD':
                    this.keys.d = true;
                    break;
                case 'Space':
                    event.preventDefault();
                    this.keys.space = true;
                    this.handleAttack();
                    break;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            switch(event.code) {
                case 'KeyW':
                    this.keys.w = false;
                    break;
                case 'KeyA':
                    this.keys.a = false;
                    break;
                case 'KeyS':
                    this.keys.s = false;
                    break;
                case 'KeyD':
                    this.keys.d = false;
                    break;
                case 'Space':
                    this.keys.space = false;
                    break;
            }
        });
    }
    
    updateCharacterMovement() {
        if (!this.character) return;
        
        let moveX = 0;
        let moveZ = 0;
        
        // Calculate movement based on pressed keys
        if (this.keys.w) moveZ -= this.moveSpeed; // Forward
        if (this.keys.s) moveZ += this.moveSpeed; // Backward
        if (this.keys.a) moveX -= this.moveSpeed; // Left
        if (this.keys.d) moveX += this.moveSpeed; // Right
        
        // Apply movement to character
        if (moveX !== 0 || moveZ !== 0) {
            this.character.position.x += moveX;
            this.character.position.z += moveZ;
            
            // Keep character within terrain bounds (200x200 terrain)
            this.character.position.x = Math.max(-90, Math.min(90, this.character.position.x));
            this.character.position.z = Math.max(-90, Math.min(90, this.character.position.z));
            
            // Rotate character to face movement direction
            if (moveX !== 0 || moveZ !== 0) {
                const angle = Math.atan2(moveX, moveZ);
                this.character.rotation.y = angle;
            }
        }
    }
    
    updateCameraFollow() {
        if (!this.character) return;
        
        // Camera follows slightly behind the character
        const offset = new THREE.Vector3(0, 15, 20);
        const desiredPosition = this.character.position.clone().add(offset);
        
        // Smooth camera movement
        this.camera.position.lerp(desiredPosition, 0.05);
        
        // Look at character
        const lookAtTarget = this.character.position.clone();
        lookAtTarget.y += 2; // Look slightly above character
        this.camera.lookAt(lookAtTarget);
    }
    
    handleAttack() {
        if (!this.character || this.isAttacking) return;
        
        this.isAttacking = true;
        console.log('Attacking!');
        
        // Store original scale and material
        const originalScale = this.character.scale.clone();
        const originalMaterials = new Map();
        
        // Store original materials and change to red for attack
        this.character.traverse((child) => {
            if (child.isMesh && child.material) {
                originalMaterials.set(child, child.material.clone());
                child.material = child.material.clone();
                child.material.color.setHex(0xff0000); // Red color for attack
            }
        });
        
        // Scale animation
        const scaleUp = () => {
            this.character.scale.multiplyScalar(1.3);
        };
        
        const scaleDown = () => {
            this.character.scale.copy(originalScale);
            
            // Restore original materials
            this.character.traverse((child) => {
                if (child.isMesh && originalMaterials.has(child)) {
                    child.material = originalMaterials.get(child);
                }
            });
            
            this.isAttacking = false;
        };
        
        // Execute attack animation
        scaleUp();
        setTimeout(scaleDown, this.attackDuration);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuantumKnightsApp();
});

export default QuantumKnightsApp;