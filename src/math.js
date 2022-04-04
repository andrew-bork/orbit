
export const magnitude = (p) => {
    return Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
};

export const add = (a, b) => {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
};

export const sub = (a, b) => {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
};

export const sca = (a, b) => {
    return { x: a.x * b, y: a.y * b, z: a.z * b };
};

export const norm = (a) => {
    var r = 1 / magnitude(a);
    return sca(a, r);
};

export const magnitude2 = (p) => {
    return Math.sqrt(p.x * p.x + p.y * p.y);
};

export const add2 = (a, b) => {
    return { x: a.x + b.x, y: a.y + b.y };
};

export const sub2 = (a, b) => {
    return { x: a.x - b.x, y: a.y - b.y };
};

export const sca2 = (a, b) => {
    return { x: a.x * b, y: a.y * b };
};

export const norm2 = (a) => {
    var r = 1 / magnitude2(a);
    return sca2(a, r);
};

export function round(value, dig = 2) {
    const a = 10 ** dig;
    return Math.round(value * a) / a;
}


// module.exports = {magnitude, add, sub, sca, norm, magnitude2, add2, sub2, sca2, norm2};