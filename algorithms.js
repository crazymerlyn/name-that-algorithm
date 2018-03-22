const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const pointRadius = 2;
const width = 640;
const height = 480
const BOTTOM_SCAN_SPEED = 10;
const BUILD_HULL_FPS = 10;

function drawPoint(ctx, point) {
    ctx.beginPath();
    ctx.fillStyle = point.color;
    ctx.arc(point.x, point.y, pointRadius, 0, 2*Math.PI);
    ctx.fill();
}

function drawPoints(ctx, points) {
    points.forEach(point => drawPoint(ctx, point));
}

function angle360(xdiff, ydiff) {
    let base = Math.atan(Math.abs(ydiff / xdiff));
    if (xdiff >= 0) {
        if (ydiff <= 0) {
            return base;
        } else {
            return 2 * Math.PI - base;
        }
    } else {
        if (ydiff <= 0) {
            return Math.PI - base;
        } else {
            return Math.PI + base;
        }
    }
}

function concave(p1, p2, p3) {
    return angle360(p3.x - p2.x, p3.y - p2.y) <= angle360(p2.x - p1.x, p2.y - p1.y);
}

let points = [];
for (let i = 0; i < 20; ++i) {
    let x = Math.random() * width >> 0;
    let y = Math.random() * height >> 0;
    points[i] = {x: x, y: y, color: 'black'};
}

function bottomScan(ctx, points, linePos) {
    let y = linePos.y;

    if (y >= height) {
        let point = points.reduce((p1, p2) => p1.y > p2.y ? p1 : p2, {y: 0});
        point.color = 'red';
        points = points.filter(p => p != point);
        function getangle(p) {
            let tan = (point.y - p.y) / (p.x - point.x);
            let res = Math.atan(tan);
            return res >= 0 ? res : Math.PI + res;
        }
        points = points.map(x => {x.angle = getangle(x); return x}).sort((x, y) => x.angle - y.angle);
        requestAnimationFrame(() => polarScan(ctx, point, points, 0));
        return;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.fillRect(0, y, width, 3);

    let newpoints = [];
    for (let point of points) {
        if (point.y >= y && point.y <= y + 3) {
            newpoints.push({x: point.x, y: point.y, color: 'red'});
        } else {
            newpoints.push({x: point.x, y: point.y, color: 'black'});
        }
    }

    drawPoints(ctx, newpoints);

    y += BOTTOM_SCAN_SPEED;
    requestAnimationFrame(() => bottomScan(ctx, points, {y: y}));
}

function polarScan(ctx, point, points, angle) {
    if (angle > 180) {
        requestAnimationFrame(() => buildHull(ctx, [point].concat(points), [point], points.concat([point])));
        return;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(-angle * Math.PI / 180);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 2*width, 3);
    ctx.restore();

    let i = 1;
    ctx.save()
    for (let p of points) {
        if (p.angle <= angle * Math.PI / 180) {
            ctx.fillStyle = 'blue';
            ctx.fillText(i, p.x, p.y);
            i += 1
        } else break;
    }
    ctx.restore();
    drawPoints(ctx, points);
    drawPoint(ctx, point);
    requestAnimationFrame(() => polarScan(ctx, point, points, angle + 5));
}

function buildHull(ctx, points, joined, rest) {
    ctx.clearRect(0, 0, width, height);
    drawPoints(ctx, points);
    for (let i = 1; i < joined.length; ++i) {
        ctx.beginPath();
        ctx.moveTo(joined[i-1].x, joined[i-1].y);
        ctx.lineTo(joined[i].x, joined[i].y);
        ctx.stroke();
    }
    ctx.save();
    ctx.strokeStyle = 'red';
    for (let i = 1; i < joined.length - 1; ++i) {
        if (concave(joined[i-1], joined[i], joined[i+1])) {
            ctx.beginPath();
            ctx.moveTo(joined[i].x, joined[i].y);
            ctx.lineTo(joined[i].x + 5, joined[i].y + 5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(joined[i].x + 5, joined[i].y);
            ctx.lineTo(joined[i].x, joined[i].y + 5);
            ctx.stroke();
        }
    }
    ctx.restore();
    if (joined.length >= 3 && concave(...joined.slice(joined.length-3, joined.length))) {
        let last = joined[joined.length - 1];
        joined = joined.slice(0, joined.length - 2).concat([last]);
        setTimeout(() => buildHull(ctx, points, joined, rest), 1000 / BUILD_HULL_FPS);
    } else if (rest.length == 0) {
        return;
    } else {
        setTimeout(() => buildHull(ctx, points, joined.concat(rest[0]), rest.slice(1)), 1000 / BUILD_HULL_FPS);
    }
}

requestAnimationFrame(() => bottomScan(ctx, points, {y: 0}));
