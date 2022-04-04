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

var RenderSettings = {
    renderDetailedText: false,
    renderText: false,
    orbitStepSize: 1,
};

var SimulationSettings = {
    dt: 0.1,
    iters: 10000,
    batchSize: 100,
};


var width;
var height;

function resize(w, h){
    canvas.width = starCanvas.width = overlayCanvas.width = planetsCanvas.width = width = w;
    canvas.height = starCanvas.height = overlayCanvas.height = planetsCanvas.height = height = h;
}

resize(window.innerWidth, window.innerHeight);



starCtx.fillStyle = "#FFFFFF";
for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
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

function updateAspectRatio(){
    graphwindow.scaleY = graphwindow.scaleX * height / width;
}

updateAspectRatio();

var map = (p) => {
    return {
        x: canvas.width * (p.x - graphwindow.centerX + graphwindow.scaleX) / (2 * graphwindow.scaleX),
        y: -canvas.height * (p.z - graphwindow.centerY + graphwindow.scaleY) / (2 * graphwindow.scaleY) + canvas.height,
    };
};

var scaleX = () => {
    return canvas.width / (2 * graphwindow.scaleX);
};

var scaleY = () => {
    return canvas.height / (2 * graphwindow.scaleY);
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
    constructor(mass, pi, vi, name = "", col = "#000000", rad = 10) {
        this.mass = mass;
        this.name = name;
        this.p = pi;
        this.v = vi;
        this.a = { x: 0, y: 0, z: 0 };
        this.path = [];
        this.color = col;
        this.pi = pi;
        this.vi = vi;
        this.radius = rad;
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


var currentCalculation;

function calculateOrbits(planets, callback, i = 0) {
    var iterations = 0;
    currentCalculation = setInterval(() => {
        for (var i = 0; i < SimulationSettings.batchSize; i++) {
            planets.forEach((planet, j) => {
                planets.forEach((otherPlanet, k) => {
                    if (j != k) {
                        planet.applyGravity(otherPlanet);
                    }
                });
            });

            planets.forEach((planet) => {
                planet.step(SimulationSettings.dt);
                planet.trace();
            });
        }
        callback({ planets: planets });
        iterations += SimulationSettings.batchSize;
        if (iterations == SimulationSettings.iters) {
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
    ctx.clearRect(0, 0, width, height);
    if (centeredOn != -1) {
        planets.forEach((planet, j) => {
            ctx.beginPath();
            ctx.lineWidth = (j == bolded ? 2 : 1);
            ctx.strokeStyle = planet.color;
            for (var i = 0; i < planet.path.length; i += RenderSettings.orbitStepSize) {
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
            ctx.strokeStyle = planet.color;
            for (var i = 0; i < planet.path.length; i += RenderSettings.orbitStepSize) {
                const data = planet.path[i];
                const a = map(data.p);
                ctx.lineTo(a.x, a.y);
            }
            ctx.stroke();
        });
    }
}

function rerenderPlanets(planets, centeredOn = -1) {
    planetsCtx.clearRect(0, 0, width, height);

    const scaX = scaleX();
    const scaY = scaleY();

    if (centeredOn != -1) {
        const b = planets[centeredOn].pi;
        planets.forEach((planet, j) => {
            planetsCtx.beginPath();
            planetsCtx.strokeStyle = planet.color;
            const a = map(sub(planet.p, b));
            planetsCtx.ellipse(a.x, a.y, scaX * planet.radius, scaY * planet.radius, 0, 0, Math.PI * 2);
            planetsCtx.stroke();
        });
    } else {
        planets.forEach((planet, j) => {
            planetsCtx.beginPath();
            planetsCtx.strokeStyle = planet.color;
            const a = map(planet.p);
            planetsCtx.ellipse(a.x, a.y, scaX * planet.radius, scaY * planet.radius, 0, 0, Math.PI * 2);
            planetsCtx.stroke();
        });
    }
}

function rerenderInitialPlanets(planets, centeredOn = -1) {
    planetsCtx.clearRect(0, 0, width, height);

    const scaX = scaleX();
    const scaY = scaleY();

    if (centeredOn != -1) {
        const b = planets[centeredOn].pi;
        planets.forEach((planet, j) => {
            planetsCtx.beginPath();
            planetsCtx.strokeStyle = planet.color;
            const a = map(sub(planet.pi, b));
            planetsCtx.ellipse(a.x, a.y, scaX * planet.radius, scaY * planet.radius, 0, 0, Math.PI * 2);
            planetsCtx.stroke();
        });
    } else {
        planets.forEach((planet, j) => {
            planetsCtx.beginPath();
            planetsCtx.strokeStyle = planet.color;
            const a = map(planet.pi);
            planetsCtx.ellipse(a.x, a.y, scaX * planet.radius, scaY * planet.radius, 0, 0, Math.PI * 2);
            planetsCtx.stroke();
        });
    }
}

var velocityScaleUp = 100;

function rerenderOverlay(planets, centeredOn = -1, bolded = -1) {
    overlayCtx.clearRect(0, 0, width, height);

    const scaX = scaleX();
    const scaY = scaleY();

    var centeredPos = { x: 0, y: 0, z: 0 };
    var centeredVel = { x: 0, y: 0, z: 0 };

    if (centeredOn != -1) {
        centeredPos = planets[centeredOn].pi;
        centeredVel = planets[centeredOn].vi;
    }
    overlayCtx.strokeStyle = "#FFF";
    overlayCtx.fillStyle = "#FFF";
    overlayCtx.font = "normal 48px 'Bungee Hairline'";

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
            if (RenderSettings.renderText) {
                renderText(overlayCtx, b, planet, scaX, scaY);
            }
        }
    );
}

function renderText(ctx, b, planet, scaX, scaY) {
    var x = planet.radius;
    const size = Math.log(x * scaX / 2) * 20;
    const name = planet.name;
    const point = { x: b.x + 12 + x * scaX, y: b.y - (2 + x * scaY) };
    const linePadding = size * 0.2;

    const massString = `${planet.mass} g`;
    const radiusString = `${planet.radius} m`;
    const positionString = `Pos: (${round(planet.pi.x)} m,${round(planet.pi.y)} m,${round(planet.pi.z)} m)`;
    const velocityString = `Vel: (${round(planet.vi.x)} m/s,${round(planet.vi.y)} m/s,${round(planet.vi.z)} m/s)`;
    var width = 0;

    overlayCtx.font = `normal ${size}px 'Bungee Hairline'`;
    const measure = overlayCtx.measureText(name);
    const height = measure.actualBoundingBoxAscent - measure.actualBoundingBoxDescent;



    if (size > 100) {

    } else if (size > 60 && RenderSettings.renderDetailedText) {
        overlayCtx.font = `normal ${size * 0.4}px 'Bungee Hairline'`;
        const measure2 = ctx.measureText(massString);
        const measure3 = ctx.measureText(radiusString);
        const measure4 = ctx.measureText(positionString);
        const measure5 = ctx.measureText(velocityString);
        const height2 = measure2.actualBoundingBoxAscent - measure2.actualBoundingBoxDescent;
        overlayCtx.font = `normal ${size}px 'Bungee Hairline'`;

        width = Math.max(
            Math.max(
                Math.max(
                    Math.max(
                        Math.max(
                            measure.width,
                            width
                        ),
                        measure2.width
                    ),
                    measure3.width
                ),
                measure4.width
            ),
            measure5.width
        );
        overlayCtx.globalAlpha = 0.2;
        overlayCtx.fillStyle = "#000";
        overlayCtx.fillRect(point.x - 12, point.y - height - linePadding - 6, width + 24, 4 * height2 + 6 * linePadding + height + 12, 5, 5);
        overlayCtx.clearRect(point.x - 6, point.y - height - linePadding, width + 12, 4 * height2 + 6 * linePadding + height, 5, 5);
        overlayCtx.fillRect(point.x - 6, point.y - height - linePadding, width + 12, 4 * height2 + 6 * linePadding + height, 5, 5);
        overlayCtx.globalAlpha = 1;
        overlayCtx.fillStyle = "#FFF";
        overlayCtx.fillText(name, point.x, point.y);
        ctx.lineCap = "round";
        ctx.lineWidth = size * 0.02;

        overlayCtx.beginPath();
        overlayCtx.moveTo(point.x, point.y);
        overlayCtx.lineTo(point.x + width, point.y);
        overlayCtx.stroke();

        overlayCtx.font = `normal ${size * 0.4}px 'Bungee Hairline'`;
        var offsetY = linePadding + height2;
        overlayCtx.fillText(massString, point.x, point.y + offsetY);
        offsetY += linePadding + height2;
        overlayCtx.fillText(radiusString, point.x, point.y + offsetY);
        offsetY += linePadding + height2;
        overlayCtx.fillText(positionString, point.x, point.y + offsetY);
        offsetY += linePadding + height2;
        overlayCtx.fillText(velocityString, point.x, point.y + offsetY);


    } else if (size > 10) {
        overlayCtx.globalAlpha = 0.2;
        overlayCtx.fillStyle = "#000";
        overlayCtx.fillRect(point.x - 12, point.y - height - linePadding - 6, measure.width + 24, 2 * linePadding + height + 12);
        overlayCtx.clearRect(point.x - 6, point.y - height - linePadding, measure.width + 12, 2 * linePadding + height);
        overlayCtx.fillRect(point.x - 6, point.y - height - linePadding, measure.width + 12, 2 * linePadding + height);
        overlayCtx.globalAlpha = 1;
        overlayCtx.fillStyle = "#FFF";
        overlayCtx.fillText(name, point.x, point.y);
    }
}

function round(value, dig = 2) {
    const a = 10 ** dig;
    return Math.round(value * a) / a;
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

        changePlanetParameters(mouseNear.closest, "pi", add(demap({ x: e.x, y: e.y }), mouseNear.relPos));
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
    // graphwindow.scaleY += e.deltaY;
    graphwindow.scaleX = Math.max(0.1, graphwindow.scaleX);
    // graphwindow.scaleY = Math.max(0.1, graphwindow.scaleY);
    updateAspectRatio();
    rerenderMain();
    e.preventDefault();
});