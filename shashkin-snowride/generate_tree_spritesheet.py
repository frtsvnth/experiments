#!/usr/bin/env python3
"""
Генератор тестового спрайтшита дерева для SnowRide
Создает простой 4x4 спрайтшит с базовой анимацией дерева
"""

from PIL import Image, ImageDraw
import math

def create_tree_spritesheet():
    # Параметры спрайтшита
    cols, rows = 4, 4
    frame_width, frame_height = 64, 64
    total_width = cols * frame_width
    total_height = rows * frame_height
    
    # Создаем новое изображение с прозрачностью
    img = Image.new('RGBA', (total_width, total_height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Цвета
    trunk_color = '#8B4513'  # Коричневый ствол
    foliage_color = '#228B22'  # Зеленая листва
    shadow_color = '#1B5E20'  # Темная тень
    
    for row in range(rows):
        for col in range(cols):
            frame_num = row * cols + col
            x = col * frame_width
            y = row * frame_height
            
            # Вычисляем фазу анимации (0-1)
            phase = frame_num / (cols * rows - 1)
            
            # Анимация покачивания (смещение и поворот)
            sway = math.sin(phase * math.pi * 2) * 3  # Покачивание
            scale = 1.0 + math.sin(phase * math.pi * 4) * 0.05  # Легкое изменение размера
            
            # Рисуем тень дерева
            shadow_offset = 2
            shadow_width = int(20 * scale)
            shadow_height = int(8 * scale)
            shadow_x = int(x + frame_width/2 + sway + shadow_offset)
            shadow_y = int(y + frame_height - 10)
            
            draw.ellipse([
                shadow_x - shadow_width//2, 
                shadow_y - shadow_height//2,
                shadow_x + shadow_width//2, 
                shadow_y + shadow_height//2
            ], fill=(0, 0, 0, 50))
            
            # Рисуем ствол
            trunk_width = int(6 * scale)
            trunk_height = int(20 * scale)
            trunk_x = int(x + frame_width/2 + sway - trunk_width//2)
            trunk_y = int(y + frame_height - trunk_height - 5)
            
            draw.rectangle([
                trunk_x, trunk_y,
                trunk_x + trunk_width, trunk_y + trunk_height
            ], fill=trunk_color)
            
            # Рисуем листву (несколько слоев для объема)
            foliage_y = trunk_y - int(5 * scale)
            
            # Основная крона
            foliage_width = int(24 * scale)
            foliage_height = int(16 * scale)
            foliage_x = int(x + frame_width/2 + sway - foliage_width//2)
            
            draw.ellipse([
                foliage_x, foliage_y,
                foliage_x + foliage_width, foliage_y + foliage_height
            ], fill=foliage_color)
            
            # Верхний слой
            top_width = int(18 * scale)
            top_height = int(12 * scale)
            top_x = int(x + frame_width/2 + sway - top_width//2)
            top_y = foliage_y - int(3 * scale)
            
            draw.ellipse([
                top_x, top_y,
                top_x + top_width, top_y + top_height
            ], fill=foliage_color)
            
            # Боковые ветви
            branch_width = int(14 * scale)
            branch_height = int(10 * scale)
            
            # Левая ветвь
            left_x = foliage_x - int(6 * scale)
            left_y = foliage_y + int(2 * scale)
            draw.ellipse([
                left_x, left_y,
                left_x + branch_width, left_y + branch_height
            ], fill=foliage_color)
            
            # Правая ветвь  
            right_x = foliage_x + foliage_width - int(8 * scale)
            right_y = foliage_y + int(2 * scale)
            draw.ellipse([
                right_x, right_y,
                right_x + branch_width, right_y + branch_height
            ], fill=foliage_color)
            
            # Добавляем детали (снег на ветвях зимой)
            if frame_num % 2 == 0:  # Четные кадры
                snow_color = '#FFFFFF'
                # Небольшие снежинки на ветвях
                for i in range(3):
                    snow_x = int(x + frame_width/2 + sway + (i-1) * 8)
                    snow_y = int(foliage_y + i * 4)
                    draw.ellipse([
                        snow_x-1, snow_y-1,
                        snow_x+1, snow_y+1
                    ], fill=snow_color)
    
    return img

def main():
    print("🌲 Генерация тестового спрайтшита дерева...")
    
    # Создаем спрайтшит
    spritesheet = create_tree_spritesheet()
    
    # Сохраняем файл
    output_file = "tree-sheet.png"
    spritesheet.save(output_file, "PNG")
    
    print(f"✅ Спрайтшит создан: {output_file}")
    print(f"📐 Размер: {spritesheet.size[0]}x{spritesheet.size[1]} пикселей")
    print(f"🎬 Кадров: 4x4 = 16 кадров")
    print("\n📋 Инструкция:")
    print("1. Поместите tree-sheet.png в папку assets/")
    print("2. Или рядом с index.html")
    print("3. Запустите игру - деревья будут анимироваться!")
    print("\n💡 Это тестовый спрайтшит. Для лучшего результата")
    print("   создайте собственный спрайтшит с более детальной анимацией.")

if __name__ == "__main__":
    main()