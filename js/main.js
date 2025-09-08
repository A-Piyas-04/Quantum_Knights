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
        // Add soccer field and goal
        this.loadSoccerFieldAndGoal();
        // Add U-shaped building arrangement
        this.loadUShapeBuildings();
        // Add street lights
        this.loadStreetLights();
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


    // Utility to load soccer field and goal
    loadSoccerFieldAndGoal() {
        const loader = new THREE.GLTFLoader();
        // Soccer Field
        loader.load('./models/Soccer Field.glb', (gltf) => {
            const field = gltf.scene;
            field.scale.set(15, 15, 15);
            field.position.set(-120, 0.1, 120); // Example position, adjust as needed
            field.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) child.material.needsUpdate = true;
                }
            });
            this.scene.add(field);
            // Soccer Goal 1
            loader.load('./models/Soccer goal.glb', (goalGltf) => {
                const goal1 = goalGltf.scene;
                goal1.scale.set(4, 4, 4);
                goal1.position.set(-120, 0.2, 135); // Place at one end of field
                goal1.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        if (child.material) child.material.needsUpdate = true;
                    }
                });
                this.scene.add(goal1);
                // Soccer Goal 2 (opposite end)
                loader.load('./models/Soccer goal.glb', (goalGltf2) => {
                    const goal2 = goalGltf2.scene;
                    goal2.scale.set(4, 4, 4);
                    goal2.position.set(-120, 0.2, 105); // Opposite end
                    goal2.rotation.y = Math.PI; // Face opposite direction
                    goal2.traverse(child => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            if (child.material) child.material.needsUpdate = true;
                        }
                    });
                    this.scene.add(goal2);
                });
            });
        });
    }
    // Utility to load U-shaped building arrangement
    loadUShapeBuildings() {
        const loader = new THREE.GLTFLoader();
        // Center building with door
        loader.load('./models/Building Red with Door.glb', (gltf) => {
            const centerBuilding = gltf.scene;
            centerBuilding.scale.set(6, 6, 6);
            centerBuilding.position.set(-100, 0.1, 80); // Center of academic area 1
            centerBuilding.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) child.material.needsUpdate = true;
                }
            });
            this.scene.add(centerBuilding);
            // Left wing
            loader.load('./models/Building Red.glb', (gltfLeft) => {
                const leftBuilding = gltfLeft.scene;
                leftBuilding.scale.set(6, 6, 6);
                leftBuilding.position.set(-120, 0.1, 80); // Left of center
                leftBuilding.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        if (child.material) child.material.needsUpdate = true;
                    }
                });
                this.scene.add(leftBuilding);
                // Right wing
                loader.load('./models/Building Red.glb', (gltfRight) => {
                    const rightBuilding = gltfRight.scene;
                    rightBuilding.scale.set(6, 6, 6);
                    rightBuilding.position.set(-80, 0.1, 80); // Right of center
                    rightBuilding.traverse(child => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            if (child.material) child.material.needsUpdate = true;
                        }
                    });
                    this.scene.add(rightBuilding);
                    // Top left
                    loader.load('./models/Building Red.glb', (gltfTopLeft) => {
                        const topLeftBuilding = gltfTopLeft.scene;
                        topLeftBuilding.scale.set(6, 6, 6);
                        topLeftBuilding.position.set(-120, 0.1, 100); // Top left
                        topLeftBuilding.traverse(child => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                                if (child.material) child.material.needsUpdate = true;
                            }
                        });
                        this.scene.add(topLeftBuilding);
                        // Top right
                        loader.load('./models/Building Red.glb', (gltfTopRight) => {
                            const topRightBuilding = gltfTopRight.scene;
                            topRightBuilding.scale.set(6, 6, 6);
                            topRightBuilding.position.set(-80, 0.1, 100); // Top right
                            topRightBuilding.traverse(child => {
                                if (child.isMesh) {
                                    child.castShadow = true;
                                    child.receiveShadow = true;
                                    if (child.material) child.material.needsUpdate = true;
                                }
                            });
                            this.scene.add(topRightBuilding);
                        });
                    });
                });
            });
        });
    }
    });
}

// Utility to load multiple street lights throughout the campus
loadStreetLights() {
    const loader = new THREE.GLTFLoader();
    // Example positions for street lights (can be expanded)
    const positions = [
        [-110, 0.1, 60], [-90, 0.1, 60], [-130, 0.1, 100], [-70, 0.1, 100],
        [0, 0.1, 0], [20, 0.1, 0], [-20, 0.1, 0], [0, 0.1, 20], [0, 0.1, -20],
        [100, 0.1, -120], [120, 0.1, -120], [140, 0.1, -120], [160, 0.1, -120],
        [130, 0.1, -100], [130, 0.1, -140], [80, 0.1, 100], [100, 0.1, 80],
        [-100, 0.1, -100], [-120, 0.1, -120], [120, 0.1, 120]
    ];
    positions.forEach(pos => {
        loader.load('./models/Street Light.glb', (gltf) => {
            const light = gltf.scene;
            light.scale.set(2.5, 2.5, 2.5);
            light.position.set(pos[0], pos[1], pos[2]);
            light.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) child.material.needsUpdate = true;
                }
            });
            this.scene.add(light);
        });
    });
}