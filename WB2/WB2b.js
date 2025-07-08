/**
 * Written by Colin Price, 2/14/2025
 */
// make vscode happy :))))
// @ts-check
/* jshint -W069, -W141, esversion:6 */

export { };
/** @type {HTMLCanvasElement} */ let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas2"));
let context = canvas.getContext("2d") || (() => { throw new Error("context didn't work"); })(); // null check errors go bye bye

// Array of fireworks
let fireworks = [];
// New global array for all trail particles
let allTrailParticles = [];

// Time tracking for delta time
let lastTime = 0;

// Constants for explosion particles
const NUM_INITIAL_EXPLOSION_PARTICLES = 100; // Number of leading particles per explosion
const LEADING_PARTICLE_LIFE_SEC = 2.5;      // Lifespan of a leading particle
const TRAIL_PARTICLE_LIFE_SEC = 1.0;        // Lifespan of a stationary trail segment
const TRAIL_SPAWN_INTERVAL_SEC = 0.05;     // How often a leader drops a trail segment

const LEADING_PARTICLE_SPEED_MIN_PER_SEC = 100; 
const LEADING_PARTICLE_SPEED_MAX_PER_SEC = 350; 
const LEADING_PARTICLE_SIZE_MIN = 2; 
const LEADING_PARTICLE_SIZE_MAX = 6;
const TRAIL_PARTICLE_SIZE_FACTOR = 0.7; // Trail particles are this factor of leader's size

const PROJECTILE_INITIAL_SPEED_PER_SEC = 700; // Speed of the firework projectile in pixels per second 
const PROJECTILE_RADIUS = 3; 

const PROJECTILE_DAMPING_PER_SEC = .5;  // Damping for projectile speed
const LEADING_PARTICLE_DAMPING_PER_SEC = .1; // Damping for leading particles

const NEW_FIREWORK_CHANCE_PER_SECOND = .5; // Chance to spawn a new firework each second 
const EXPLOSION_DISTANCE_THRESHOLD = 20; // Adjusted for more reliable explosion

const GRAVITY_ACCELERATION_PER_SEC_SQ = 70; // Pixels per second squared for gravity 
const MAX_EXPLOSION_PARTICLE_TRAVEL_DISTANCE = 1000; // Max distance a particle can travel from explosion origin
const MAX_EXPLOSION_PARTICLE_TRAVEL_DISTANCE_SQ = MAX_EXPLOSION_PARTICLE_TRAVEL_DISTANCE * MAX_EXPLOSION_PARTICLE_TRAVEL_DISTANCE; // Squared for efficiency

/**
 * Creates an array of "leading" particles for a firework explosion.
 * These particles move and spawn trail segments.
 * @param {number} explosionX - The x coord of the explosion center
 * @param {number} explosionY - The y coord of the explosion center
 * @param {string} color - The base color for the particles
 * @returns {object[]} An array of leading particle objects
 */
function createExplosionLeadingParticles(explosionX, explosionY, color = getRandomColor()) {
    let leadingParticles = [];
    for (let i = 0; i < NUM_INITIAL_EXPLOSION_PARTICLES; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (LEADING_PARTICLE_SPEED_MAX_PER_SEC - LEADING_PARTICLE_SPEED_MIN_PER_SEC) + LEADING_PARTICLE_SPEED_MIN_PER_SEC; 
        
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;
        
        const size = Math.random() * (LEADING_PARTICLE_SIZE_MAX - LEADING_PARTICLE_SIZE_MIN) + LEADING_PARTICLE_SIZE_MIN;

        leadingParticles.push({
            x: explosionX,
            y: explosionY,
            velocityX: velocityX,
            velocityY: velocityY,
            life: LEADING_PARTICLE_LIFE_SEC,
            initialLife: LEADING_PARTICLE_LIFE_SEC, // Store initial life for alpha calculation
            alpha: 1.0,
            size: size,
            color: color,
            timeSinceLastTrailSpawn: 0
        });
    }
    return leadingParticles;
}

/**
 * Creates a new firework projectile object.
 * @param {number} targetX The x-coordinate the firework should travel towards.
 * @param {number} targetY The y-coordinate the firework should travel towards.
 * @returns {object} A firework projectile object.
 */
