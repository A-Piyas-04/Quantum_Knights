/**
 * Terrain Module
 * Creates and configures realistic ground terrain with height variation
 */

export function createTerrain() {
    // Create plane geometry with more subdivisions for detail - made bigger
    const terrainGeometry = new THREE.PlaneGeometry(200, 200, 256, 256);
    
    // Add height variation using noise
    const vertices = terrainGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 1];
        
        // Create height variation using simple noise function
        const height = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2 +
                      Math.sin(x * 0.05) * Math.cos(z * 0.05) * 4 +
                      Math.random() * 0.5;
        
        vertices[i + 2] = height;
    }
    
    // Update geometry
    terrainGeometry.attributes.position.needsUpdate = true;
    terrainGeometry.computeVertexNormals();
    
    // Create realistic terrain material with multiple colors
    const terrainMaterial = new THREE.MeshLambertMaterial({
        color: 0x4a7c59, // More natural green
        side: THREE.DoubleSide,
        vertexColors: false,
        wireframe: false
    });
    
    // Add vertex colors based on height
    const colors = [];
    const positionAttribute = terrainGeometry.attributes.position;
    
    for (let i = 0; i < positionAttribute.count; i++) {
        const y = positionAttribute.getZ(i); // Height value
        
        // Color based on height: darker green for lower areas, lighter for higher
        if (y < -1) {
            colors.push(0.2, 0.4, 0.2); // Dark green for valleys
        } else if (y < 1) {
            colors.push(0.3, 0.6, 0.3); // Medium green for plains
        } else if (y < 3) {
            colors.push(0.4, 0.7, 0.4); // Light green for hills
        } else {
            colors.push(0.6, 0.8, 0.5); // Very light green for peaks
        }
    }
    
    terrainGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    terrainMaterial.vertexColors = true;
    
    // Create the terrain mesh
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    
    // Rotate the plane to be horizontal (ground)
    terrain.rotation.x = -Math.PI / 2;
    
    // Position the terrain at ground level
    terrain.position.y = 0;
    
    // Enable shadow receiving
    terrain.receiveShadow = true;

    // Create a group to hold terrain and all elements
    const terrainGroup = new THREE.Group();
    terrainGroup.add(terrain);

    // Add trees to the terrain
    addTrees(terrainGroup, terrainGeometry);

    // Add a mini lake
    addLake(terrainGroup);

    return terrainGroup;
}

// Function to add trees to the terrain
function addTrees(terrainGroup, terrainGeometry) {
    const treeCount = 50; // Number of trees
    
    for (let i = 0; i < treeCount; i++) {
        // Random position on terrain
        const x = (Math.random() - 0.5) * 180; // Within terrain bounds
        const z = (Math.random() - 0.5) * 180;
        
        // Get height at this position (simplified)
        const y = getTerrainHeight(x, z) + 1; // Slightly above terrain
        
        // Create tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, y + 1.5, z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        
        // Create tree foliage
        const foliageGeometry = new THREE.SphereGeometry(2, 8, 6);
        const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(x, y + 4, z);
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        
        terrainGroup.add(trunk);
        terrainGroup.add(foliage);
    }
}

// Function to add a mini lake
function addLake(terrainGroup) {
    // Create lake geometry
    const lakeGeometry = new THREE.CircleGeometry(15, 32);
    const lakeMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x4169E1,
        transparent: true,
        opacity: 0.8
    });
    const lake = new THREE.Mesh(lakeGeometry, lakeMaterial);
    
    // Position lake on terrain
    lake.rotation.x = -Math.PI / 2;
    lake.position.set(30, 0.1, -40); // Slightly above terrain to avoid z-fighting
    lake.receiveShadow = true;
    
    terrainGroup.add(lake);
}

// Helper function to get terrain height at a position
function getTerrainHeight(x, z) {
    // Simplified height calculation matching the terrain generation (without random component)
    const height = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2 +
                  Math.sin(x * 0.05) * Math.cos(z * 0.05) * 4;
    return height;
}

// Export the getTerrainHeight function for use in other modules
export { getTerrainHeight };

export default createTerrain;