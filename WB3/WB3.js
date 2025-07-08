// Quadcopter Game! Created by Colin Price
// @ts-check
export {};

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
const context = canvas.getContext('2d');

// Global propeller rotation angles and speeds
let propRotTopLeft = 0;
let propRotTopRight = 0;
let propRotBottomRight = 0;
let propRotBottomLeft = 0;
const speedTopLeft = 0.05; // radians per frame
const speedTopRight = 0.07;
const speedBottomRight = 0.09;
const speedBottomLeft = 0.11;

// Global circular quadcopter orbit values
let orbitAngle = 0;
const orbitSpeed = 0.01; // radians per frame
const orbitRadius = 100; // distance from center
const circleCenterX = canvas.width * 0.75; // bottom right quadrant center 
const circleCenterY = canvas.height * 0.75;

// Global figure 8 quadcopter values
let figure8Angle = 0;
const figure8Speed = 0.01;
const amplitudeX = 90;
const amplitudeY = 60;
const fig8CenterX = canvas.width * 0.25; // bottom left quadrant center 
const fig8CenterY = canvas.height * 0.75;

// Global variables for the user-controlled quadcopter
let userQuadX = canvas.width / 2;
let userQuadY = canvas.height - 100;
let userQuadSpeed = 2; // speed in pixels per frame
let userQuadAngle = 0; // current facing angle in radians
// stores the latest known mouse coordinates if inside the canvas
let mouseX = null;
let mouseY = null;

// Global lastTime for particle fading
let lastTime = 0;

/**
 * Renders a quadcopter at a specified location.
 * The function shifts the canvas context to (x, y) and then draws the main body, arms, and propellers 
 *
 * @param {CanvasRenderingContext2D} context - The 2D context of the canvas
 * @param {number} x - The x-coordinate for the quadcopter’s center
 * @param {number} y - The y-coordinate for the quadcopter’s center
 * @param {string} [color="gray"] - The color of the quadcopter (default is "gray")
 * @param {number} [size=1] - Scale factor for the quadcopter (default is 1)
 */
function drawQuadcopter(context, x, y, color = "gray", size = 1) {
    context.save();
    context.translate(x, y);
    context.scale(size, size); 
    // Main body of the quadcopter
    context.fillStyle = color;
    context.fillRect(-20, -30, 40, 60);
    
    // Light Beam!
    context.save();
        context.translate(0, -35);
        context.beginPath();
        context.arc(0, 0, 100, 4 * Math.PI / 3, 5 * Math.PI / 3);
        context.lineTo(0, 0);
        context.closePath();
        context.globalAlpha = .2;
        context.fillStyle = "yellow";
        context.fill();
    context.restore();

    // Front of the quadcopter
    context.save();
        context.translate(0, -30);
        context.beginPath();
        context.arc(0, 0, 12, Math.PI, 0); 
        context.closePath(); 
        context.fillStyle = color;
        context.fill();
    context.restore();
    // Function for drawing each of the arms with propellers and guards
    function drawArm(context, armTx, armTy, armRotate, fillRectX, fillRectY, fillRectW, fillRectH, guardTx, guardTy, propRot) {
        context.save();
            context.translate(armTx, armTy); // arm position
            context.rotate(armRotate); // arm rotation
            context.fillRect(fillRectX, fillRectY, fillRectW, fillRectH);
            context.save();
                // Propeller guard
                context.translate(guardTx, guardTy);
                context.beginPath();
                context.arc(0, 0, 20, 0, 2 * Math.PI);
                context.strokeStyle = color;
                context.lineWidth = 5;
                context.stroke();
                // Propeller
                context.save();
                    context.rotate(propRot);
                    context.beginPath();
                    context.lineWidth = 4;
                    context.moveTo(0, 0);
                    context.lineTo(0, 15);
                    context.moveTo(0, 0);
                    context.lineTo(0, -15);
                    context.stroke();
                    // Propeller center dot
                    context.moveTo(0, 0);
                    context.beginPath();
                    context.fillStyle = "red";
                    context.arc(0, 0, 4, 0, 2 * Math.PI);
                    context.fill();
                context.restore();
            context.restore();
        context.restore();
    }

    // Arms, propeller guards, and propellers
    // Top Left
    drawArm(context, -10, -25, 3 * Math.PI / 4, 0, 0, 10, 30, 5, 50, propRotTopLeft);
    // Top Right
    drawArm(context, 10, -25, 5 * Math.PI / 4, 0, 0, -10, 30, -5, 50, propRotTopRight);
    // Bottom Right
    drawArm(context, 10, 25, 7 * Math.PI / 4, 0, 0, 10, 30, 5, 50, propRotBottomRight);
    // Bottom Left
    drawArm(context, -10, 25, Math.PI / 4, 0, 0, -10, 30, -5, 50, propRotBottomLeft);
    context.restore();
}
// Global arrays and score
const enemies = [];
const particles = [];
let score = 0;

/**
 * Spawns an enemy with random size, speed, and position at the top of the canvas
 */
