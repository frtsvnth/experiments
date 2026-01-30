const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

/**
 * Функция для рисования закругленного прямоугольника
 */
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Основная функция рисования иконки
 */
function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Очистка canvas
  ctx.clearRect(0, 0, size, size);

  // Фон с радиальным градиентом
  const bgGradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size * 0.7
  );
  bgGradient.addColorStop(0, '#1a1a2e');
  bgGradient.addColorStop(1, '#16213e');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, size, size);

  // Параметры блоков
  const blockHeight = size * 0.16; // ~16% от высоты
  const borderRadius = size * 0.04; // Закругление углов
  const stackStartY = size * 0.35; // Начало стопки (чуть ниже центра)
  const spacing = size * 0.02; // Расстояние между блоками для тени

  // Блоки (снизу вверх)
  const blocks = [
    {
      width: size * 0.70,
      color1: '#667eea',
      color2: '#764ba2',
      y: stackStartY + blockHeight * 2 + spacing * 2
    },
    {
      width: size * 0.58,
      color1: '#4ecca3',
      color2: '#45B7D1',
      y: stackStartY + blockHeight + spacing
    },
    {
      width: size * 0.46,
      color1: '#f093fb',
      color2: '#f5576c',
      y: stackStartY
    }
  ];

  // Рисуем блоки снизу вверх
  blocks.reverse().forEach((block) => {
    const x = (size - block.width) / 2;
    
    // Тень
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = size * 0.03;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = size * 0.01;

    // Градиент для блока
    const gradient = ctx.createLinearGradient(x, block.y, x + block.width, block.y);
    gradient.addColorStop(0, block.color1);
    gradient.addColorStop(1, block.color2);

    // Рисуем закругленный прямоугольник
    ctx.fillStyle = gradient;
    roundRect(ctx, x, block.y, block.width, blockHeight, borderRadius);
    ctx.fill();

    // Добавляем блик на верхней части блока
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    const highlightGradient = ctx.createLinearGradient(x, block.y, x, block.y + blockHeight * 0.3);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlightGradient;
    roundRect(ctx, x, block.y, block.width, blockHeight * 0.3, borderRadius);
    ctx.fill();
  });

  // Сброс тени
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  return canvas;
}

// Генерация обеих иконок
console.log('\n🎨 Начинаем генерацию иконок для Tap & Stack...\n');

const sizes = [192, 512];
sizes.forEach(size => {
  const canvas = drawIcon(size);
  const buffer = canvas.toBuffer('image/png');
  const filename = `icon-${size}.png`;
  fs.writeFileSync(path.join(__dirname, filename), buffer);
  console.log(`✅ Создана иконка: ${filename}`);
});

console.log('\n🎉 Все иконки успешно сгенерированы!\n');
