/**
 * Character Module
 * Loads and configures 3D character models using GLTFLoader
 */

export function loadCharacter(scene, onLoadCallback) {
    // Create GLTF loader
    const loader = new THREE.GLTFLoader();
    
    // Model URL from ReadyPlayer.me
    const modelUrl = 'https://models.readyplayer.me/64f90f7c1b2ff7a1f0e58f8b.glb';
    
    // Load the character model
    loader.load(
        modelUrl,
        // onLoad callback
        function(gltf) {
            const character = gltf.scene;
            
            // Scale down the character to fit the scene
            character.scale.set(1.2, 1.2, 1.2);
            
            // Position the character above the terrain surface
            // Since terrain now has height variation, position character higher
            character.position.set(0, 3, 0);
            
            // Ensure the character casts and receives shadows
            character.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Ensure materials work well with lighting
                    if (child.material) {
                        child.material.needsUpdate = true;
                    }
                }
            });
            
            // Add character to scene
            scene.add(character);
            
            console.log('Character loaded successfully!');
            
            // Call the callback if provided
            if (onLoadCallback) {
                onLoadCallback(character);
            }
        },
        // onProgress callback
        function(progress) {
            const percentComplete = (progress.loaded / progress.total) * 100;
            console.log(`Loading character: ${Math.round(percentComplete)}%`);
        },
        // onError callback
        function(error) {
            console.error('Error loading character model:', error);
            
            // Create a fallback simple character (cube) if model fails to load
            const fallbackGeometry = new THREE.BoxGeometry(1, 2, 0.5);
            const fallbackMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const fallbackCharacter = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
            
            fallbackCharacter.position.set(0, 3, 0);
            fallbackCharacter.castShadow = true;
            fallbackCharacter.receiveShadow = true;
            
            scene.add(fallbackCharacter);
            console.log('Fallback character created due to loading error.');
            
            if (onLoadCallback) {
                onLoadCallback(fallbackCharacter);
            }
        }
    );
}

export default loadCharacter;