function spawnEnemy() {
    const enemy = {
        x: Math.random() * canvas.width,
        y: -20,
        radius: 10 + 10 * Math.random(), // random size
        vy: 0.1 + 0.03 * Math.random(), // vertical speed
        vx: (Math.random() - 0.5) * 3, // horizontal speed
    };
    enemies.push(enemy);
}

// Call spawnEnemy every second and a half
setInterval(spawnEnemy, 1500);

/**
 * Creates an explosion effect at the given (x, y) coordinates by generating multiple particles
 *
 * @param {number} x - The x-coordinate for the explosion center
 * @param {number} y - The y-coordinate for the explosion center
 */
function createExplosion(x, y) {
    const numParticles = 30;
    for (let i = 0; i < numParticles; i++) {
        // Give each particle a random velocity and lifetime.
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            radius: 2 + Math.random() * 2,
            life: 1 // Lifetime in seconds
        });
    }
}

/**
 * Updates the positions, renders, and removes explosion particles
 * Each particle moves according to its velocity, fades out as its life decreases, 
 * and is removed when its life reaches zero
 *
 * @param {CanvasRenderingContext2D} context - The 2D drawing context of the canvas.
 */
function updateParticles(context, delta) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        // Decrease life based on time
        p.life -= delta;
        
        // Draw particle (a red circle with decreasing opacity)
        context.save();
            context.globalAlpha = Math.max(p.life, 0);
            context.fillStyle = "red";
            context.beginPath();
            context.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
            context.fill();
        context.restore();
        
        // Remove particle when its life is over
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

/**
 * Updates the positions of all enemies, draws their facial features, 
 * and removes them when they leave the canvas
 * 
 * @param {CanvasRenderingContext2D} context - The 2D drawing context of the canvas
 */
function updateEnemies(context) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += enemy.vy; 
        enemy.x += enemy.vx;
        if (enemy.x < enemy.radius || enemy.x > canvas.width - enemy.radius) {
            enemy.vx = -enemy.vx;
        }
        // Draw enemy (angry red face!!!!)
        context.save();
            context.translate(enemy.x, enemy.y);
            context.rotate(enemy.rotation);
            context.fillStyle = "red";
            context.beginPath();
            context.arc(0, 0, enemy.radius, 0, 2 * Math.PI);
            context.fill();
            // Eyes
            context.fillStyle = "black";
            context.beginPath();
            context.arc(-enemy.radius/3, -enemy.radius/3, enemy.radius/5, 0, 2*Math.PI);
            context.arc(enemy.radius/3, -enemy.radius/3, enemy.radius/5, 0, 2*Math.PI);
            context.fill();
            // Mouth
            context.beginPath();
            context.arc(0, enemy.radius/2, enemy.radius/2, 8 * Math.PI / 7, 13 * Math.PI / 7);
            context.stroke();
            // Eyebrows
            // Draw left eyebrow
            context.beginPath();
            context.moveTo(-enemy.radius/2, -enemy.radius/1.2);
            context.lineTo(-enemy.radius/10, -enemy.radius/1.5);
            context.stroke();
            // Draw right eyebrow
            context.beginPath();
            context.moveTo(enemy.radius/10, -enemy.radius/1.5);
            context.lineTo(enemy.radius/2, -enemy.radius/1.2)
            context.stroke();
        context.restore();

        // Remove enemy if it leaves the bottom of the canvas
        if (enemy.y - enemy.radius > canvas.height) {
            enemies.splice(i, 1);
        }
    }
}

/**
 * Determines whether a projectile is colliding with an enemy
 * Calculates Euclidean distance between the center of the projectile and the enemy
 * If the distance is less than the enemy's radius, then a collision is assumed
 *
 * @param {Object} projectile - The projectile object with numeric properties x and y
 * @param {Object} enemy - The enemy object with numeric properties x, y and a collision radius (enemy.radius)
 * @returns {boolean} - True if the projectile is colliding with the enemy, otherwise false
 */
function isColliding(projectile, enemy) {
    const dx = projectile.x - enemy.x;
    const dy = projectile.y - enemy.y;
    return Math.sqrt(dx * dx + dy * dy) < enemy.radius;
}

