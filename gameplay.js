const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = { x: canvas.width / 2, y: canvas.height / 2, size: 10, color: 'blue' };
const bullets = [];

document.addEventListener('keydown', (event) => {
    let moveX = 0;
    let moveY = 0;

    if (event.key === 'ArrowUp') moveY = -5;
    if (event.key === 'ArrowDown') moveY = 5;
    if (event.key === 'ArrowLeft') moveX = -5;
    if (event.key === 'ArrowRight') moveX = 5;

    player.x += moveX;
    player.y += moveY;
    socket.emit('playerMoved', { x: player.x, y: player.y });
});

document.addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);
    const bullet = {
        x: player.x,
        y: player.y,
        angle: angle,
        speed: 5
    };
    bullets.push(bullet);
    socket.emit('shootBullet', { x: player.x, y: player.y, angle: angle });
});

function updateBullets() {
    bullets.forEach(bullet => {
        bullet.x += bullet.speed * Math.cos(bullet.angle);
        bullet.y += bullet.speed * Math.sin(bullet.angle);
    });
}

function renderGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();

    // Draw bullets
    ctx.fillStyle = 'black';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(renderGame);
    updateBullets();
}

renderGame();

// Handle incoming player movements
socket.on('playerMoved', (data) => {
    if (data.id !== socket.id) {
        // Draw other players
        ctx.beginPath();
        ctx.arc(data.x, data.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
    }
});

// Handle incoming bullets
socket.on('bulletShot', (data) => {
    bullets.push({
        x: data.x,
        y: data.y,
        angle: data.angle,
        speed: 5
    });
});
