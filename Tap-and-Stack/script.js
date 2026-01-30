// Константы игровых состояний
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'game_over'
};

// Глобальные переменные
let canvas, ctx;
let gameState = GAME_STATES.MENU;
let score = 0;
let highScore = 0;
let blocks = [];
let currentBlock = null;
let blockSpeed = 3;
let blockDirection = 1;
let animationId = null;

// Константы canvas
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 800;

// Константы блоков
const BASE_BLOCK_WIDTH = 100;
const BASE_BLOCK_HEIGHT = 30;
const BLOCK_START_Y = 700;

// Элементы DOM
let menuScreen, gameOverScreen, playButton, restartButton, menuButton;
let highScoreDisplay, finalScore, finalHighScore;

// Инициализация игры
function init() {
    // Получаем canvas и контекст
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Настраиваем canvas для ретина-дисплеев
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width = CANVAS_WIDTH + 'px';
    canvas.style.height = CANVAS_HEIGHT + 'px';
    ctx.scale(dpr, dpr);
    
    // Адаптируем размер canvas под экран
    resizeCanvas();
    
    // Получаем элементы DOM
    menuScreen = document.getElementById('menuScreen');
    gameOverScreen = document.getElementById('gameOverScreen');
    playButton = document.getElementById('playButton');
    restartButton = document.getElementById('restartButton');
    menuButton = document.getElementById('menuButton');
    highScoreDisplay = document.getElementById('highScoreDisplay');
    finalScore = document.getElementById('finalScore');
    finalHighScore = document.getElementById('finalHighScore');
    
    // Загружаем рекорд из localStorage
    highScore = parseInt(localStorage.getItem('tapStackHighScore')) || 0;
    highScoreDisplay.textContent = highScore;
    
    // Устанавливаем начальный экран
    showScreen(GAME_STATES.MENU);
    
    // Добавляем обработчики событий
    playButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    menuButton.addEventListener('click', showMenu);
    
    // Обработчики для тапов по canvas
    canvas.addEventListener('touchstart', handleTap);
    canvas.addEventListener('click', handleTap);
    
    // Обработчик изменения размера окна
    window.addEventListener('resize', resizeCanvas);
    
    // Регистрируем Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(err => {
            console.log('Service Worker регистрация не удалась:', err);
        });
    }
}

// Адаптация размера canvas
function resizeCanvas() {
    const maxWidth = window.innerWidth * 0.95;
    const maxHeight = window.innerHeight * 0.95;
    const scale = Math.min(maxWidth / CANVAS_WIDTH, maxHeight / CANVAS_HEIGHT, 1);
    
    canvas.style.width = (CANVAS_WIDTH * scale) + 'px';
    canvas.style.height = (CANVAS_HEIGHT * scale) + 'px';
}

// Показать экран
function showScreen(screen) {
    // Скрываем все экраны
    menuScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    canvas.style.display = 'none';
    
    // Показываем нужный экран
    if (screen === GAME_STATES.MENU) {
        menuScreen.classList.add('active');
    } else if (screen === GAME_STATES.PLAYING) {
        canvas.style.display = 'block';
    } else if (screen === GAME_STATES.GAME_OVER) {
        gameOverScreen.classList.add('active');
    }
}

