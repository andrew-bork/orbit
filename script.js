/* jshint esversion: 9 */
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var G = 10;

var starCanvas = document.getElementById("background");
var starCtx = starCanvas.getContext("2d");

canvas.width = 900;
canvas.height = 900;

starCanvas.width = 900;
starCanvas.height = 900;

starCtx.fillStyle = "#FFFFFF";
for (var i = 0; i < 900; i++) {
    for (var j = 0; j < 900; j++) {
        if (Math.random() < 0.001) {
            starCtx.fillRect(i, j, 1, 1);
        }
    }
}

var graphwindow = {
    centerX: 0,
    centerY: 0,
    scaleX: 2000,
    scaleY: 2000,
};

var map = (p) => {
    return {
        x: canvas.width * (p.x - graphwindow.centerX + graphwindow.scaleX) / (2 * graphwindow.scaleX),
        y: canvas.height * (p.z - graphwindow.centerY + graphwindow.scaleY) / (2 * graphwindow.scaleY),
    };
};

var magnitude = (p) => {
    return Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
};

var add = (a, b) => {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
};

var sub = (a, b) => {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
};

var sca = (a, b) => {
    return { x: a.x * b, y: a.y * b, z: a.z * b };
};

var norm = (a) => {
    var r = 1 / magnitude(a);
    return sca(a, r);
};

class Planet {
    constructor(mass, pi, vi, name = "", col = "#000000") {
        this.mass = mass;
        this.name = name;
        this.p = pi;
        this.v = vi;
        this.a = { x: 0, y: 0, z: 0 };
        this.path = [];
        this.col = col;
    }

    /**
     * 
     * @param {Planet} b 
     */

    applyGravity(b) {
        var dir = sub(b.p, this.p);
        var mag = magnitude(dir);
        this.a = sca(norm(dir), G * b.mass / mag / mag);
    }

    /**
     * 
     * @param {Number} dt 
     */

    step(dt) {
        this.v = add(this.v, sca(this.a, dt));
        this.p = add(this.p, sca(this.v, dt));
    }

    trace() {
        this.path.push(this.p);
    }
}


const dt = 0.1;
const iters = 10000;
const batch_size = 100;

var currentCalculation;

function calculateOrbits(planets, callback, i = 0) {
    var iterations = 0;
    currentCalculation = setInterval(() => {
        for (var i = 0; i < batch_size; i++) {
            planets.forEach((planet, j) => {
                planets.forEach((otherPlanet, k) => {
                    if (j != k) {
                        planet.applyGravity(otherPlanet);
                    }
                });
            });

            planets.forEach((planet) => {
                planet.step(dt);
                planet.trace();
            });
        }
        callback({ planets: planets });
        iterations += batch_size;
        if (iterations == iters) {
            clearInterval(currentCalculation);
        }
    }, 1);

}

async function orbitCalculator(planets) {
    for (var i = 0; i < batch_size; i++) {
        planets.forEach((planet, j) => {
            planets.forEach((otherPlanet, k) => {
                if (j != k) {
                    planet.applyGravity(otherPlanet);
                }
            });
        });

        planets.forEach((planet) => {
            planet.step(dt);
            planet.trace();
        });
    }
}


function rerender(planets, centeredOn) {
    ctx.clearRect(0, 0, 900, 900);
    if (centeredOn != -1) {
        planets.forEach((planet) => {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = planet.col;
            planet.path.forEach((data, i) => {
                const a = map(sub(data, planets[centeredOn].path[i]));
                ctx.lineTo(a.x, a.y);
            });
            ctx.stroke();
        });
    } else {
        planets.forEach((planet) => {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = planet.col;
            planet.path.forEach((data, i) => {
                const a = map(data);
                ctx.lineTo(a.x, a.y);
            });
            ctx.stroke();
        });
    }
}

var mousedown = false;

/**
 * 
 * @param {MouseEvent} e 
 */
function onMouseMove(e) {
    if (mousedown) {
        graphwindow.centerX -= e.movementX / 900 * graphwindow.scaleX * 2;
        graphwindow.centerY -= e.movementY / 900 * graphwindow.scaleY * 2;
        rerenderMain();

        e.preventDefault();
    }
}
canvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    mousedown = true;
});
canvas.addEventListener("mouseup", (e) => {
    e.preventDefault();
    mousedown = false;
});
canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("wheel", (e) => {
    graphwindow.scaleX += e.deltaY;
    graphwindow.scaleY += e.deltaY;
    rerenderMain();
    e.preventDefault();
});