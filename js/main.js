import { createScene } from './modules/scene.js';
import { createCamera } from './modules/camera.js';
import { createRenderer } from './modules/renderer.js';
import { createControls } from './modules/controls.js';
import { createLighting } from './modules/lighting.js';
import { createTerrain, getTerrainHeight } from './modules/terrain.js';
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
            ctrl: false,
            space: false
        };
        this.moveSpeed = 0.3;
        this.isAttacking = false;
        this.attackDuration = 500; // milliseconds
        this.projectiles = [];
        this.projectileSpeed = 1.5;
        
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
        // Remove OrbitControls for fixed camera
        // this.controls = createControls(this.camera, this.renderer.domElement); // Remove or comment out
        
        // Create lighting
        const lighting = createLighting();
        this.scene.add(lighting.directionalLight);
        this.scene.add(lighting.ambientLight);
        
        // Create terrain
        this.terrain = createTerrain();
        this.scene.add(this.terrain);
        
        // Enemy manager removed for campus environment
        
        // Load character model
        loadCharacter(this.scene, (character) => {
            this.character = character;
            // Recreate camera with character reference
            this.camera = createCamera(this.character);
            console.log('Character added to scene');
            
            // Enemies removed for peaceful campus environment
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
        // Enemy updates removed
        // Update projectiles
        this.updateProjectiles();
        // Update camera to follow character
        this.updateCameraFollow();
        // Remove controls update for fixed camera
        // this.controls.update(); // Remove or comment out
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
                case 'ControlLeft':
                case 'ControlRight':
                    this.keys.ctrl = true;
                    this.spawnProjectile();
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
                case 'ControlLeft':
                case 'ControlRight':
                    this.keys.ctrl = false;
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
        let targetAngle = null;
        // Calculate movement based on pressed keys
        if (this.keys.w) {
            moveZ -= this.moveSpeed;
            targetAngle = 0;
        }
        if (this.keys.s) {
            moveZ += this.moveSpeed;
            targetAngle = Math.PI;
        }
        if (this.keys.a) {
            moveX -= this.moveSpeed;
            targetAngle = Math.PI / 2;
        }
        if (this.keys.d) {
            moveX += this.moveSpeed;
            targetAngle = -Math.PI / 2;
        }
        // Apply movement to character
        if (moveX !== 0 || moveZ !== 0) {
            this.character.position.x += moveX;
            this.character.position.z += moveZ;
            // Keep character within terrain bounds (500x500 terrain)
            this.character.position.x = Math.max(-250, Math.min(250, this.character.position.x));
            this.character.position.z = Math.max(-250, Math.min(250, this.character.position.z));
            // Snap character to face the correct direction for single-key movement
            if (targetAngle !== null && ((this.keys.w ^ this.keys.s) || (this.keys.a ^ this.keys.d))) {
                this.character.rotation.y = targetAngle;
            } else if (moveX !== 0 && moveZ !== 0) {
                // Diagonal movement: keep smooth rotation
                const diagAngle = Math.atan2(moveX, moveZ);
                const currentAngle = this.character.rotation.y;
                const lerpSpeed = 0.15;
                let delta = diagAngle - currentAngle;
                delta = Math.atan2(Math.sin(delta), Math.cos(delta));
                this.character.rotation.y += delta * lerpSpeed;
            }
        }
        // Raycast from above character straight down to terrain
        const rayOrigin = new THREE.Vector3(this.character.position.x, 100, this.character.position.z);
        const rayDirection = new THREE.Vector3(0, -1, 0);
        const raycaster = new THREE.Raycaster(rayOrigin, rayDirection);
        const terrainMeshes = this.terrain.children.filter(obj => obj.isMesh);
        const intersects = raycaster.intersectObjects(terrainMeshes, true);
        let terrainHeight = getTerrainHeight(this.character.position.x, this.character.position.z);
        if (intersects.length > 0) {
            terrainHeight = intersects[0].point.y;
        }
        this.character.position.y = terrainHeight + 4.0;
        this.character.scale.set(3.5, 3.5, 3.5);
    }
    
    updateCameraFollow() {
        if (!this.character || !this.camera.followCharacter) return;
        this.camera.followCharacter();
    }
    
    // Enemy system removed for campus environment
    
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
    
    spawnProjectile() {
        if (!this.character) return;
        // Use GLTFLoader to load Axe.glb as projectile
        const loader = new THREE.GLTFLoader();
        loader.load('./models/Axe.glb', (gltf) => {
            const axe = gltf.scene;
            axe.scale.set(4.7, 4.7, 4.7);
            // Position axe in front of character
            const direction = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, this.character.rotation.y, 0));
            axe.position.copy(this.character.position).add(direction.clone().multiplyScalar(2.5));
            axe.userData = {
                direction,
                spawnTime: performance.now()
            };
            axe.castShadow = true;
            this.scene.add(axe);
            this.projectiles.push(axe);
        });
    }
    updateProjectiles() {
        const now = performance.now();
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.position.add(projectile.userData.direction.clone().multiplyScalar(this.projectileSpeed));
            // Remove projectile after 4 seconds or if out of bounds (updated for bigger terrain)
            const age = now - projectile.userData.spawnTime;
            if (age > 4000 ||
                Math.abs(projectile.position.x) > 260 ||
                Math.abs(projectile.position.z) > 260) {
                this.scene.remove(projectile);
                this.projectiles.splice(i, 1);
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuantumKnightsApp();
});

export default QuantumKnightsApp;