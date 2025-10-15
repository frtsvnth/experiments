class PostcardGenerator {
    constructor() {
        this.form = document.getElementById('postcardForm');
        this.backgroundsSection = document.getElementById('backgroundsSection');
        this.previewSection = document.getElementById('previewSection');
        this.loading = document.getElementById('loading');
        this.backgroundsGrid = document.getElementById('backgroundsGrid');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.newPostcardBtn = document.getElementById('newPostcardBtn');
        
        // Новые элементы для настроек
        this.backgroundSettings = document.getElementById('backgroundSettings');
        this.previewBackgroundBtn = document.getElementById('previewBackgroundBtn');
        this.generateCustomBackgroundsBtn = document.getElementById('generateCustomBackgroundsBtn');
        this.backgroundPreview = document.getElementById('backgroundPreview');
        this.previewCanvasSmall = document.getElementById('previewCanvas');
        
        this.generatedBackgrounds = [];
        this.selectedBackground = null;
        this.formData = {};
        
        // Настройки генерации фонов
        this.colorSchemes = this.initColorSchemes();
        this.emojiStyles = this.initEmojiStyles();
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.downloadBtn.addEventListener('click', () => this.downloadPostcard());
        this.newPostcardBtn.addEventListener('click', () => this.resetForm());
        
        // Новые обработчики для настроек фона
        this.previewBackgroundBtn.addEventListener('click', () => this.previewBackground());
        this.generateCustomBackgroundsBtn.addEventListener('click', () => this.generateCustomBackgrounds());
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        // Собираем данные формы
        this.formData = {
            recipient: document.getElementById('recipient').value,
            sender: document.getElementById('sender').value,
            message: document.getElementById('message').value
        };
        
        // Показываем секцию настроек фона
        this.backgroundSettings.style.display = 'block';
        this.backgroundSettings.scrollIntoView({ behavior: 'smooth' });
    }
    
    initColorSchemes() {
        return {
            vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
            pastel: ['#FFB6C1', '#87CEEB', '#DDA0DD', '#F0E68C', '#98FB98', '#F5DEB3'],
            monochrome: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#ECF0F1'],
            rainbow: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082'],
            autumn: ['#D2691E', '#CD853F', '#F4A460', '#DEB887', '#D2B48C', '#BC8F8F'],
            winter: ['#B0E0E6', '#E0FFFF', '#F0F8FF', '#F5F5DC', '#E6E6FA', '#FFFAF0']
        };
    }
    
    initEmojiStyles() {
        return {
            celebration: ['🎊', '🎉', '🎈', '🎁', '🎂', '🎃', '🎄', '🎆'],
            nature: ['🌸', '🌺', '🌻', '🌷', '🌿', '🍀', '🌱', '🌾'],
            hearts: ['❤️', '💕', '💖', '💗', '💘', '💙', '💚', '💛'],
            stars: ['⭐', '🌟', '✨', '💫', '🌠', '🔆', '🔅', '☀️'],
            flowers: ['🌺', '🌸', '🌻', '🌷', '🌹', '🌼', '🏵️', '🥀'],
            animals: ['🐾', '🐱', '🐶', '🐰', '🐻', '🐼', '🦊', '🐸']
        };
    }
    
    async generateBackgrounds() {
        // Загружаем предзаготовленные фоновые изображения
        this.generatedBackgrounds = [];
        
        for (let i = 1; i <= 8; i++) {
            try {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = `images/background-${i}.jpg`;
                });
                
                // Создаем canvas для обработки изображения
                const canvas = document.createElement('canvas');
                canvas.width = 800;
                canvas.height = 600;
                const ctx = canvas.getContext('2d');
                
                // Рисуем изображение на canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                this.generatedBackgrounds.push({
                    id: i - 1,
                    dataUrl: dataUrl,
                    name: `Фон ${i}`
                });
                
            } catch (error) {
                console.warn(`Не удалось загрузить background-${i}.jpg, создаем локальный фон`);
                // Создаем локальный фон если изображение не найдено
                this.createSingleBackground(i - 1);
            }
        }
        
        // Если ни одно изображение не загрузилось, создаем все локально
        if (this.generatedBackgrounds.length === 0) {
            this.createLocalBackgrounds();
        }
    }
    
    createSingleBackground(index) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        const backgrounds = [
            '🎊', '🎉', '🎈', '🎁', '🎂', '🎃', '🎄', '🎆'
        ];
        
        // Создаем градиентный фон
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, this.getRandomColor());
        gradient.addColorStop(1, this.getRandomColor());
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Добавляем декоративные элементы
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = 'bold 120px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(backgrounds[index], canvas.width / 2, canvas.height / 2);
        
        // Добавляем дополнительные декоративные элементы
        for (let j = 0; j < 20; j++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
            ctx.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 50 + 10,
                Math.random() * 50 + 10
            );
        }
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        this.generatedBackgrounds.push({
            id: index,
            dataUrl: dataUrl,
            emoji: backgrounds[index],
            name: `Фон ${index + 1}`
        });
    }
    
    createLocalBackgrounds() {
        this.generatedBackgrounds = [];
        
        for (let i = 0; i < 8; i++) {
            this.createSingleBackground(i);
        }
    }
    
    previewBackground() {
        const settings = this.getBackgroundSettings();
        const canvas = this.previewCanvasSmall;
        const ctx = canvas.getContext('2d');
        
        // Очищаем canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Создаем фон
        this.createBackgroundWithSettings(ctx, canvas.width, canvas.height, settings, 0);
        
        // Показываем предварительный просмотр
        this.backgroundPreview.style.display = 'block';
        this.backgroundPreview.scrollIntoView({ behavior: 'smooth' });
    }
    
    async generateCustomBackgrounds() {
        // Показываем секцию выбора фона и загрузку
        this.backgroundsSection.style.display = 'block';
        this.loading.style.display = 'block';
        this.backgroundsGrid.innerHTML = '';
        
        // Скрываем настройки
        this.backgroundSettings.style.display = 'none';
        
        try {
            // Генерируем фоны с текущими настройками
            await this.generateCustomBackgroundsWithSettings();
            
            // Скрываем загрузку и показываем сгенерированные фоны
            this.loading.style.display = 'none';
            this.displayBackgrounds();
            
        } catch (error) {
            console.error('Ошибка при генерации фонов:', error);
            this.showError('Произошла ошибка при генерации фонов. Попробуйте еще раз.');
        }
    }
    
    getBackgroundSettings() {
        return {
            colorScheme: document.getElementById('colorScheme').value,
            emojiStyle: document.getElementById('emojiStyle').value,
            backgroundStyle: document.getElementById('backgroundStyle').value,
            borderStyle: document.getElementById('borderStyle').value
        };
    }
    
    async generateCustomBackgroundsWithSettings() {
        const settings = this.getBackgroundSettings();
        this.generatedBackgrounds = [];
        
        const emojis = this.emojiStyles[settings.emojiStyle];
        const colors = this.colorSchemes[settings.colorScheme];
        
        for (let i = 0; i < 8; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            
            // Создаем фон с настройками
            this.createBackgroundWithSettings(ctx, canvas.width, canvas.height, settings, i, emojis, colors);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            this.generatedBackgrounds.push({
                id: i,
                dataUrl: dataUrl,
                name: `Фон ${i + 1}`,
                emoji: emojis[i % emojis.length]
            });
        }
    }
    
    createBackgroundWithSettings(ctx, width, height, settings, index, emojis, colors) {
        const emojiList = emojis || this.emojiStyles[settings.emojiStyle];
        const colorList = colors || this.colorSchemes[settings.colorScheme];
        
        // Создаем фон в зависимости от стиля
        switch (settings.backgroundStyle) {
            case 'gradient':
                this.createGradientBackground(ctx, width, height, colorList, index);
                break;
            case 'geometric':
                this.createGeometricBackground(ctx, width, height, colorList, index);
                break;
            case 'organic':
                this.createOrganicBackground(ctx, width, height, colorList, index);
                break;
            case 'minimal':
                this.createMinimalBackground(ctx, width, height, colorList, index);
                break;
        }
        
        // Добавляем основной эмодзи
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = 'bold 120px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(emojiList[index % emojiList.length], width / 2, height / 2);
        
        // Добавляем декоративные элементы
        this.addDecorativeElements(ctx, width, height, settings, index);
        
        // Добавляем рамку
        this.addBorder(ctx, width, height, settings);
    }
    
    createGradientBackground(ctx, width, height, colors, index) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        const color1 = colors[index % colors.length];
        const color2 = colors[(index + 1) % colors.length];
        
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }
    
    createGeometricBackground(ctx, width, height, colors, index) {
        // Базовый цвет
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(0, 0, width, height);
        
        // Геометрические фигуры
        for (let i = 0; i < 15; i++) {
            ctx.fillStyle = colors[(index + i) % colors.length] + '80'; // 50% прозрачность
            ctx.beginPath();
            
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 100 + 50;
            
            if (i % 3 === 0) {
                // Треугольник
                ctx.moveTo(x, y);
                ctx.lineTo(x + size, y);
                ctx.lineTo(x + size/2, y + size);
                ctx.closePath();
            } else if (i % 3 === 1) {
                // Круг
                ctx.arc(x, y, size/2, 0, Math.PI * 2);
            } else {
                // Прямоугольник
                ctx.rect(x, y, size, size);
            }
            ctx.fill();
        }
    }
    
    createOrganicBackground(ctx, width, height, colors, index) {
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        gradient.addColorStop(0, colors[index % colors.length]);
        gradient.addColorStop(1, colors[(index + 1) % colors.length]);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Органические формы
        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = colors[(index + i) % colors.length] + '60';
            ctx.beginPath();
            
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 80 + 20;
            
            // Создаем органические формы
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Добавляем волны
            if (i % 4 === 0) {
                ctx.strokeStyle = colors[(index + i) % colors.length] + '40';
                ctx.lineWidth = 3;
                ctx.beginPath();
                for (let j = 0; j < 10; j++) {
                    const waveX = x + (j - 5) * 20;
                    const waveY = y + Math.sin(j * 0.5) * 30;
                    if (j === 0) {
                        ctx.moveTo(waveX, waveY);
                    } else {
                        ctx.lineTo(waveX, waveY);
                    }
                }
                ctx.stroke();
            }
        }
    }
    
    createMinimalBackground(ctx, width, height, colors, index) {
        // Простой градиент
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, colors[index % colors.length]);
        gradient.addColorStop(1, colors[(index + 1) % colors.length]);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Минималистичные элементы
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = colors[(index + i) % colors.length] + '30';
            ctx.beginPath();
            ctx.arc(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 60 + 20,
                0, Math.PI * 2
            );
            ctx.fill();
        }
    }
    
    addDecorativeElements(ctx, width, height, settings, index) {
        // Добавляем декоративные элементы в зависимости от стиля
        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.1})`;
            
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 40 + 10;
            
            if (settings.backgroundStyle === 'geometric') {
                // Геометрические формы
                if (Math.random() > 0.5) {
                    ctx.fillRect(x, y, size, size);
                } else {
                    ctx.beginPath();
                    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                // Органические формы
                ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    addBorder(ctx, width, height, settings) {
        switch (settings.borderStyle) {
            case 'simple':
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 8;
                ctx.strokeRect(15, 15, width - 30, height - 30);
                break;
            case 'double':
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 8;
                ctx.strokeRect(15, 15, width - 30, height - 30);
                
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 3;
                ctx.strokeRect(30, 30, width - 60, height - 60);
                break;
            case 'decorative':
                // Декоративная рамка с углами
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 6;
                
                // Основная рамка
                ctx.strokeRect(20, 20, width - 40, height - 40);
                
                // Декоративные углы
                ctx.lineWidth = 4;
                const cornerSize = 30;
                
                // Левый верхний угол
                ctx.beginPath();
                ctx.moveTo(20, 20 + cornerSize);
                ctx.lineTo(20, 20);
                ctx.lineTo(20 + cornerSize, 20);
                ctx.stroke();
                
                // Правый верхний угол
                ctx.beginPath();
                ctx.moveTo(width - 20 - cornerSize, 20);
                ctx.lineTo(width - 20, 20);
                ctx.lineTo(width - 20, 20 + cornerSize);
                ctx.stroke();
                
                // Левый нижний угол
                ctx.beginPath();
                ctx.moveTo(20, height - 20 - cornerSize);
                ctx.lineTo(20, height - 20);
                ctx.lineTo(20 + cornerSize, height - 20);
                ctx.stroke();
                
                // Правый нижний угол
                ctx.beginPath();
                ctx.moveTo(width - 20 - cornerSize, height - 20);
                ctx.lineTo(width - 20, height - 20);
                ctx.lineTo(width - 20, height - 20 - cornerSize);
                ctx.stroke();
                break;
        }
    }
    
    getRandomColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
            '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    displayBackgrounds() {
        this.backgroundsGrid.innerHTML = '';
        
        this.generatedBackgrounds.forEach((background, index) => {
            const backgroundItem = document.createElement('div');
            backgroundItem.className = 'background-item';
            backgroundItem.innerHTML = `
                <img src="${background.dataUrl}" alt="Фон ${index + 1}">
                <div class="overlay">Фон ${index + 1}</div>
            `;
            
            backgroundItem.addEventListener('click', () => this.selectBackground(background, backgroundItem));
            this.backgroundsGrid.appendChild(backgroundItem);
        });
    }
    
    selectBackground(background, element) {
        // Убираем выделение с предыдущего элемента
        document.querySelectorAll('.background-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Выделяем текущий элемент
        element.classList.add('selected');
        this.selectedBackground = background;
        
        // Показываем секцию предварительного просмотра
        this.previewSection.style.display = 'block';
        
        // Создаем предварительный просмотр
        this.createPreview();
    }
    
    createPreview() {
        if (!this.selectedBackground) return;
        
        const canvas = this.previewCanvas;
        const ctx = canvas.getContext('2d');
        
        // Устанавливаем размеры canvas
        canvas.width = 800;
        canvas.height = 600;
        
        // Создаем изображение из dataUrl
        const img = new Image();
        img.onload = () => {
            // Рисуем фоновое изображение
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Добавляем текст поздравления
            this.addTextToCanvas(ctx);
            
            // Прокручиваем к предварительному просмотру
            this.previewSection.scrollIntoView({ behavior: 'smooth' });
        };
        img.src = this.selectedBackground.dataUrl;
    }
    
    addTextToCanvas(ctx) {
        const { recipient, sender, message } = this.formData;
        
        // Настройки шрифта
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        
        // Заголовок "Кому"
        ctx.font = 'bold 32px Arial';
        ctx.strokeText(`Дорогому(ой) ${recipient}!`, canvas.width / 2, 100);
        ctx.fillText(`Дорогому(ой) ${recipient}!`, canvas.width / 2, 100);
        
        // Текст поздравления
        ctx.font = '24px Arial';
        const words = message.split(' ');
        let line = '';
        let y = 200;
        const maxWidth = canvas.width - 100;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && i > 0) {
                ctx.strokeText(line, canvas.width / 2, y);
                ctx.fillText(line, canvas.width / 2, y);
                line = words[i] + ' ';
                y += 35;
            } else {
                line = testLine;
            }
        }
        ctx.strokeText(line, canvas.width / 2, y);
        ctx.fillText(line, canvas.width / 2, y);
        
        // Подпись "От кого"
        y += 80;
        ctx.font = 'bold 28px Arial';
        ctx.strokeText(`С любовью, ${sender}`, canvas.width / 2, y);
        ctx.fillText(`С любовью, ${sender}`, canvas.width / 2, y);
        
        // Декоративные элементы
        ctx.font = '60px Arial';
        ctx.strokeText('🎉', canvas.width / 2 - 100, y + 50);
        ctx.fillText('🎉', canvas.width / 2 - 100, y + 50);
        
        ctx.strokeText('🎊', canvas.width / 2 + 100, y + 50);
        ctx.fillText('🎊', canvas.width / 2 + 100, y + 50);
    }
    
    downloadPostcard() {
        if (!this.selectedBackground) return;
        
        // Создаем новый canvas для финальной открытки
        const downloadCanvas = document.createElement('canvas');
        downloadCanvas.width = 800;
        downloadCanvas.height = 600;
        const downloadCtx = downloadCanvas.getContext('2d');
        
        // Создаем изображение из выбранного фона
        const img = new Image();
        img.onload = () => {
            // Рисуем фоновое изображение
            downloadCtx.drawImage(img, 0, 0, downloadCanvas.width, downloadCanvas.height);
            
            // Добавляем текст поздравления
            this.addTextToCanvas(downloadCtx, downloadCanvas.width, downloadCanvas.height);
            
            // Создаем ссылку для скачивания
            const link = document.createElement('a');
            link.download = `открытка_${this.formData.recipient}_${new Date().toISOString().split('T')[0]}.jpg`;
            link.href = downloadCanvas.toDataURL('image/jpeg', 0.9);
            
            // Запускаем скачивание
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Показываем уведомление об успешном скачивании
            this.showSuccess('Открытка успешно скачана!');
        };
        img.src = this.selectedBackground.dataUrl;
    }
    
    resetForm() {
        // Сбрасываем форму
        this.form.reset();
        
        // Скрываем все секции
        this.backgroundSettings.style.display = 'none';
        this.backgroundsSection.style.display = 'none';
        this.previewSection.style.display = 'none';
        this.backgroundPreview.style.display = 'none';
        
        // Очищаем данные
        this.generatedBackgrounds = [];
        this.selectedBackground = null;
        this.formData = {};
        
        // Прокручиваем к началу формы
        this.form.scrollIntoView({ behavior: 'smooth' });
    }
    
    showError(message) {
        alert('Ошибка: ' + message);
    }
    
    showSuccess(message) {
        // Создаем временное уведомление об успехе
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            font-weight: 500;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Убираем уведомление через 3 секунды
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
}

// Инициализируем приложение после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new PostcardGenerator();
});
