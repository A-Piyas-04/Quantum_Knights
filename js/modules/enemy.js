/**
 * Enemy Module
 * Handles enemy AI, patrolling, player detection, and following behaviors
 */

import { getTerrainHeight } from './terrain.js';

export class EnemyManager {
    constructor(scene, terrain) {
        this.scene = scene;
        this.terrain = terrain;
        this.enemies = [];
        this.detectionDistance = 15;
        this.followDistance = 20;
        this.moveSpeed = 0.1;
        this.patrolSpeed = 0.05;
        this.loader = new THREE.GLTFLoader();
    }

    // Spawn enemies at random positions on the terrain
    spawnEnemies(count = 5) {
        for (let i = 0; i < count; i++) {
            this.spawnEnemy();
        }
    }

    spawnEnemy() {
        this.loader.load('./models/Ross.glb', (gltf) => {
            const enemy = gltf.scene;
            
            // Scale and configure enemy
            enemy.scale.set(2.5, 2.5, 2.5);
            
            // Random spawn position within terrain bounds
            const x = (Math.random() - 0.5) * 160; // -80 to 80
            const z = (Math.random() - 0.5) * 160; // -80 to 80
            enemy.position.set(x, 0, z);
            
            // Configure shadows
            enemy.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            // Enemy AI state
            enemy.userData = {
                state: 'patrol', // 'patrol', 'following', 'idle'
                patrolTarget: this.generatePatrolTarget(enemy.position),
                detectedPlayer: false,
                lastPlayerPosition: null,
                patrolRadius: 20,
                originalPosition: enemy.position.clone()
            };
            
            this.scene.add(enemy);
            this.enemies.push(enemy);
            
            console.log('Enemy spawned at:', enemy.position);
        }, undefined, (error) => {
            console.error('Error loading enemy model:', error);
        });
    }

    // Generate a random patrol target within radius
    generatePatrolTarget(centerPosition) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 15 + 5; // 5-20 units from center
        
        const target = new THREE.Vector3(
            centerPosition.x + Math.cos(angle) * distance,
            0,
            centerPosition.z + Math.sin(angle) * distance
        );
        
        // Keep within terrain bounds
        target.x = Math.max(-80, Math.min(80, target.x));
        target.z = Math.max(-80, Math.min(80, target.z));
        
        return target;
    }

    // Update all enemies
    update(playerPosition) {
        this.enemies.forEach(enemy => {
            this.updateEnemyAI(enemy, playerPosition);
            this.updateEnemyPosition(enemy);
        });
    }

    // Main AI logic for each enemy
    updateEnemyAI(enemy, playerPosition) {
        if (!playerPosition) return;
        
        const distanceToPlayer = enemy.position.distanceTo(playerPosition);
        const userData = enemy.userData;
        
        // Player detection
        if (distanceToPlayer <= this.detectionDistance && !userData.detectedPlayer) {
            userData.detectedPlayer = true;
            userData.state = 'following';
            userData.lastPlayerPosition = playerPosition.clone();
            console.log('Enemy spotted!');
        }
        
        // Lose player if too far
        if (distanceToPlayer > this.followDistance && userData.detectedPlayer) {
            userData.detectedPlayer = false;
            userData.state = 'patrol';
            userData.patrolTarget = this.generatePatrolTarget(userData.originalPosition);
        }
        
        // Update behavior based on state
        switch (userData.state) {
            case 'following':
                userData.lastPlayerPosition = playerPosition.clone();
                break;
                
            case 'patrol':
                // Check if reached patrol target
                const distanceToTarget = enemy.position.distanceTo(userData.patrolTarget);
                if (distanceToTarget < 2) {
                    userData.patrolTarget = this.generatePatrolTarget(userData.originalPosition);
                }
                break;
        }
    }

    // Update enemy position and movement
    updateEnemyPosition(enemy) {
        const userData = enemy.userData;
        let targetPosition = null;
        let speed = this.patrolSpeed;
        
        // Determine target based on state
        switch (userData.state) {
            case 'following':
                targetPosition = userData.lastPlayerPosition;
                speed = this.moveSpeed;
                break;
                
            case 'patrol':
                targetPosition = userData.patrolTarget;
                speed = this.patrolSpeed;
                break;
                
            default:
                return;
        }
        
        if (!targetPosition) return;
        
        // Calculate movement direction
        const direction = new THREE.Vector3()
            .subVectors(targetPosition, enemy.position)
            .normalize();
        
        // Move enemy
        const newPosition = enemy.position.clone()
            .add(direction.multiplyScalar(speed));
        
        // Check terrain bounds
        if (Math.abs(newPosition.x) <= 80 && Math.abs(newPosition.z) <= 80) {
            enemy.position.copy(newPosition);
            
            // Rotate enemy to face movement direction
            if (direction.length() > 0.01) {
                const targetAngle = Math.atan2(direction.x, direction.z);
                enemy.rotation.y = targetAngle;
            }
        }
        
        // Update Y position based on terrain height
        this.updateEnemyHeight(enemy);
    }

    // Update enemy height to match terrain
    updateEnemyHeight(enemy) {
        // Simple terrain following - you can enhance this with raycasting
        const terrainHeight = this.getTerrainHeight(enemy.position.x, enemy.position.z);
        enemy.position.y = terrainHeight + 3.0; // Offset above terrain
    }

    // Get terrain height at position using the actual terrain function
    getTerrainHeight(x, z) {
        return getTerrainHeight(x, z);
    }

    // Remove all enemies
    clearEnemies() {
        this.enemies.forEach(enemy => {
            this.scene.remove(enemy);
        });
        this.enemies = [];
    }

    // Get all enemy positions (useful for collision detection)
    getEnemyPositions() {
        return this.enemies.map(enemy => enemy.position.clone());
    }
}

export default EnemyManager;