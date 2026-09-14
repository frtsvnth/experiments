// ==================== КОНСТАНТЫ ====================
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 800;
const GRAVITY = 0.6;
const JUMP_VELOCITY = -15;
const SPRING_JUMP_VELOCITY = -22;
const PLAYER_SPEED = 8;

// Типы платформ
const PLATFORM_TYPES = {
    NORMAL: 'normal',
    MOVING: 'moving',
    FRAGILE: 'fragile',
    SPRING: 'spring'
};

// Цвета
const COLORS = {
    PLAYER: '#4CAF50',
    PLATFORM_NORMAL: '#808080',
    PLATFORM_MOVING: '#2196F3',
    PLATFORM_FRAGILE: '#F44336',
    PLATFORM_SPRING: '#8BC34A',
    BG_TOP: '#87CEEB',
    BG_BOTTOM: '#E0F7FA'
};

// ==================== ПЕРЕМЕННЫЕ ИГРЫ ====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Состояние игры: 'menu', 'playing', 'gameover'
let gameState = 'menu';

// Игровые объекты
let player = {
    x: CANVAS_WIDTH / 2 - 20,
    y: CANVAS_HEIGHT - 150,
    width: 40,
    height: 40,
    velX: 0,
    velY: 0,
    speed: PLAYER_SPEED,
    jumping: false,
    lastPlatform: null // Последняя платформа, на которой стоял игрок
};

let platforms = [];
let cameraY = 0;
let score = 0;
let highScore = 0;
let maxHeightReached = 0; // Максимальная достигнутая высота (минимальная Y координата)
let keys = { left: false, right: false };
let touchLeft = false;
let touchRight = false;

// Частицы для эффектов
let particles = [];

// ==================== ЭЛЕМЕНТЫ DOM ====================
const menuScreen = document.getElementById('menu-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const scoreDisplay = document.getElementById('score-display');
const currentScoreEl = document.getElementById('current-score');
const finalScoreEl = document.getElementById('final-score');
const highScoreEl = document.getElementById('high-score');
const menuHighScoreEl = document.getElementById('menu-high-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
function init() {
    // Настройка canvas для retina-дисплеев
    setupCanvas();
    
    // Загрузка рекорда из localStorage
    highScore = parseInt(localStorage.getItem('doodleJumpHighScore')) || 0;
    updateHighScoreDisplay();
    
    // События кнопок
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    menuBtn.addEventListener('click', showMenu);
    
    // События клавиатуры
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // События тачскрина
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    // Предотвращение скролла на мобильных
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    
    // Адаптация при изменении размера окна
    window.addEventListener('resize', setupCanvas);
}

// Настройка canvas с учётом DPI
function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Вычисляем размер canvas с учётом экрана
    let width = CANVAS_WIDTH;
    let height = CANVAS_HEIGHT;
    
    // Адаптация под размер окна
    const maxWidth = window.innerWidth - 40;
    const maxHeight = window.innerHeight - 40;
    
    if (width > maxWidth) {
        const scale = maxWidth / width;
        width = maxWidth;
        height = height * scale;
    }
    
    if (height > maxHeight) {
        const scale = maxHeight / height;
        height = maxHeight;
        width = width * scale;
    }
    
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    
    ctx.scale(dpr, dpr);
}

// ==================== УПРАВЛЕНИЕ ИГРОЙ ====================
function startGame() {
    gameState = 'playing';
    menuScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    scoreDisplay.classList.remove('hidden');
    
    resetGame();
    requestAnimationFrame(gameLoop);
}

function showMenu() {
    gameState = 'menu';
    menuScreen.classList.remove('hidden');
    gameoverScreen.classList.add('hidden');
    scoreDisplay.classList.add('hidden');
}

function gameOver() {
    gameState = 'gameover';
    gameoverScreen.classList.remove('hidden');
    scoreDisplay.classList.add('hidden');
    
    finalScoreEl.textContent = score;
    
    // Обновление рекорда
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('doodleJumpHighScore', highScore);
        updateHighScoreDisplay();
    }
}

