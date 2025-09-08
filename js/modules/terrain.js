/**
 * Terrain Module
 * Creates and configures realistic ground terrain with height variation
 */

export function createTerrain() {
    // Create plane geometry with more subdivisions for detail
    const terrainGeometry = new THREE.PlaneGeometry(100, 100, 128, 128);
    
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
    
    return terrain;
}

export default createTerrain;