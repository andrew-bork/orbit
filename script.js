/* jshint esversion: 9 */
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var G = 10;

var starCanvas = document.getElementById("background");
var starCtx = starCanvas.getContext("2d");

var planetsCanvas = document.getElementById("planets");
var planetsCtx = planetsCanvas.getContext("2d");

var overlayCanvas = document.getElementById("overlay");
var overlayCtx = overlayCanvas.getContext("2d");

canvas.width = 900;
canvas.height = 900;

starCanvas.width = 900;
starCanvas.height = 900;

overlayCanvas.width = 900;
overlayCanvas.height = 900;

planetsCanvas.width = 900;
planetsCanvas.height = 900;


starCtx.fillStyle = "#FFFFFF";
for (var i = 0; i < 900; i++) {
    for (var j = 0; j < 900; j++) {
        if (Math.random() < 0.001) {
            starCtx.fillRect(i, j, 1, 1);
        }
    }
}

class Camera {
    constructor(centerX, centerY, scaleX, scaleY) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.cen
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
        y: -canvas.height * (p.z - graphwindow.centerY + graphwindow.scaleY) / (2 * graphwindow.scaleY) + canvas.height,
    };
};

var demap = (p) => {
    return {
        x: 2 * graphwindow.scaleX * (p.x / canvas.width) + graphwindow.centerX - graphwindow.scaleX,
        y: 0,
        z: 2 * graphwindow.scaleY * ((canvas.height - p.y) / canvas.height) + graphwindow.centerY - graphwindow.scaleY,
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

var magnitude2 = (p) => {
    return Math.sqrt(p.x * p.x + p.y * p.y);
};

var add2 = (a, b) => {
    return { x: a.x + b.x, y: a.y + b.y };
};

var sub2 = (a, b) => {
    return { x: a.x - b.x, y: a.y - b.y };
};

var sca2 = (a, b) => {
    return { x: a.x * b, y: a.y * b };
};

var norm2 = (a) => {
    var r = 1 / magnitude2(a);
    return sca2(a, r);
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
        this.pi = pi;
        this.vi = vi;
    }

    /**
     * 
     * @param {Planet} b 
     */

    applyGravity(b) {
        var dir = sub(b.p, this.p);
        var mag = magnitude(dir);
        this.a = add(sca(dir, G * b.mass / mag / mag / mag), this.a);
    }

    /**
     * 
     * @param {Number} dt 
     */

    step(dt) {
        this.v = add(this.v, sca(this.a, dt));
        this.p = add(this.p, sca(this.v, dt));
        this.a = { x: 0, y: 0, z: 0 };
    }

    trace() {
        this.path.push({ p: this.p, v: this.v, a: this.a });
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


var skip = 1;

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


function rerenderOrbits(planets, centeredOn, bolded = -1) {
    ctx.clearRect(0, 0, 900, 900);
    if (centeredOn != -1) {
        planets.forEach((planet, j) => {
            ctx.beginPath();
            ctx.lineWidth = (j == bolded ? 2 : 1);
            ctx.strokeStyle = planet.col;
            for (var i = 0; i < planet.path.length; i += skip) {
                const data = planet.path[i];
                const a = map(sub(data.p, planets[centeredOn].path[i].p));
                ctx.lineTo(a.x, a.y);
            }
            ctx.stroke();
        });
    } else {
        planets.forEach((planet, j) => {
            ctx.beginPath();
            ctx.lineWidth = (j == bolded ? 2 : 1);
            ctx.strokeStyle = planet.col;
            for (var i = 0; i < planet.path.length; i += skip) {
                const data = planet.path[i];
                const a = map(data.p);
                ctx.lineTo(a.x, a.y);
            }
            ctx.stroke();
        });
    }
}

function rerenderPlanets(planets, centeredOn = -1) {
    planetsCtx.clearRect(0, 0, 900, 900);
    if (centeredOn != -1) {
        const b = planets[centeredOn].pi;
        planets.forEach((planet, j) => {
            planetsCtx.beginPath();
            planetsCtx.strokeStyle = planet.col;
            const a = map(sub(planet.p, b));
            planetsCtx.ellipse(a.x, a.y, 4, 4, 0, 0, Math.PI * 2);
            planetsCtx.stroke();
        });
    } else {
        planets.forEach((planet, j) => {
            planetsCtx.beginPath();
            planetsCtx.strokeStyle = planet.col;
            const a = map(planet.p);
            planetsCtx.ellipse(a.x, a.y, 4, 4, 0, 0, Math.PI * 2);
            planetsCtx.stroke();
        });
    }
}

function rerenderInitialPlanets(planets, centeredOn = -1) {
    planetsCtx.clearRect(0, 0, 900, 900);
    if (centeredOn != -1) {
        const b = planets[centeredOn].pi;
        planets.forEach((planet, j) => {
            planetsCtx.beginPath();
            planetsCtx.strokeStyle = planet.col;
            const a = map(sub(planet.pi, b));
            planetsCtx.ellipse(a.x, a.y, 4, 4, 0, 0, Math.PI * 2);
            planetsCtx.stroke();
        });
    } else {
        planets.forEach((planet, j) => {
            planetsCtx.beginPath();
            planetsCtx.strokeStyle = planet.col;
            const a = map(planet.pi);
            planetsCtx.ellipse(a.x, a.y, 4, 4, 0, 0, Math.PI * 2);
            planetsCtx.stroke();
        });
    }
}

var velocityScaleUp = 100;

function rerenderOverlay(planets, centeredOn = -1, bolded = -1) {
    overlayCtx.clearRect(0, 0, 900, 900);
    if (centeredOn != -1) {
        overlayCtx.strokeStyle = "#FFF";

        const centeredPos = planets[centeredOn].pi;
        const centeredVel = planets[centeredOn].vi;

        planets.forEach(
            (planet, i) => {
                const c = sub(planet.pi, centeredPos);
                const b = map(c);
                const a = map(add(c, sca(sub(planet.vi, centeredVel), velocityScaleUp)));

                overlayCtx.lineWidth = (bolded == i ? 3 : 1);

                overlayCtx.beginPath();
                overlayCtx.moveTo(b.x, b.y);
                overlayCtx.lineTo(a.x, a.y);
                overlayCtx.stroke();
            }
        );
    } else {

        overlayCtx.strokeStyle = "#FFF";

        planets.forEach(
            (planet, i) => {
                const b = map(planet.pi);
                const a = map(add(planet.pi, sca(planet.vi, velocityScaleUp)));

                overlayCtx.lineWidth = (bolded == i ? 3 : 1);

                overlayCtx.beginPath();
                overlayCtx.moveTo(b.x, b.y);
                overlayCtx.lineTo(a.x, a.y);
                overlayCtx.stroke();
            }
        );
    }
}

class PlanetAnimator {
    constructor() {
        this.then = 0;
        this.speed = 1;
        this.frameId = null;

        this.planets = [];
        this.iter = 0;

        this.centeredOn = -1;
    }

    centerOn(a) {
        this.centeredOn = a;
    }

    start() {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame((now) => {
                this.render(now);
            });
        }
    }

    render(now) {
        const dt = (this.then - now) / 1000 * this.speed;
        this.then = now;
        this.iter += dt;

        this.frameId = requestAnimationFrame((now) => {
            this.render(now);
        });

        this.planets.forEach((planet, i) => {
            this.planets.forEach((planet2, j) => {
                if (i != j) {
                    planet.applyGravity(planet2);
                }
            });
        });

        this.planets.forEach((planet) => {
            planet.step(dt);
        });

        rerenderPlanets(this.planets, this.centeredOn);
    }

    rerenderFrame() {
        rerenderPlanets(this.planets, this.centeredOn);
    }

    toggle() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
        } else {
            this.start();
        }
    }

    stop() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
        }
    }

    setPlanets(planets) {
        this.planets = planets;
    }
    reset() {
        this.iter = 0;
    }
}