function resetGame() {
    // Сброс игрока
    player.x = CANVAS_WIDTH / 2 - 20;
    player.y = CANVAS_HEIGHT - 150;
    player.velX = 0;
    player.velY = 0;
    player.jumping = false;
    player.lastPlatform = null;
    
    // Сброс камеры и счёта
    cameraY = 0;
    score = 0;
    maxHeightReached = 0;
    
    // Генерация начальных платформ
    platforms = [];
    generateInitialPlatforms();
    
    // Очистка частиц
    particles = [];
}

function updateHighScoreDisplay() {
    highScoreEl.textContent = highScore;
    menuHighScoreEl.textContent = highScore;
}

// ==================== ГЕНЕРАЦИЯ ПЛАТФОРМ ====================
function generateInitialPlatforms() {
    // Начальная платформа под игроком
    platforms.push({
        x: CANVAS_WIDTH / 2 - 40,
        y: CANVAS_HEIGHT - 100,
        width: 80,
        height: 15,
        type: PLATFORM_TYPES.NORMAL,
        broken: false,
        moveDir: 1,
        moveSpeed: 2
    });
    
    // Генерация платформ вверх
    let y = CANVAS_HEIGHT - 200;
    let lastX = CANVAS_WIDTH / 2 - 40; // X предыдущей платформы
    while (y > -2000) {
        const platform = generatePlatformNearby(y, lastX);
        platforms.push(platform);
        lastX = platform.x;
        y -= randomRange(70, 100); // Уменьшенный диапазон для более доступных платформ
    }
}

function generatePlatform(y) {
    const x = randomRange(10, CANVAS_WIDTH - 90);
    const type = choosePlatformType(y);
    
    return {
        x: x,
        y: y,
        width: 80,
        height: 15,
        type: type,
        broken: false,
        moveDir: Math.random() > 0.5 ? 1 : -1,
        moveSpeed: randomRange(1, 3)
    };
}

function generatePlatformNearby(y, lastX) {
    // Генерация платформы в доступном диапазоне от предыдущей
    const maxHorizontalDistance = 150; // Максимальное горизонтальное расстояние
    let x = lastX + randomRange(-maxHorizontalDistance, maxHorizontalDistance);
    
    // Убедимся, что платформа в пределах экрана
    x = Math.max(10, Math.min(x, CANVAS_WIDTH - 90));
    
    const type = choosePlatformType(y);
    
    return {
        x: x,
        y: y,
        width: 80,
        height: 15,
        type: type,
        broken: false,
        moveDir: Math.random() > 0.5 ? 1 : -1,
        moveSpeed: randomRange(1, 3)
    };
}

function choosePlatformType(y) {
    // Чем выше, тем больше сложных платформ
    const difficulty = Math.abs(y) / 1000;
    const rand = Math.random();
    
    if (rand < 0.6 - difficulty * 0.1) {
        return PLATFORM_TYPES.NORMAL;
    } else if (rand < 0.75) {
        return PLATFORM_TYPES.MOVING;
    } else if (rand < 0.9) {
        return PLATFORM_TYPES.SPRING;
    } else {
        return PLATFORM_TYPES.FRAGILE;
    }
}

function generateMorePlatforms() {
    // Находим самую верхнюю платформу
    let highestY = platforms[0].y;
    let highestPlatform = platforms[0];
    platforms.forEach(p => {
        if (p.y < highestY) {
            highestY = p.y;
            highestPlatform = p;
        }
    });
    
    // Генерируем новые платформы вверху
    while (highestY > cameraY - CANVAS_HEIGHT - 500) {
        highestY -= randomRange(70, 100); // Уменьшенный диапазон
        const newPlatform = generatePlatformNearby(highestY, highestPlatform.x);
        platforms.push(newPlatform);
        highestPlatform = newPlatform;
    }
    
    // Удаляем платформы внизу
    platforms = platforms.filter(p => p.y < cameraY + CANVAS_HEIGHT + 200);
}

