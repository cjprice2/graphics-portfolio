/**
 * 04-05-01.js - a simple JavaScript file that gets loaded with
 * page 5 of Workbook 4 (CS559).
 *
 * written by Michael Gleicher, January 2019
 * modified January 2020, February 2021
 *
 */

/**
 * If you want to read up on JavaScript classes, 
 * see the tutorial on the class website:
 * 
 * https://cs559.github.io/559Tutorials/javascript/oop-in-js-1/
 */
class Boid {
    /**
     * 
     * @param {number} x    - initial X position
     * @param {number} y    - initial Y position
     * @param {number} vx   - initial X velocity
     * @param {number} vy   - initial Y velocity
     */
    constructor(x, y, vx = 1, vy = 0) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.collideFrames = 0; // number of frames to remain in alternate color
    }
    /**
     * Draw the Boid
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        let angle = Math.atan2(this.vy, this.vx);
        context.rotate(angle); // rotate the boid in direction of travel
        
        // Update leg swing phase 
        if (this.legPhase === undefined) {
            this.legPhase = 0;
            this.legPhaseSpeed = 0.05; 
        }
        this.legPhase += this.legPhaseSpeed;
        let maxSwing = 0.3; // maximum swing angle in radians
        let swing = maxSwing * Math.sin(this.legPhase);

        // Draw legs first so they're under the boids
        context.fillStyle = "black";

    
        // Draw left side legs with positive swing for symmetric motion  
        context.save();
        context.rotate(swing);
        context.fillRect(4, -8, 2, 10); // upper left leg
        context.restore();

        context.save();
        context.rotate(swing);
        context.fillRect(-2, -10, 2, 10); // middle left leg
        context.restore();

        context.save();
        context.rotate(swing);
        context.fillRect(-8, -12, 2, 10); // lower left leg
        context.restore();

        // Draw right side legs with negative swing for symmetric motion
        context.save();
        context.translate(4, -2);       // upper right leg pivot
        context.rotate(-swing);
        context.fillRect(0, 0, 2, 10);
        context.restore();

        context.save();
        context.translate(-2, 0);       // middle right leg pivot
        context.rotate(-swing);
        context.fillRect(0, 0, 2, 10);
        context.restore();

        context.save();
        context.translate(-8, 2);       // lower right leg pivot
        context.rotate(-swing);
        context.fillRect(0, 0, 2, 10);
        context.restore();

        // Check if this boid recently hit something, change color if so
        if (this.collideFrames > 0) {
            context.fillStyle = "blue";
        } else {
            context.fillStyle = "red"; 
        }

        // Make boids red triangles
        context.beginPath();
        context.moveTo(10, 0);
        context.lineTo(-10, 5);
        context.lineTo(-10, -5);
        context.fill();
        context.closePath();

        context.beginPath();
        

        context.fill();
        context.closePath();
        context.restore();
    }
    /**
     * Perform the "steering" behavior -
     * This function should update the velocity based on the other
     * members of the flock.
     * It is passed the entire flock (an array of Boids) - that includes
     * "this"!
     * Note: dealing with the boundaries does not need to be handled here
     * (in fact it can't be, since there is no awareness of the canvas)
     * *
     * And remember, (vx,vy) should always be a unit vector!
     * @param {Array<Boid>} flock 
     */
    steer(flock, delta) {
        const threshold = 10; // collision threshold (dist between centers)
        let steerX = 0;
        let steerY = 0;
        let count = 0;

        for (let other of flock) {
            if (other === this) { // don't compare to self
                continue;
            }
            let dx = this.x - other.x;
            let dy = this.y - other.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < threshold && dist > 0) {
                // steerX and steerY are sums of unit vectors pointing away from nearby boids
                steerX += dx / dist;
                steerY += dy / dist;
                count++;
                // Set frames to remain in alternate color for both boids
                this.collideFrames = 30; 
                other.collideFrames = 30;
            }
        }
        
        if (count > 0) {
            // Average direction of all the unit vectors for overall push 
            steerX /= count;
            steerY /= count;
            // Normalize to a unit vector
            let len = Math.sqrt(steerX * steerX + steerY * steerY);
            if (len > 0) {
                // Retain current velocity
                this.vx = steerX / len;
                this.vy = steerY / len;
            }
        }
    }
}


/** the actual main program
 * this used to be inside of a function definition that window.onload
 * was set to - however, now we use defer for loading
 */

 /** @type Array<Boid> */
let boids = [];

let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
canvas.style.background = "#ffffff";
let context = canvas.getContext("2d");

let speedSlider = /** @type {HTMLInputElement} */ (document.getElementById("speed"));

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    boids.forEach(boid => boid.draw(context));
}

/**
 * Create some initial boids
 */
boids.push(new Boid(100, 100));
boids.push(new Boid(200, 200, -1, 0));
boids.push(new Boid(300, 300, 0, -1));
boids.push(new Boid(400, 400, 0, 1));

/**
 * Handle the buttons
 */
document.getElementById("add").onclick = function () {
    for (let i = 0; i < 10; i++) {
        // Random x between 0 and canvas.width, random y between 0 and canvas.height
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        // Pick a random angle [0, 2π)
        let angle = Math.random() * 2 * Math.PI;
        // unit vector: (cos(angle), sin(angle))
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        boids.push(new Boid(x, y, vx, vy));
    }
};
document.getElementById("clear").onclick = function () {
    boids.length = 0;
};

let lastTime; // will be undefined by default
/**
 * The Actual Execution
 */
function loop(timestamp) {
    // time step - convert to 1/60th of a second frames
    // 1000ms / 60fps
    const delta = (lastTime ? timestamp-lastTime : 0) * 1000.0/60.0;

    // change directions
    boids.forEach(boid => boid.steer(boids, delta));
    let speed = Number(speedSlider.value);
    // Move forward, bounce off edges, and set/decrement collideFrames
    boids.forEach(function (boid) {
        boid.x += boid.vx * speed;
        boid.y += boid.vy * speed;
        // Decrement collideFrames
        if (boid.collideFrames > 0) {
            boid.collideFrames--;
        }
        // Check left/right edges
        if (boid.x < 0) {
            boid.x = 0;
            boid.vx = -boid.vx;
            boid.collideFrames = 30; // set frames to remain in alternate color
        } else if (boid.x > canvas.width) {
            boid.x = canvas.width;
            boid.vx = -boid.vx;
            boid.collideFrames = 30; 
        }
        // Check top/bottom edges
        if (boid.y < 0) {
            boid.y = 0;
            boid.vy = -boid.vy;
            boid.collideFrames = 30; 
        } else if (boid.y > canvas.height) {
            boid.y = canvas.height;
            boid.vy = -boid.vy;
            boid.collideFrames = 30; 
        }
    });
    // now we can draw
    draw();
    // and loop
    window.requestAnimationFrame(loop);

}
// start the loop with the first iteration
window.requestAnimationFrame(loop);


