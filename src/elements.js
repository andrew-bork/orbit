export var canvas = document.getElementById("canvas");
export var ctx = canvas.getContext("2d");

export var starCanvas = document.getElementById("background");
export var starCtx = starCanvas.getContext("2d");

export var planetsCanvas = document.getElementById("planets");
export var planetsCtx = planetsCanvas.getContext("2d");

export var overlayCanvas = document.getElementById("overlay");
export var overlayCtx = overlayCanvas.getContext("2d");

// module.exports = {canvas, ctx, starCanvas, starCtx, planetsCanvas, planetsCtx, overlayCanvas, overlayCtx};