// ==================== ИГРОВОЙ ЦИКЛ ====================
function gameLoop() {
    if (gameState !== 'playing') return;
    
    update();
    draw();
    
    requestAnimationFrame(gameLoop);
}

function update() {
    // Обновление движения игрока
    handleInput();
    
    // Применение гравитации
    player.velY += GRAVITY;
    player.y += player.velY;
    player.x += player.velX;
    
    // Граница экрана по X (петля)
    if (player.x < -player.width) {
        player.x = CANVAS_WIDTH;
    } else if (player.x > CANVAS_WIDTH) {
        player.x = -player.width;
    }
    
    // Проверка столкновений с платформами
    checkCollisions();
    
    // Обновление камеры (плавное следование за игроком при движении вверх)
    if (player.velY < 0 && player.y < CANVAS_HEIGHT / 2) {
        // Игрок летит вверх и находится в верхней половине экрана
        const currentWorldY = player.y + cameraY;
        
        // Проверяем, достиг ли игрок новой максимальной высоты
        if (currentWorldY < maxHeightReached) {
            const diff = CANVAS_HEIGHT / 2 - player.y;
            cameraY -= diff;
            player.y = CANVAS_HEIGHT / 2;
            
            // Обновление максимальной высоты и счёта
            maxHeightReached = currentWorldY;
            score = Math.floor(Math.abs(maxHeightReached) / 10);
            currentScoreEl.textContent = score;
        }
    }
    
    // Обновление движущихся платформ
    platforms.forEach(platform => {
        if (platform.type === PLATFORM_TYPES.MOVING) {
            platform.x += platform.moveSpeed * platform.moveDir;
            
            // Отскок от краёв
            if (platform.x <= 0 || platform.x >= CANVAS_WIDTH - platform.width) {
                platform.moveDir *= -1;
            }
        }
    });
    
    // Проверка game over (игрок упал ниже видимого экрана)
    const screenY = player.y - cameraY;
    if (screenY > CANVAS_HEIGHT + 100) {
        gameOver();
    }
    
    // Генерация новых платформ
    generateMorePlatforms();
    
    // Обновление частиц
    updateParticles();
}

function handleInput() {
    player.velX = 0;
    
    if (keys.left || touchLeft) {
        player.velX = -player.speed;
    }
    
    if (keys.right || touchRight) {
        player.velX = player.speed;
    }
}

function checkCollisions() {
    // Ломаем предыдущую красную платформу при отрыве от неё
    if (player.lastPlatform && player.lastPlatform.type === PLATFORM_TYPES.FRAGILE && player.velY < 0) {
        player.lastPlatform.broken = true;
        createParticles(player.lastPlatform.x + player.lastPlatform.width / 2, player.lastPlatform.y, COLORS.PLATFORM_FRAGILE);
        player.lastPlatform = null;
    }
    
    // Проверка столкновений только при падении
    if (player.velY > 0) {
        platforms.forEach(platform => {
            if (platform.broken) return;
            
            // Проверка пересечения
            if (player.x < platform.x + platform.width &&
                player.x + player.width > platform.x &&
                player.y + player.height > platform.y &&
                player.y + player.height < platform.y + platform.height + 10) {
                
                // Столкновение!
                if (platform.type === PLATFORM_TYPES.FRAGILE) {
                    // Не ломаем сразу, запоминаем платформу
                    player.lastPlatform = platform;
                    player.velY = JUMP_VELOCITY;
                    player.jumping = true;
                    createParticles(player.x + player.width / 2, player.y + player.height, COLORS.PLAYER);
                } else if (platform.type === PLATFORM_TYPES.SPRING) {
                    player.lastPlatform = platform;
                    player.velY = SPRING_JUMP_VELOCITY;
                    player.jumping = true;
                    createParticles(player.x + player.width / 2, player.y + player.height, COLORS.PLATFORM_SPRING);
                } else {
                    player.lastPlatform = platform;
                    player.velY = JUMP_VELOCITY;
                    player.jumping = true;
                    createParticles(player.x + player.width / 2, player.y + player.height, COLORS.PLAYER);
                }
            }
        });
    }
}

