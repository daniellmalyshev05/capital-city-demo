// effects.js

//  ЗАМЕНА ФУНКЦИИ playHurricaneEffect

function playHurricaneEffect(scene) {
    const duration = 4000;

    // --- Эффекты Затемнения и Тряски (они работают, их не трогаем) ---
    const overlay = scene.add.graphics({ fillStyle: { color: 0x000000 } })
        .fillRect(0, 0, 1080, 1920 * 1.5).setAlpha(0).setDepth(25000);
    scene.tweens.add({
        targets: overlay, alpha: 0.6, duration: duration / 2, yoyo: true, hold: duration / 2,
        onComplete: () => { overlay.destroy(); }
    });
    scene.cameras.main.shake(duration, 0.008);

    // --- НОВАЯ, ПРАВИЛЬНАЯ СИСТЕМА ЧАСТИЦ (СИНТАКСИС PHASER 3.60+) ---

    // 1. Создаем эмиттер. Метод .add.particles() теперь САМ является эмиттером.
    // Мы передаем ему текстуру и объект конфигурации.
    const emitter = scene.add.particles(
        0, 0, // Координаты X, Y не важны, так как мы используем emitZone
        'debris_particle', 
        {
            emitZone: { 
                source: new Phaser.Geom.Line(1080 + 50, 0, 1080 + 50, 1920), 
                type: 'random', 
                quantity: 20 
            },
            lifespan: duration,
            speedX: { min: -400, max: -600 },
            speedY: { min: -50, max: 50 },
            scale: { start: 1, end: 0 },
            quantity: 2,
            blendMode: 'NORMAL',
            // ВАЖНО: Мы не используем .startFollow(), так как это может быть нестабильно.
            // Вместо этого мы "приклеиваем" эмиттер к камере.
            scrollFactorX: 0,
            scrollFactorY: 0
        }
    );

    // 2. Устанавливаем глубину для всего эмиттера
    emitter.setDepth(25500);

    // 3. Уничтожаем эмиттер после завершения эффекта.
    scene.time.delayedCall(duration, () => {
        emitter.destroy();
    });
}


function playPhishingEffect(scene) {
    const duration = 2000;

    // 1. Красное мигание
    const overlay = scene.add.graphics({ fillStyle: { color: 0xff0000 } })
        .fillRect(0, 0, scene.sys.game.config.width, scene.sys.game.config.height * 1.5)
        .setAlpha(0)
        .setDepth(25000);

    scene.tweens.add({
        targets: overlay,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 5,
        onComplete: () => {
            overlay.destroy();
        }
    });
    
    // 2. Тряска камеры
    scene.cameras.main.shake(100, 0.02);
    scene.time.delayedCall(500, () => scene.cameras.main.shake(100, 0.02));

    // 3. Эффект "цифровых помех"

    const scanlines = scene.add.image(0, 0, 'scanlines_texture')
        .setOrigin(0,0)
        .setAlpha(0.2)
        .setDepth(26000);

    scene.tweens.add({
        targets: scanlines,
        alpha: 0,
        duration: 50,
        yoyo: true,
        repeat: duration / 50,
        onComplete: () => {
            scanlines.destroy();
        }
    });
}