function createFireworkProjectile(targetX, targetY) {
    const startX = canvas.width / 2;
    const startY = canvas.height;
    const angle = Math.atan2(targetY - startY, targetX - startX);
    
    return {
        x: startX,
        y: startY,
        velocityX: Math.cos(angle) * PROJECTILE_INITIAL_SPEED_PER_SEC, // Use speed per second
        velocityY: Math.sin(angle) * PROJECTILE_INITIAL_SPEED_PER_SEC, // Use speed per second
        targetX: targetX,
        targetY: targetY,
        exploded: false,
        color: getRandomColor(),
        radius: PROJECTILE_RADIUS,
        particles: [],
        // explosionOriginX and explosionOriginY will be set upon explosion
    };
}

/**
 * Get a random color in rgb format!!!!!
 * @returns {string} A random color in rgb format
 */
function getRandomColor() {
    // Each channel from 150 to 255 to ensure brightness and vibrancy
    const r = Math.floor(Math.random() * 106 + 150); // Range 150-255
    const g = Math.floor(Math.random() * 106 + 150); // Range 150-255
    const b = Math.floor(Math.random() * 106 + 150); // Range 150-255
    return `rgb(${r}, ${g}, ${b})`; // return the random color in rgb format :DDD
}

/**
 * Update a firework!!!
 * If it hasn't exploded, move it toward click pos
 * Once it reaches the target (or gets close enough), mark as exploded and generate particles
 * If it has exploded, update its particles!!!
 * @param {object} firework - The firework object
 * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
 */
function updateFirework(firework, deltaTime) {
    if (!firework.exploded) {
        // Apply gravity
        firework.velocityY += GRAVITY_ACCELERATION_PER_SEC_SQ * deltaTime;

        // Move the firework toward the click pos
        firework.x += firework.velocityX * deltaTime;
        firework.y += firework.velocityY * deltaTime;
        
        const projectileDampingMultiplier = Math.pow(PROJECTILE_DAMPING_PER_SEC, deltaTime);
        firework.velocityX *= projectileDampingMultiplier;
        firework.velocityY *= projectileDampingMultiplier;

        let dx = firework.targetX - firework.x;
        let dy = firework.targetY - firework.y;
        if (Math.sqrt(dx * dx + dy * dy) < EXPLOSION_DISTANCE_THRESHOLD || firework.y < firework.targetY && firework.velocityY > 0) { // Explode if near target or passed apex aiming high
            firework.exploded = true;
            firework.explosionOriginX = firework.x; // Store explosion origin
            firework.explosionOriginY = firework.y;
            // Create leading particles for the explosion
            firework.particles = createExplosionLeadingParticles(firework.explosionOriginX, firework.explosionOriginY, firework.color);
        }
    } else if (firework.particles) { // Update leading particles
        for (let i = firework.particles.length - 1; i >= 0; i--) {
            let p = firework.particles[i];
            
            // Apply gravity to leading particles
            p.velocityY += GRAVITY_ACCELERATION_PER_SEC_SQ * deltaTime;

            p.x += p.velocityX * deltaTime;
            p.y += p.velocityY * deltaTime;

            const dampingMultiplier = Math.pow(LEADING_PARTICLE_DAMPING_PER_SEC, deltaTime);
            p.velocityX *= dampingMultiplier;
            p.velocityY *= dampingMultiplier;
            
            p.life -= deltaTime;

            // Check distance from explosion origin for culling
            // Ensure explosionOriginX/Y are defined (they should be if firework.particles exists)
            if (firework.explosionOriginX !== undefined && firework.explosionOriginY !== undefined) {
                const dxOrigin = p.x - firework.explosionOriginX;
                const dyOrigin = p.y - firework.explosionOriginY;
                const distSqFromOrigin = dxOrigin * dxOrigin + dyOrigin * dyOrigin;
                if (distSqFromOrigin > MAX_EXPLOSION_PARTICLE_TRAVEL_DISTANCE_SQ) {
                    p.life = 0; // Mark for removal / fade out
                }
            }
            
            p.alpha = Math.max(0, p.life / p.initialLife);

            // Spawn trail particles
            p.timeSinceLastTrailSpawn += deltaTime;
            if (p.timeSinceLastTrailSpawn >= TRAIL_SPAWN_INTERVAL_SEC) {
                allTrailParticles.push({
                    x: p.x,
                    y: p.y,
                    life: TRAIL_PARTICLE_LIFE_SEC,
                    initialLife: TRAIL_PARTICLE_LIFE_SEC,
                    _spawnAlpha: p.alpha, // Store leader's alpha at spawn
                    alpha: p.alpha,       // Initial alpha is leader's current alpha
                    size: p.size * TRAIL_PARTICLE_SIZE_FACTOR,
                    color: p.color
                });
                p.timeSinceLastTrailSpawn = 0;
            }

            if (p.life <= 0 || p.alpha <= 0.01) {
                firework.particles.splice(i, 1);
            }
        }
    }
}