// Показать меню
function showMenu() {
    gameState = GAME_STATES.MENU;
    showScreen(GAME_STATES.MENU);
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// Начало игры
function startGame() {
    resetGame();
    gameState = GAME_STATES.PLAYING;
    showScreen(GAME_STATES.PLAYING);
    
    // Создаём базовый блок
    const baseBlock = {
        x: CANVAS_WIDTH / 2 - BASE_BLOCK_WIDTH / 2,
        y: BLOCK_START_Y,
        width: BASE_BLOCK_WIDTH,
        height: BASE_BLOCK_HEIGHT,
        color: '#4ecca3'
    };
    blocks.push(baseBlock);
    
    // Создаём первый движущийся блок
    spawnNextBlock();
    
    // Запускаем игровой цикл
    gameLoop();
}

// Сброс игры
function resetGame() {
    score = 0;
    blocks = [];
    currentBlock = null;
    blockSpeed = 3;
    blockDirection = 1;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// Создание следующего блока
function spawnNextBlock() {
    const lastBlock = blocks[blocks.length - 1];
    const newY = lastBlock.y - BASE_BLOCK_HEIGHT - 5;
    
    currentBlock = {
        x: 0,
        y: newY,
        width: lastBlock.width,
        height: BASE_BLOCK_HEIGHT,
        moving: true
    };
    
    // Увеличиваем скорость с каждым уровнем
    blockSpeed = Math.min(3 + score * 0.1, 8);
}

// Обработка тапа
function handleTap(e) {
    e.preventDefault();
    
    if (gameState === GAME_STATES.PLAYING && currentBlock && currentBlock.moving) {
        dropBlock();
        
        // Вибрация
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
}

// Падение блока
function dropBlock() {
    currentBlock.moving = false;
    
    const lastBlock = blocks[blocks.length - 1];
    const isColliding = checkCollision(currentBlock, lastBlock);
    
    if (isColliding) {
        // Вычисляем overlap
        const currentCenter = currentBlock.x + currentBlock.width / 2;
        const lastCenter = lastBlock.x + lastBlock.width / 2;
        const overlap = Math.abs(currentCenter - lastCenter);
        
        // Проверяем perfect hit
        const isPerfect = overlap <= 5;
        
        if (isPerfect) {
            // Бонус за идеальное попадание
            score += 10;
            createParticles(currentCenter, currentBlock.y, '#FFD700');
        } else {
            score += 1;
        }
        
        // Обрезаем блок по overlap
        const leftEdge = Math.max(currentBlock.x, lastBlock.x);
        const rightEdge = Math.min(
            currentBlock.x + currentBlock.width,
            lastBlock.x + lastBlock.width
        );
        
        currentBlock.x = leftEdge;
        currentBlock.width = rightEdge - leftEdge;
        currentBlock.y = lastBlock.y - BASE_BLOCK_HEIGHT;
        
        // Добавляем блок в стек
        blocks.push(currentBlock);
        
        // Создаём частицы
        createParticles(currentCenter, currentBlock.y, '#4ecca3');
        
        // Создаём следующий блок
        spawnNextBlock();
    } else {
        // Game Over
        gameOver();
    }
}

// Проверка столкновения
function checkCollision(block1, block2) {
    return !(
        block1.x + block1.width < block2.x ||
        block1.x > block2.x + block2.width
    );
}

// Система частиц
let particles = [];

function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 30,
            color: color,
            size: Math.random() * 4 + 2
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // гравитация
        p.life--;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// Конец игры
function gameOver() {
    gameState = GAME_STATES.GAME_OVER;
    
    // Обновляем рекорд
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('tapStackHighScore', highScore);
    }
    
    // Обновляем UI
    finalScore.textContent = score;
    finalHighScore.textContent = highScore;
    highScoreDisplay.textContent = highScore;
    
    // Показываем экран Game Over
    setTimeout(() => {
        showScreen(GAME_STATES.GAME_OVER);
    }, 500);
}

// Основной игровой цикл
function gameLoop() {
    if (gameState !== GAME_STATES.PLAYING) return;
    
    update();
    draw();
    
    animationId = requestAnimationFrame(gameLoop);
}

// Обновление логики
function update() {
    // Обновляем движущийся блок
    if (currentBlock && currentBlock.moving) {
        currentBlock.x += blockSpeed * blockDirection;
        
        // Отскок от краёв
        if (currentBlock.x <= 0) {
            currentBlock.x = 0;
            blockDirection = 1;
        } else if (currentBlock.x + currentBlock.width >= CANVAS_WIDTH) {
            currentBlock.x = CANVAS_WIDTH - currentBlock.width;
            blockDirection = -1;
        }
    }
    
    // Обновляем частицы
    updateParticles();
}

// Отрисовка
function draw() {
    // Очищаем canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Рисуем фон
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0f0f1e');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Рисуем блоки
    blocks.forEach((block, index) => {
        const blockGradient = ctx.createLinearGradient(
            block.x,
            block.y,
            block.x + block.width,
            block.y + block.height
        );
        
        // Плавный переход цветов от основания к верху
        const hue = 170 - index * 3;
        blockGradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`);
        blockGradient.addColorStop(1, `hsl(${hue - 20}, 70%, 50%)`);
        
        ctx.fillStyle = blockGradient;
        ctx.fillRect(block.x, block.y, block.width, block.height);
        
        // Контур блока
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(block.x, block.y, block.width, block.height);
    });
    
    // Рисуем движущийся блок
    if (currentBlock && currentBlock.moving) {
        const blockGradient = ctx.createLinearGradient(
            currentBlock.x,
            currentBlock.y,
            currentBlock.x + currentBlock.width,
            currentBlock.y + currentBlock.height
        );
        blockGradient.addColorStop(0, '#4ecca3');
        blockGradient.addColorStop(1, '#0be881');
        
        ctx.fillStyle = blockGradient;
        ctx.fillRect(currentBlock.x, currentBlock.y, currentBlock.width, currentBlock.height);
        
        // Контур
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(currentBlock.x, currentBlock.y, currentBlock.width, currentBlock.height);
    }
    
    // Рисуем частицы
    drawParticles();
    
    // Рисуем счёт
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(score, CANVAS_WIDTH / 2, 60);
    
    // Тень для текста
    ctx.shadowColor = 'rgba(78, 204, 163, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText(score, CANVAS_WIDTH / 2, 60);
    ctx.shadowBlur = 0;
    
    // Подсказка
    if (blocks.length === 1 && currentBlock) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '20px sans-serif';
        ctx.fillText('Нажми, чтобы сложить!', CANVAS_WIDTH / 2, 150);
    }
}

// Запускаем инициализацию при загрузке страницы
window.addEventListener('load', init);
