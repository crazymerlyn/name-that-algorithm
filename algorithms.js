const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const pointRadius = 2;
const width = 640;
const height = 480

function drawPoint(ctx, point) {
    ctx.beginPath();
    ctx.fillStyle = point.color;
    ctx.arc(point.x, point.y, pointRadius, 0, 2*Math.PI);
    ctx.fill();
}
function drawPoints(ctx, points) {
    points.forEach(point => drawPoint(ctx, point));
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

    y += 3;
    requestAnimationFrame(() => bottomScan(ctx, points, {y: y}));
}

function polarScan(ctx, point, points, angle) {
    if (angle >= 180) return;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(-angle * Math.PI / 180);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 2*width, 3);
    ctx.restore();
    drawPoints(ctx, points);
    drawPoint(ctx, point);
    requestAnimationFrame(() => polarScan(ctx, point, points, angle + 5));
}

requestAnimationFrame(() => bottomScan(ctx, points, {y: 0}));
