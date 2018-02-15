const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const pointRadius = 2;

function drawPoint(ctx, point) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointRadius, 0, 2*Math.PI);
    ctx.fill();
}

let points = [];
for (let i = 0; i < 20; ++i) {
    let x = Math.random() * 300 >> 0;
    let y = Math.random() * 300 >> 0;
    drawPoint(ctx, {x: x, y: y});
}