/**
 * Updates all trail particles.
 * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
 */
function updateTrailParticles(deltaTime) {
    for (let i = allTrailParticles.length - 1; i >= 0; i--) {
        let tp = allTrailParticles[i];
        tp.life -= deltaTime;
        // Alpha fades from its _spawnAlpha down to 0 over its lifetime
        tp.alpha = Math.max(0, tp._spawnAlpha * (tp.life / tp.initialLife));

        if (tp.life <= 0 || tp.alpha <= 0.01) {
            allTrailParticles.splice(i, 1);
        }
    }
}

/**
 * Draws a firework :DDDD
 * If it hasn't exploded, it draws the firework as a circle!
 * If it has exploded, it draws all of its explosion particles as squares woahhh
 * @param {object} firework - The firework object
 * @param {CanvasRenderingContext2D} context - The canvas drawing context
 */
function drawFirework(firework, context) {
    if (!firework.exploded) {
        context.beginPath();
        context.arc(firework.x, firework.y, firework.radius, 0, Math.PI * 2);
        context.fillStyle = firework.color;
        context.fill();
    } else if (firework.particles) { // Draw leading particles
        firework.particles.forEach(function (particle) {
            context.save();
            context.globalAlpha = particle.alpha; 
            context.fillStyle = particle.color;
            context.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
            context.restore();
        });
    }
}

/**
 * Draws all trail particles.
 * @param {CanvasRenderingContext2D} context - The canvas drawing context
 */
function drawTrailParticles(context) {
    allTrailParticles.forEach(function (particle) {
        context.save();
        context.globalAlpha = particle.alpha; 
        context.fillStyle = particle.color;
        context.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
        context.restore();
    });
}

/**
 * Main animation loop dudeeee
 * This shiii clears the canvas, updates and draws all fireworks, then schedules the next frame
 */
function animate(currentTime) { // Parameter should be currentTime (timestamp from requestAnimationFrame)
    // currentTime is provided by requestAnimationFrame
    if (lastTime === 0) { // Initialize lastTime on the first frame
        lastTime = currentTime;
    }
    const deltaTimeSeconds = (currentTime - lastTime) / 1000; // Convert ms to seconds
    lastTime = currentTime;


    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw each firework (and their leading particles)
    fireworks.forEach(function (firework) {
        updateFirework(firework, deltaTimeSeconds); 
        drawFirework(firework, context);
    });

    // Update and draw all trail particles
    updateTrailParticles(deltaTimeSeconds);
    drawTrailParticles(context);

    // Remove fireworks whose explosion is complete (all leading particles are gone)
    fireworks = fireworks.filter(function (firework) {
        if (!firework.exploded) return true; // Keep if not exploded yet
        // If exploded, keep if it still has leading particles
        return firework.particles && firework.particles.length > 0; 
    });
    
    // Add a new firework randomly with small chance per frame :DDDDD
    if (Math.random() < NEW_FIREWORK_CHANCE_PER_SECOND * deltaTimeSeconds) { // Chance scaled by deltaTime
        const targetX = Math.random() * canvas.width;
        // Aim for the upper half of the canvas to go "further".
        const targetY = Math.random() * (canvas.height / 2); // Targets higher up
        const newFirework = createFireworkProjectile(targetX, targetY); // Use the new projectile function
        fireworks.push(newFirework);
    }
    window.requestAnimationFrame(animate);
}
// Initialize lastTime before the first call to animate to avoid a large initial deltaTime
lastTime = performance.now(); 
animate(lastTime); // Start the animation loop, passing initial time

/**
 * When the user clicks the canvas, create a new firework at click pos
 */
canvas.onclick = function (event) {
    const rect = canvas.getBoundingClientRect();
    const targetX = event.clientX - rect.left;
    const targetY = event.clientY - rect.top;
    const newFirework = createFireworkProjectile(targetX, targetY); // Use the new projectile function
    fireworks.push(newFirework);
};