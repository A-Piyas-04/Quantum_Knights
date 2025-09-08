import { getTerrainHeight } from "./terrain.js";

/**
 * Camera Module
 * Creates and configures the perspective camera
 */

export function createCamera(character) {
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(15, 20, 25);
    camera.lookAt(0, 2, 0);
    camera.followCharacter = function() {
        if (!character) return;
        // Get character position
        const charPos = character.position;
        // Get terrain height at character position
        const terrainY = getTerrainHeight(charPos.x, charPos.z);
        // Camera stays at a fixed offset above and behind character, but view is stabilized to terrain
        camera.position.x = charPos.x + 15;
        camera.position.y = terrainY + 20;
        camera.position.z = charPos.z + 25;
        // Look at character, but slightly above terrain
        camera.lookAt(charPos.x, terrainY + 2, charPos.z);
    };
    return camera;
}

export default createCamera;