//-------------- Event listeners --------------//
// Track keys pressed (w, a, s, d)
const keysPressed = {};
window.addEventListener('keydown', (e) => {
    keysPressed[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
    keysPressed[e.key.toLowerCase()] = false;
});

// Update mouse position when it moves over the canvas
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// Clear mouse position if it leaves the canvas (so last angle persists)
canvas.addEventListener('mouseleave', () => {
    mouseX = null;
    mouseY = null;
});

// Global array to hold the projectiles
const projectiles = [];

// On click, create a new projectile from the front of the user quadcopter
canvas.addEventListener('click', (e) => {
    // Determine the front point in local coordinates
    // New X position: x' = x * cos(theta) - y * sin(theta)
    // New Y position: y' = x * sin(theta) + y * cos(theta)
    // Initial point is (0, -35), so plug in and simplify
    const frontOffsetX = 35 * Math.sin(userQuadAngle);
    const frontOffsetY = -35 * Math.cos(userQuadAngle);
    const startX = userQuadX + frontOffsetX;
    const startY = userQuadY + frontOffsetY;
    
    // Projectile speed in pixels per frame
    const projectileSpeed = 5;
    // The velocity is in the same direction as the front, so use the same offset normalized.
    const vx = projectileSpeed * Math.sin(userQuadAngle);
    const vy = -projectileSpeed * Math.cos(userQuadAngle);
    
    // Create a projectile object
    projectiles.push({ x: startX, y: startY, vx: vx, vy: vy });
});
//--------------------------------------------//


/**
 * Main animation loop
 *
 * This function is called on every frame via requestAnimationFrame
 * This clears the canvas, updates all objects (projectiles, enemies, particles, quadcopters, etc etc), 
 * and then renders them on the canvas and schedules the next frame
 *
 * @param {DOMHighResTimeStamp} timestamp - current time when the frame is rendered
 */
function loop(timestamp) {
    if (context === null) {
        throw new Error("context is null");
    }
    const delta = (timestamp - lastTime) / 1000; // convert to seconds
    lastTime = timestamp;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        // Draw projectile (a white dot)
        context.beginPath();
        context.arc(p.x, p.y, 3, 0, 2 * Math.PI);
        context.fillStyle = "white";
        context.fill();
        // Check collision with each enemy
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (isColliding(p, enemy)) {
                // Remove enemy and projectile, spawn explosion particles and update score.
                enemies.splice(j, 1);
                projectiles.splice(i, 1);
                createExplosion(enemy.x, enemy.y);
                score++;
                break;
            }
        }
        // Remove projectile if it's offscreen
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
            projectiles.splice(i, 1);
        }
    }

    // Update and draw enemies and particles
    updateEnemies(context);
    updateParticles(context, delta);

    // Circular orbit quadcopter 
    // Update orbit angle and calculate new position for circular motion quadcopter
    orbitAngle += orbitSpeed;
    const orbitX = circleCenterX + orbitRadius * Math.cos(orbitAngle);
    const orbitY = circleCenterY + orbitRadius * Math.sin(orbitAngle);
    
    // Rotate quadcopter around the center of the bottom right quadrant
    context.save();
        context.translate(orbitX, orbitY);
        context.rotate(orbitAngle + Math.PI);
        drawQuadcopter(context, 0, 0, "gray", .5);
    context.restore();
    
    // Figure 8 quadcopter
    // Update figure 8 angle and calculate new position for figure 8 motion quadcopter
    figure8Angle += figure8Speed;
    const figure8X = fig8CenterX  + amplitudeX * Math.sin(figure8Angle);
    const figure8Y = fig8CenterY + amplitudeY * Math.sin(2 * figure8Angle);

    // Compute tangent angle from the derivatives
    const dx = amplitudeX * Math.cos(figure8Angle);
    const dy = 2 * amplitudeY * Math.cos(2 * figure8Angle);
    const tangentAngle = Math.atan2(dy, dx); // arc tangent of the derivatives to get tangent angle in direction of motion :OOO

    // Rotate quadcopter around the center of the bottom left quadrant
    context.save();
        context.translate(figure8X, figure8Y);
        context.rotate(tangentAngle + Math.PI / 2);
        drawQuadcopter(context, 0, 0, "purple", .5);
    context.restore();
    
    // Update user controlled quadcopter position based on WASD
    if (keysPressed['w']) {
        userQuadY -= userQuadSpeed;
    }
    if (keysPressed['s']) {
        userQuadY += userQuadSpeed;
    }
    if (keysPressed['a']) {
        userQuadX -= userQuadSpeed;
    }
    if (keysPressed['d']) {
        userQuadX += userQuadSpeed;
    }
    // Wrap user controlled quadcopter around the canvas
    if (userQuadX < 0) {
        userQuadX = canvas.width;
    } else if (userQuadX > canvas.width) {
        userQuadX = 0;
    }
    if (userQuadY < 0) {
        userQuadY = canvas.height;
    } else if (userQuadY > canvas.height) {
        userQuadY = 0;
    }

    // If the mouse is inside the canvas, update the angle the user quadcopter is facing
    if (mouseX !== null && mouseY !== null) {
        const dx = mouseX - userQuadX;
        const dy = mouseY - userQuadY;
        // Only update if the mouse is different enough to avoid jitter, otherwise keep last angle
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            userQuadAngle = Math.atan2(dy, dx) + Math.PI / 2; // arctan and rotate so light in front faces mouse
        }
    }

    // Draw the user controlled quadcopter 
    context.save();
        context.translate(userQuadX, userQuadY);
        context.rotate(userQuadAngle);
        drawQuadcopter(context, 0, 0, "blue", 0.75);
    context.restore();
    
    // Update propeller rotations with different speeds
    propRotTopLeft += speedTopLeft;
    propRotTopRight += speedTopRight;
    propRotBottomRight += speedBottomRight;
    propRotBottomLeft += speedBottomLeft;

    // Draw the score
    context.fillStyle = "white";
    context.font = "20px Times New Roman";
    context.fillText("Score: " + score, 10, 30);

    window.requestAnimationFrame(loop);
};

// Start da loooooop
window.requestAnimationFrame(loop);