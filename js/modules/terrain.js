/**
 * Terrain Module
 * Creates a university campus-like terrain with flat green ground, roads, and lake
 */

export function createTerrain() {
    // Create larger flat plane geometry for bigger campus ground
    const terrainGeometry = new THREE.PlaneGeometry(500, 500, 128, 128);
    
    // Keep terrain flat (no height variation for campus)
    // Create campus grass material with brighter green
    const grassMaterial = new THREE.MeshLambertMaterial({
        color: 0x99ff99, // Lighter campus green
        side: THREE.DoubleSide,
        wireframe: false
    });
    
    // Create the main terrain mesh
    const terrain = new THREE.Mesh(terrainGeometry, grassMaterial);
    
    // Rotate the plane to be horizontal (ground)
    terrain.rotation.x = -Math.PI / 2;
    
    // Position the terrain at ground level
    terrain.position.y = 0;
    
    // Enable shadow receiving
    terrain.receiveShadow = true;

    // Create a group to hold terrain and all campus elements
    const terrainGroup = new THREE.Group();
    terrainGroup.add(terrain);

    // Add campus roads and paths
    addCampusRoads(terrainGroup);

    // Add building areas (marked zones)
    addBuildingAreas(terrainGroup);

    // Add a large artificial lake
    addCampusLake(terrainGroup);

    return terrainGroup;
}

// Function to add campus roads and pathways
function addCampusRoads(terrainGroup) {
    // Main road running north-south (scaled for bigger terrain)
    const mainRoadGeometry = new THREE.PlaneGeometry(22, 400); // Increased width
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });
    const mainRoad = new THREE.Mesh(mainRoadGeometry, roadMaterial);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.05, 0);
    mainRoad.receiveShadow = true;
    terrainGroup.add(mainRoad);
    // Cross road running east-west (scaled for bigger terrain)
    const crossRoadGeometry = new THREE.PlaneGeometry(400, 22); // Increased width
    const crossRoad = new THREE.Mesh(crossRoadGeometry, roadMaterial);
    crossRoad.rotation.x = -Math.PI / 2;
    crossRoad.position.set(0, 0.05, 0);
    crossRoad.receiveShadow = true;
    terrainGroup.add(crossRoad);
    
    // Campus pathways (smaller paths)
    const pathMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 }); // Brown paths
    
    // Path to lake area (adjusted for bigger terrain)
    const lakePathGeometry = new THREE.PlaneGeometry(6, 120);
    const lakePath = new THREE.Mesh(lakePathGeometry, pathMaterial);
    lakePath.rotation.x = -Math.PI / 2;
    lakePath.position.set(100, 0.03, -60);
    lakePath.receiveShadow = true;
    terrainGroup.add(lakePath);
    
    // Circular path around central area (bigger for larger terrain)
    const circularPathGeometry = new THREE.RingGeometry(40, 43, 32);
    const circularPath = new THREE.Mesh(circularPathGeometry, pathMaterial);
    circularPath.rotation.x = -Math.PI / 2;
    circularPath.position.set(0, 0.03, 0);
    circularPath.receiveShadow = true;
    terrainGroup.add(circularPath);
}

// Function to add building areas (marked zones for future buildings)
function addBuildingAreas(terrainGroup) {
    const buildingAreaMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8B7D6B, // Light brown for building foundations
        transparent: true,
        opacity: 0.7
    });
    
    // Academic building area 1 (adjusted for bigger terrain)
    const academicArea1 = new THREE.PlaneGeometry(40, 30);
    const academic1 = new THREE.Mesh(academicArea1, buildingAreaMaterial);
    academic1.rotation.x = -Math.PI / 2;
    academic1.position.set(-100, 0.02, 80);
    academic1.receiveShadow = true;
    terrainGroup.add(academic1);
    
    // Academic building area 2 (adjusted for bigger terrain)
    const academicArea2 = new THREE.PlaneGeometry(35, 35);
    const academic2 = new THREE.Mesh(academicArea2, buildingAreaMaterial);
    academic2.rotation.x = -Math.PI / 2;
    academic2.position.set(80, 0.02, 100);
    academic2.receiveShadow = true;
    terrainGroup.add(academic2);
    
    // Library area (adjusted for bigger terrain)
    const libraryArea = new THREE.PlaneGeometry(45, 35);
    const library = new THREE.Mesh(libraryArea, buildingAreaMaterial);
    library.rotation.x = -Math.PI / 2;
    library.position.set(-80, 0.02, -100);
    library.receiveShadow = true;
    terrainGroup.add(library);
    
    // Student center area (adjusted for bigger terrain)
    const studentCenterArea = new THREE.PlaneGeometry(50, 40);
    const studentCenter = new THREE.Mesh(studentCenterArea, buildingAreaMaterial);
    studentCenter.rotation.x = -Math.PI / 2;
    studentCenter.position.set(120, 0.02, -50);
    studentCenter.receiveShadow = true;
    terrainGroup.add(studentCenter);
}

// Function to add a large artificial campus lake
function addCampusLake(terrainGroup) {
    // Make the main lake 5x larger
    const mainLakeGeometry = new THREE.CircleGeometry(35 * 5, 64);
    const lakeMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x1E90FF, // Deep sky blue
        transparent: true,
        opacity: 0.8
    });
    const mainLake = new THREE.Mesh(mainLakeGeometry, lakeMaterial);
    mainLake.rotation.x = -Math.PI / 2;
    mainLake.position.set(130, 0.1, -130);
    mainLake.receiveShadow = true;
    terrainGroup.add(mainLake);
    // Add platform over the lake (circular wooden platform)
    const platformGeometry = new THREE.CylinderGeometry(18, 18, 1, 48);
    const platformMaterial = new THREE.MeshLambertMaterial({ color: 0xdeb887 }); // Wood color
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(130, 1.1, -130);
    platform.rotation.x = -Math.PI / 2;
    platform.receiveShadow = true;
    terrainGroup.add(platform);
    // Add bridge model to connect shore to platform
    if (typeof THREE.GLTFLoader !== 'undefined') {
        const loader = new THREE.GLTFLoader();
        loader.load('./models/Bridge.glb', (gltf) => {
            const bridge = gltf.scene;
            bridge.scale.set(10, 10, 10);
            bridge.position.set(130, 1.2, -90); // Position between shore and platform
            bridge.rotation.y = Math.PI / 2;
            bridge.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) child.material.needsUpdate = true;
                }
            });
            terrainGroup.add(bridge);
        });
    }
    // Add smaller connected pond (optional, scale up for consistency)
    const smallPondGeometry = new THREE.CircleGeometry(20 * 5, 48);
    const smallPond = new THREE.Mesh(smallPondGeometry, lakeMaterial);
    smallPond.rotation.x = -Math.PI / 2;
    smallPond.position.set(90, 0.1, -100);
    smallPond.receiveShadow = true;
    terrainGroup.add(smallPond);
    // Lake border/shore area (scale up for larger lake)
    const shoreMaterial = new THREE.MeshLambertMaterial({ color: 0xC2B280 });
    const shoreGeometry = new THREE.RingGeometry(35 * 5, 40 * 5, 64);
    const shore = new THREE.Mesh(shoreGeometry, shoreMaterial);
    shore.rotation.x = -Math.PI / 2;
    shore.position.set(130, 0.05, -130);
    shore.receiveShadow = true;
    terrainGroup.add(shore);
}

// Helper function to get terrain height at a position (always 0 for flat campus)
function getTerrainHeight(x, z) {
    // Campus terrain is flat
    return 0;
}

// Export the getTerrainHeight function for use in other modules
export { getTerrainHeight };

export default createTerrain;