var moving = false;
var movingVelocity = false;
var movingPosition = false;
var mouseNear = null;
/**
 * 
 * @param {MouseEvent} e 
 */
function onMouseMove(e) {
    if (moving) {
        graphwindow.centerX -= e.movementX / 900 * graphwindow.scaleX * 2;
        graphwindow.centerY += e.movementY / 900 * graphwindow.scaleY * 2;
        rerenderMain();

        e.preventDefault();
    } else if (movingVelocity) {
        const planet = getPlanetsInitial()[mouseNear.closest];

        changePlanetParameters(mouseNear.closest, "vi", add(sca(sub(demap({ x: e.x, y: e.y }), sub(planet.pi, mouseNear.relPos)), 1 / velocityScaleUp), mouseNear.relVel));

    } else if (movingPosition) {
        const planet = getPlanetsInitial()[mouseNear.closest];

        changePlanetParameters(mouseNear.closest, "pi", add(demap({ x: e.x, y: e.y }), mouseNear.relVel));
    } else {
        const a = findClosest({ x: e.x, y: e.y });
        if (a.closest != -1) {
            mouseNear = a;
        } else {
            mouseNear = null;
        }
    }
}
overlayCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    if (!mouseNear) {
        moving = true;
    } else if (mouseNear.type == "velocity") {
        movingVelocity = true;
    } else if (mouseNear.type == "position") {
        movingPosition = true;
    }
});
overlayCanvas.addEventListener("mouseup", (e) => {
    e.preventDefault();
    moving = movingVelocity = movingPosition = false;

});
overlayCanvas.addEventListener("mousemove", onMouseMove);
overlayCanvas.addEventListener("wheel", (e) => {
    graphwindow.scaleX += e.deltaY;
    graphwindow.scaleY += e.deltaY;
    rerenderMain();
    e.preventDefault();
});