// ==================== ОТРИСОВКА ====================
function draw() {
    // Очистка canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Фон (градиент)
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, COLORS.BG_TOP);
    gradient.addColorStop(1, COLORS.BG_BOTTOM);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Отрисовка платформ
    platforms.forEach(platform => {
        if (platform.broken) return;
        
        const screenY = platform.y - cameraY;
        
        // Пропускаем невидимые платформы
        if (screenY > CANVAS_HEIGHT + 50 || screenY < -50) return;
        
        // Цвет платформы
        let color;
        switch (platform.type) {
            case PLATFORM_TYPES.NORMAL:
                color = COLORS.PLATFORM_NORMAL;
                break;
            case PLATFORM_TYPES.MOVING:
                color = COLORS.PLATFORM_MOVING;
                break;
            case PLATFORM_TYPES.FRAGILE:
                color = COLORS.PLATFORM_FRAGILE;
                break;
            case PLATFORM_TYPES.SPRING:
                color = COLORS.PLATFORM_SPRING;
                break;
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(platform.x, screenY, platform.width, platform.height);
        
        // Рамка для платформ
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, screenY, platform.width, platform.height);
        
        // Дополнительная отрисовка для пружинных платформ
        if (platform.type === PLATFORM_TYPES.SPRING) {
            ctx.fillStyle = '#6BA52E';
            ctx.fillRect(platform.x + platform.width / 2 - 5, screenY - 8, 10, 8);
        }
    });
    
    // Отрисовка игрока
    const screenY = player.y - cameraY;
    ctx.fillStyle = COLORS.PLAYER;
    ctx.fillRect(player.x, screenY, player.width, player.height);
    
    // Рамка игрока
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 3;
    ctx.strokeRect(player.x, screenY, player.width, player.height);
    
    // Глаза игрока (простая анимация)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(player.x + 12, screenY + 15, 5, 0, Math.PI * 2);
    ctx.arc(player.x + 28, screenY + 15, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x + 12, screenY + 15, 2, 0, Math.PI * 2);
    ctx.arc(player.x + 28, screenY + 15, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Отрисовка частиц
    drawParticles();
}

// ==================== ЧАСТИЦЫ ====================
function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y - cameraY,
            velX: randomRange(-3, 3),
            velY: randomRange(-5, -2),
            size: randomRange(2, 5),
            color: color,
            life: 30
        });
    }
}

function updateParticles() {
    particles.forEach(particle => {
        particle.x += particle.velX;
        particle.y += particle.velY;
        particle.velY += 0.2;
        particle.life--;
    });
    
    particles = particles.filter(p => p.life > 0);
}

function drawParticles() {
    particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / 30;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    });
    ctx.globalAlpha = 1;
}

// ==================== ОБРАБОТКА СОБЫТИЙ ====================
function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') {
        keys.left = true;
        e.preventDefault();
    }
    if (e.key === 'ArrowRight') {
        keys.right = true;
        e.preventDefault();
    }
}

function handleKeyUp(e) {
    if (e.key === 'ArrowLeft') {
        keys.left = false;
    }
    if (e.key === 'ArrowRight') {
        keys.right = false;
    }
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    
    // Определяем сторону экрана
    if (touchX < rect.width / 2) {
        touchLeft = true;
        touchRight = false;
    } else {
        touchRight = true;
        touchLeft = false;
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    touchLeft = false;
    touchRight = false;
}

// ==================== УТИЛИТЫ ====================
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

// ==================== ЗАПУСК ====================
init();
