// main.js - ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ

// --- 1. ГЛОБАЛЬНЫЕ НАСТРОЙКИ ---
const SCREEN_WIDTH = 1080; const TILES_PER_ROW = 5; const HORIZONTAL_PADDING = 30;
const TILE_SIZE = (SCREEN_WIDTH - (HORIZONTAL_PADDING * 2)) / TILES_PER_ROW;

Map.prototype.hasValue = function(value) {
    for (let v of this.values()) {
        if (v === value) return true;
    }
    return false;
};

// --- 2. ОСНОВНАЯ ИГРОВАЯ СЦЕНА ---
class MainScene extends Phaser.Scene {
    
    constructor() { super({ key: 'MainScene' }); }

    preload() {
        this.load.image('grass', 'assets/grass_tile.png'); this.load.image('slot', 'assets/slot_tile.png');
        this.load.image('road_h', 'assets/road_h_tile.png'); this.load.image('road_v', 'assets/road_v_tile.png');
        this.load.image('bank', 'assets/bank_tile.png'); this.load.image('residence', 'assets/residence_tile.png');
        this.load.image('close_button', 'assets/close_button.png');
        this.load.image('investment', 'assets/investment_tile.png');
        this.load.image('mall', 'assets/mall_tile.png');
        this.load.image('insurance', 'assets/insurance_tile.png');
        this.load.image('cyber', 'assets/cyber_tile.png');
        // апргрейды
        this.load.image('bank_lvl2', 'assets/bank_lvl2_tile.png');
        this.load.image('residence_lvl2', 'assets/residence_lvl2_tile.png');
        this.load.image('investment_lvl2', 'assets/investment_lvl2_tile.png');
        this.load.image('mall_lvl2', 'assets/mall_lvl2_tile.png');
        this.load.image('insurance_lvl2', 'assets/insurance_lvl2_tile.png');
        this.load.image('cyber_lvl2', 'assets/cyber_lvl2_tile.png');

        this.load.image('quiz_icon', 'assets/quiz_icon.png');

        this.load.image('tree', 'assets/tree.png');
        this.load.image('pond', 'assets/pond.png');
        this.load.image('flowers', 'assets/flowers.png');
        this.load.image('fir_tree', 'assets/fir_tree.png');
        this.load.image('bush', 'assets/bush.png');
        this.load.image('bench', 'assets/bench.png');
        this.load.image('lamppost', 'assets/lamppost.png');
        this.load.image('playground', 'assets/playground.png');

        this.load.image('build_icon', 'assets/build_icon.png');

        this.load.image('factory_tile', 'assets/factory_tile.png');
        this.load.image('mine_tile', 'assets/mine_tile.png');
        this.load.image('service_tile', 'assets/service_tile.png');
        this.load.image('cinema_tile', 'assets/cinema_tile.png');
        this.load.image('park_tile', 'assets/park_tile.png');
        this.load.image('stadium_tile', 'assets/stadium_tile.png');
        this.load.image('cafe_tile', 'assets/cafe_tile.png');
        this.load.image('museum_tile', 'assets/museum_tile.png');

        this.load.image('quest_icon', 'assets/quest_icon.png');
        this.load.image('demolish_icon', 'assets/demolish_icon.png');
        this.load.image('log_icon', 'assets/log_icon.png');

        this.load.image('car_blue', 'assets/car_blue.png');
        this.load.image('car_red', 'assets/car_red.png');
        this.load.image('bird', 'assets/bird.png');
        
        this.load.image('achievements_icon', 'assets/achievements_icon.png'); // Иконка кубка
        this.load.image('coin_icon', 'assets/coin_icon.png');
        this.load.image('heart_icon', 'assets/heart_icon.png');
        // Также загрузим иконки для каждой ачивки 
        for (const key in ACHIEVEMENTS_DATA) {
            this.load.image(key, `assets/achievements/${key}.png`);
            this.load.image(`${key}_disabled`, `assets/achievements/${key}_disabled.png`);
        }

        this.load.audio('bg_music', 'assets/audio/music.mp3');
        this.load.audio('city_ambience', 'assets/audio/ambience.mp3');
        this.load.audio('confirm_sound', 'assets/audio/ui_confirm.mp3');
        this.load.audio('disaster_sound', 'assets/audio/disaster.mp3');
        this.load.audio('phishing_sound', 'assets/audio/phishing.mp3');
    }

    create() {
        this.uiContainer = null; this.selectedSlot = null; this.occupiedSlots = new Map();
        this.playerCoins = 300000; this.lastSelectedBuilding = null;
        this.depositAmount = 0; this.hasActiveCredit = false; this.creditDebt = 0; this.gracePeriodDays = 0;
        this.hasMortgage = false; this.mortgagePayment = 500;
        this.mortgageDaysLeft = 0;
        this.daysSinceLastDisaster = 0;
        this.daysSinceLastPhishing = 0;
        this.lastSelectedBuilding = null;
        this.playerLevel = 1; this.playerXP = 0; this.xpToNextLevel = 100;
        this.population = 0;
        this.isCashbackActive = false;
        this.cashbackDaysLeft = 0;
        this.cashbackPercentage = 0.05;
        this.activeQuiz = null;
        this.pdsInvestment = 0;
        this.pdsMaturityDays = 0;
        this.isInsured = false;
        this.insuranceDaysLeft = 0;
        this.isCyberProtected = false;
        this.cyberProtectionDaysLeft = 0;
        this.hasShownDisasterWarning = false;
        this.hasShownPhishingWarning = false;
        this.isDemolishMode = false;
        this.hasInsuranceBuilding = false;
        this.hasCyberBuilding = false;
        // 
        this.brokerPortfolio = 0;
        this.isBonusPlusActive = false;
        this.bonusPlusDaysLeft = 0;
        //
        this.isBuildModeActive = false;
        this.buildControls = null;

        this.cityHappiness = 100; // 100%
        this.economyIncome = 0; // Доход от экономических зданий
        this.extraBuildings = []; // Массив для хранения построенных доп. зданий
        this.buildGhost = null; // "Призрак" здания в режиме строительства
        this.financialLog = []; // Лог финансовых событий

        this.achievementsProgress = {
            first_savings: 0,
            good_borrower: 0,
            investor: 0,
            protected: 0,
            builder: 0,
            happy_city: 0,
            cashback_king: 0,
            millionaire: 0
        };
        this.unlockedAchievements = new Set(); // Хранит ID уже полученных ачивок

        // Мы меняем высоту с 1920 на 1920 * 1.5, чтобы фон соответствовал размеру мира
        this.add.tileSprite(0, 0, SCREEN_WIDTH, 1920 * 1.5, 'grass').setOrigin(0, 0).setDepth(-1);
        
        // --- НОВЫЙ ЦИКЛ С ПРАВИЛЬНОЙ ОТРИСОВКОЙ СЛОЕВ ---
        for (const obj of cityLayout) {
            const screenPos = this.gridToScreen(obj.gridPos);
    
            // Сначала создаем объект, чтобы узнать его реальные размеры
            const gameObject = this.add.image(screenPos.x, screenPos.y, obj.type);

            // Теперь считаем глубину правильно, как в редакторе
            let depth = screenPos.y;
            if (TALL_OBJECTS.includes(obj.type)) {
                // Для высоких объектов глубина = их "основание" (нижний край)
                depth = screenPos.y + gameObject.height;
            }
            gameObject.setDepth(depth);

            // Остальная логика (выравнивание и интерактивность) остается без изменений
            if (obj.type === 'road_h' || obj.type === 'road_v') {
                gameObject.setOrigin(0.5, 0.5);
            } else {
                gameObject.setOrigin(0, 0);
            }
    
            if (obj.type === 'slot') {
                gameObject.setInteractive({ cursor: 'pointer' });
                gameObject.setData('gridPos', obj.gridPos);
                gameObject.on('pointerover', () => { if(gameObject.visible) gameObject.setTint(0xdddddd); });
                gameObject.on('pointerout', () => { gameObject.clearTint(); });
                gameObject.on('pointerdown', () => { if (!this.isSlotOccupied(obj.gridPos) && !this.uiContainer && !this.isDemolishMode) { this.showBuildUI(gameObject); } });
            }
        }

        // Шапка с балансом и уровнем
        this.createHUD(); 
        // Глобальный обработчик кликов для сноса
        this.input.on('pointerdown', (pointer) => {
            if (this.isDemolishMode && !this.uiContainer) {
                this.demolishObjectAt(pointer);
            }
        }, this);

        this.time.addEvent({ delay: 10000, callback: this.onFinancialTick, callbackScope: this, loop: true });

        // Добавьте эти строки в create()
        this.currentQuestId = 0;
        this.questProgress = {}; // Здесь будем отслеживать прогресс по целям

        this.uiQueue = []; // Очередь для UI 
        this.uiQueue.push({ type: 'welcome_screen' });
        this.uiQueue.push({ type: 'daily_bonus', data: { amount: 5000 } });
        this.processUIQueue();

        // --- НАСТРОЙКА КАМЕРЫ И ПЕРЕТАСКИВАНИЯ ---

        // 1. Задаем границы мира.
        this.cameras.main.setBounds(0, 0, SCREEN_WIDTH, 1920 * 1.5);

        // 2. Включаем перетаскивание камеры.
        this.input.on('pointermove', (pointer) => {
            // Эта логика сработает, только если кнопка мыши зажата (или палец на экране).
            if (!pointer.isDown) return;
            if (this.isBuildModeActive) return;

            // Если курсор над нашим UI контейнером, ничего не делаем.
            if (this.uiContainer && this.uiContainer.getBounds().contains(pointer.x, pointer.y)) {
                return;
            }

            // Двигаем камеру в противоположном направлении движения курсора.
            this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x);
            this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y);
            // Ограничиваем прокрутку по вертикали, чтобы не выйти за границы мира.
            if (this.cameras.main.scrollY < 0) this.cameras.main.scrollY = 0;
            if (this.cameras.main.scrollY > (1920 * 1.5 - 1920)) this.cameras.main.scrollY = (1920 * 1.5 - 1920);
        });

        this.createCarAnimations();    
        this.pulseQuestIcon(); // Запускаем анимацию иконки квестов

        // Фоновая музыка и звуки
        // Запускаем фоновый звук города (простой бесконечный луп)
        this.sound.play('city_ambience', {
            loop: true,
            volume: 0.05 // Сделаем его не слишком громким, чтобы не мешал музыке
        });
        // Запускаем фоновую музыку с плавным появлением
        this.music = this.sound.add('bg_music', {
            loop: true,
            volume: 0 // Начинаем с нулевой громкости
        });
        this.music.play();
        // Создаем анимацию (tween) для плавного увеличения громкости музыки
        this.tweens.add({
            targets: this.music,
            volume: 0.1,     // Целевая громкость (можете подобрать свою)
            duration: 2500,  // Длительность появления в миллисекундах (2.5 секунды)
            ease: 'Linear'
        });
        this.createDynamicTextures();
    }

    // Функция для создания динамических текстур и менеджера частиц
    createDynamicTextures() {
        // --- Текстура для частиц урагана ---
        const particleGraphics = this.make.graphics();
        particleGraphics.fillStyle(0x5E4827);
        particleGraphics.fillRect(0, 0, 8, 8);
        particleGraphics.generateTexture('debris_particle', 8, 8);
        particleGraphics.destroy();
        // --- Текстура для помех кибератаки ---
        const scanlineGraphics = this.make.graphics();
        scanlineGraphics.fillStyle(0x000000);
        for (let i = 0; i < (1920 * 1.5) / 4; i++) {
            scanlineGraphics.fillRect(0, i * 4, 1080, 2);
        }
        scanlineGraphics.generateTexture('scanlines_texture', 1080, 1920 * 1.5);
        scanlineGraphics.destroy();
    }

    startGameFirstTime() {
        // Просто скрываем окно приветствия, чтобы показать следующее окно из очереди (бонус)
        this.hideCurrentUI();
    }

    pulseQuestIcon() {
        // Сначала останавливаем любую предыдущую анимацию на этой иконке
        this.tweens.killTweensOf(this.questIcon);
        // Возвращаем иконку в исходное положение
        this.questIcon.y = (1920 - 90);
        // Создаем новую "прыгающую" анимацию
        this.tweens.add({
            targets: this.questIcon,
            y: (1920 - 90) - 15, // Насколько высоко подпрыгнет
            duration: 400,           // Скорость одного прыжка
            ease: 'Sine.easeInOut',
            yoyo: true,              // Вернуться в исходное положение
            repeat: -1,              // Повторять бесконечно
            delay: 500               // Небольшая задержка перед началом
        });
    }

    addXP(amount) {
        this.playerXP += amount;
    
        if (this.playerXP >= this.xpToNextLevel) {
            this.playerLevel++;
            this.playerXP -= this.xpToNextLevel;
            this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
            this.levelText.setText(`Уровень ${this.playerLevel}`);
            this.showLevelUpUI();
        }

        const progress = this.playerXP / this.xpToNextLevel;
        this.xpBar.clear().fillStyle(0x58FFFF).fillRoundedRect(230, 180, 300 * progress, 20, 10);
        this.xpText.setText(`${this.playerXP}/${this.xpToNextLevel}`);
    }

    // Новая функция для обновления счастья города
    updateHappinessDisplay() {
        // Обновляем текст с процентами
        this.happinessText.setText(`${this.cityHappiness}%`);
        // Анимация пульсации иконки
        this.tweens.add({
            targets: this.happinessIcon,
            scale: 1.2,
            duration: 150,
            ease: 'Sine.easeInOut',
            yoyo: true // Возвращает иконку в исходный размер
        });
    }

    onFinancialTick() {
        let totalIncome = 0;
        let totalExpense = 0;
        const happinessBonus = this.cityHappiness / 100;

        if (this.population > 0) {
            const taxIncome = Math.floor(this.population * 5 * happinessBonus);
            let finalTaxIncome = taxIncome;
            // Если подписка активна, добавляем 10% к налогам
            if (this.isBonusPlusActive) {
                finalTaxIncome = Math.floor(taxIncome * 1.10);
            }
            this.playerCoins += finalTaxIncome;
            totalIncome += finalTaxIncome;
            this.addFinancialLog(`+${finalTaxIncome} (Налоги с населения)`, 'income');
        }

        if (this.depositAmount > 0) {
            const annualRate = 0.15;
            const dailyRate = annualRate / 365;
            const income = Math.floor(this.depositAmount * dailyRate * happinessBonus);
            if (income > 0) {
                this.playerCoins += income;
                totalIncome += income;
                this.addFinancialLog(`+${income} (Проценты по вкладу)`, 'income');
                this.checkAchievement('first_savings', income);
            }
        }
    
        if (this.economyIncome > 0) {
            const economyBonusIncome = Math.floor(this.economyIncome * happinessBonus);
            this.playerCoins += economyBonusIncome;
            totalIncome += economyBonusIncome;
            this.addFinancialLog(`+${economyBonusIncome} (Доход от экономики)`, 'income');
        }

        if (this.pdsMaturityDays > 0) {
                this.pdsMaturityDays--;
                // Симуляция небольшого роста капитала (0.5% в день)
                this.pdsInvestment *= 1.005; 
                if (this.pdsMaturityDays === 0) {
                    this.resolvePDSInvestment();
                }
            }
        // Логика для Брокерского счета
        if (this.brokerPortfolio > 0) {
            // 1. Начисляем дивиденды (небольшой пассивный доход)
            const dividend = Math.floor(this.brokerPortfolio * 0.005); // 0.5% в день
            if (dividend > 0) {
                this.playerCoins += dividend;
                totalIncome += dividend;
                this.addFinancialLog(`+${dividend} (Дивиденды)`, 'income');
            }
            // 2. Симулируем колебания рынка
            const changePercent = (Math.random() * 0.045) - 0.02; // от -2% до +2.5%
            this.brokerPortfolio *= (1 + changePercent);
        }
        // Логика для таймера Подписки "Бонус Плюс"
        if (this.isBonusPlusActive) {
            this.bonusPlusDaysLeft--;
            if (this.bonusPlusDaysLeft <= 0) {
                this.isBonusPlusActive = false;
            }
        }    
        if (this.isCashbackActive) { this.cashbackDaysLeft--; if (this.cashbackDaysLeft <= 0) { this.isCashbackActive = false; } }
        if (this.isInsured) { this.insuranceDaysLeft--; if (this.insuranceDaysLeft <= 0) { this.isInsured = false; } }
        if (this.isCyberProtected) { this.cyberProtectionDaysLeft--; if (this.cyberProtectionDaysLeft <= 0) { this.isCyberProtected = false; } }

        // Проверяем шанс стихийного бедствия, только если есть страховая компания и достаточно денег
        if (this.hasInsuranceBuilding && this.playerCoins > 50000) {
            this.daysSinceLastDisaster++;
            const disasterChance = 0.08 + (this.daysSinceLastDisaster * 0.005);
            if (Math.random() < disasterChance) {
                this.triggerDisaster();
                this.daysSinceLastDisaster = 0;
            }
        }
        // Проверяем шанс фишинговой атаки, только если есть центр киберзащиты и достаточно денег
        if (this.hasCyberBuilding && this.playerCoins > 50000) {
            this.daysSinceLastPhishing++;
            const phishingChance = 0.03 + (this.daysSinceLastPhishing * 0.005);
            if (Math.random() < phishingChance) {
                this.triggerPhishingAttack();
                this.daysSinceLastPhishing = 0;
            }
        }
    
        if (this.hasActiveCredit && this.gracePeriodDays > 0) { this.gracePeriodDays--; if (this.gracePeriodDays > 0) { this.creditText.setText(`Льготный период: ${this.gracePeriodDays} дней`); } else { this.creditText.setText('Льготный период ИСТЕК!').setColor('#ff4444'); this.time.delayedCall(20000, () => { if (this.creditText.text === 'Льготный период ИСТЕК!') { this.creditText.setVisible(false); } }); } }
    
        if (this.hasMortgage) {
            this.mortgageDaysLeft--;
            this.playerCoins -= this.mortgagePayment;
            totalExpense += this.mortgagePayment;
            this.addFinancialLog(`-${this.mortgagePayment} (Платеж по ипотеке)`, 'expense');
        
            if (this.mortgageDaysLeft > 0) {
                this.mortgageText.setText(`Ипотека: -${this.mortgagePayment} (ост. ${this.mortgageDaysLeft} д.)`);
            } else {
                this.hasMortgage = false;
                this.mortgageText.setVisible(false);
                this.showMajorNotification('Поздравляем!', 'Ипотека полностью погашена!');
            }
        }

        if (!this.quizIcon.visible && !this.uiContainer && !this.activeQuiz && Math.random() < 0.33) {
            // Выбираем случайный "пакет" вопросов
            const setIndex = Phaser.Math.Between(0, QUIZ_SETS.length - 1);
            this.activeQuiz = {
                set: QUIZ_SETS[setIndex],
                currentQuestionIndex: 0, // Начинаем с первого вопроса
                correctAnswers: 0
            };
            // Показываем иконку, как и раньше
            this.quizIcon.setVisible(true);
        }

        this.coinsText.setText(`${this.playerCoins}`);
        if (totalIncome > 0) { this.showIncomeAnimation(totalIncome, '#00ff00', '+'); }
        if (totalExpense > 0) { this.showIncomeAnimation(totalExpense, '#ff8888', '-'); }
        // Проверка достижений, зависящих от текущего состояния
        this.checkAchievement('millionaire', this.playerCoins);
        this.checkAchievement('happy_city', this.cityHappiness);
        if (this.isInsured && this.isCyberProtected) {
            this.checkAchievement('protected', 1);
        }
    }

    isSlotOccupied(gridPos) { return this.occupiedSlots.has(JSON.stringify(gridPos)); }

    buildBuilding(buildingKey) {
        const buildingData = BUILDINGS_DATA[buildingKey];
        this.playerCoins -= buildingData.cost;
        this.addFinancialLog(`-${buildingData.cost} (Стройка: ${buildingData.name})`, 'expense');
        this.checkAchievement('builder', 1);
        this.coinsText.setText(this.playerCoins);
        
        // ИСПРАВЛЕНО: Сначала скрываем UI, потом начисляем опыт
        this.hideCurrentUI();
        this.addXP(50);

        if (buildingKey === 'insurance') {
            this.hasInsuranceBuilding = true;
        }
        if (buildingKey === 'cyber') {
            this.hasCyberBuilding = true;
        }
        
        if (this.isCashbackActive) {
            const cashbackAmount = Math.floor(buildingData.cost * this.cashbackPercentage);
            this.playerCoins += cashbackAmount;
            this.addFinancialLog(`+${cashbackAmount} (Кэшбэк за стройку)`, 'income');
            this.checkAchievement('cashback_king', cashbackAmount);
            this.coinsText.setText(this.playerCoins);
            this.showIncomeAnimation(cashbackAmount, '#3498db', 'Кэшбэк +');
        }
        if (buildingKey === 'residence') { this.population += 10; }
        const gridPos = this.selectedSlot.getData('gridPos');
        const screenPos = this.gridToScreen(gridPos);
        const newBuilding = this.add.image(screenPos.x, screenPos.y, buildingKey).setOrigin(0, 0);
        newBuilding.setDepth(screenPos.y + newBuilding.height); // Учитываем высоту
        newBuilding.setInteractive({ cursor: 'pointer' });
        newBuilding.setData('buildingInfo', buildingData);

        newBuilding.on('pointerdown', () => { if (!this.uiContainer && !this.isDemolishMode) { this.lastSelectedBuilding = newBuilding; createUIPanel(this, 'building'); } });
        
        this.selectedSlot.disableInteractive().setVisible(false);
        this.occupiedSlots.set(JSON.stringify(gridPos), buildingKey);
        this.updateQuestProgress('build', { buildingKey: buildingKey });
    }
    
    makeDeposit() {
        const inputElement = document.getElementById('deposit-input');
        const amount = parseInt(inputElement.value, 10);
        const notificationText = this.uiContainer.getData('notification');
        if (isNaN(amount) || amount <= 0) { notificationText.setText('Введите корректную сумму!'); return; }
        if (amount > this.playerCoins) { notificationText.setText('Недостаточно Койнов!'); return; }
        
        this.playerCoins -= amount;
        this.addFinancialLog(`-${amount} (Перевод на вклад)`, 'expense');
        this.depositAmount += amount;
        this.coinsText.setText(this.playerCoins);
        notificationText.setText(`Успешно вложено: ${amount} Койнов!`).setColor('#ddffdd');
        inputElement.value = '';
        
        // ИСПРАВЛЕНО: Начисляем опыт ПОСЛЕ скрытия UI
        this.time.delayedCall(2000, () => {
            this.hideCurrentUI();
            this.addXP(10);
        });
        this.updateQuestProgress('deposit', { amount: amount });
    }
    
    takeCredit() {
        const notificationText = this.uiContainer.getData('notification');
        if (this.hasActiveCredit) { notificationText.setText('У вас уже есть активный кредит!'); return; }
        
        this.hasActiveCredit = true;
        this.creditDebt = 5000;
        this.gracePeriodDays = 12;
        this.playerCoins += 5000;
        this.addFinancialLog(`+5000 (Получение кредита)`, 'income');
        this.coinsText.setText(this.playerCoins);
        this.creditText.setText(`Льготный период: ${this.gracePeriodDays} дней`).setColor('#ffaaaa').setVisible(true);
        
        // ИСПРАВЛЕНО: Сначала скрываем UI, потом начисляем опыт
        this.hideCurrentUI();
        this.addXP(20);
        this.updateQuestProgress('action', { product: 'take_credit' });
    }
    
    repayCredit() {
        const notificationText = this.uiContainer.getData('notification');
        if (this.playerCoins < this.creditDebt) { notificationText.setText('Недостаточно Койнов для погашения!'); return; }
        
        this.playerCoins -= this.creditDebt;
        this.addFinancialLog(`-${this.creditDebt} (Погашение кредита)`, 'expense');
        // Проверяем ачивку "Ответственный заемщик"
        this.checkAchievement('good_borrower', 1);
        this.creditDebt = 0;
        this.hasActiveCredit = false;
        this.gracePeriodDays = 0;
        this.coinsText.setText(this.playerCoins);
        this.creditText.setVisible(false);
        this.addXP(100);
        this.hideCurrentUI();
        this.time.delayedCall(100, () => {
            this.showMajorNotification('Поздравляем!', 'Кредит полностью погашен!');
        });
        
    }

    takeMortgage() {
        const notificationText = this.uiContainer.getData('notification');
        
        if (this.hasMortgage) { notificationText.setText('У вас уже есть ипотека!'); return; }
        
        this.hasMortgage = true;
        this.mortgageDaysLeft = 30;
        this.playerCoins += 70000;
        this.addFinancialLog(`+70000 (Получение ипотеки)`, 'income');
        this.coinsText.setText(this.playerCoins);
        this.mortgageText.setText(`Ипотека: -${this.mortgagePayment} (ост. ${this.mortgageDaysLeft} д.)`).setVisible(true);
        
        // ИСПРАВЛЕНО: Сначала скрываем UI, потом начисляем опыт
        this.hideCurrentUI();
        this.addXP(150);
        this.updateQuestProgress('action', { product: 'take_mortgage' });
    }

    showIncomeAnimation(amount, color, prefix = '+') {
        const textContent = `${prefix}${amount}`;
        const text = this.add.text(this.cameras.main.centerX + 400, 130, textContent, { fontSize: '42px', color: color, stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setDepth(10001);
    
        if (prefix.includes('-')) { text.setY(220); }
        else if (prefix.includes('Кэшбэк')) { text.setY(175).setColor('#87CEEB'); }

        this.tweens.add({ targets: text, y: text.y - 50, alpha: 0, duration: 2000, ease: 'Power1', onComplete: () => { text.destroy(); } });
    }
    
    gridToScreen(gridPos) { return { x: HORIZONTAL_PADDING + (gridPos.x * TILE_SIZE), y: gridPos.y * TILE_SIZE }; }

    showBuildUI(slotObject) { this.selectedSlot = slotObject; createUIPanel(this, 'build'); }
    hideCurrentUI() { hideCurrentUI(this); }

    investInPDS() {
        const investmentCost = 25000;
        const notificationText = this.uiContainer.getData('notification');
        if (this.pdsInvestment > 0) {
            notificationText.setText('Вы уже участвуете в программе!');
            return;
        }
        if (this.playerCoins < investmentCost) {
            notificationText.setText('Недостаточно Койнов!');
            return;
        }

        this.playerCoins -= investmentCost;
        this.addFinancialLog(`-${investmentCost} (Взнос в ПДС)`, 'expense');

        const stateBonus = 9000; // Бонус от государства
        this.pdsInvestment = investmentCost + stateBonus;
        this.pdsMaturityDays = 30; // Срок программы - 30 дней
    
        this.hideCurrentUI();
        this.addXP(75);
        this.updateQuestProgress('action', { product: 'invest_pds' });
    
        const successText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `Вы вложили ${investmentCost} Койнов!\nГосударство добавило ${stateBonus} Койнов.\nСумма вернется с доходом через ${this.pdsMaturityDays} дней.`, { fontSize: '48px', color: '#ddffdd', backgroundColor: 'rgba(0,0,0,0.7)', padding: {x:20, y:10}, align: 'center', wordWrap: { width: 900 } }).setOrigin(0.5).setDepth(30000);
        this.time.delayedCall(3000, () => successText.destroy());
    }

    resolvePDSInvestment() {
        // Добавляем 10% дохода к накопленной сумме
        const income = Math.floor(this.pdsInvestment * 0.1); 
        const resultAmount = Math.floor(this.pdsInvestment + income);
        this.playerCoins += resultAmount;
        this.addFinancialLog(`+${resultAmount} (Выплата по ПДС)`, 'income');
    
        this.pdsInvestment = 0;
        this.pdsMaturityDays = 0;
        this.coinsText.setText(this.playerCoins);

        const resultText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `Программа ПДС завершена!\nВаш накопленный капитал:\n${resultAmount} Койнов!`, { fontSize: '48px', color: '#ddffdd', backgroundColor: 'rgba(0,0,0,0.7)', padding: {x:20, y:10}, align: 'center', wordWrap: { width: 900 } }).setOrigin(0.5).setDepth(30000);
        this.time.delayedCall(3000, () => resultText.destroy());
    }

    answerQuiz(selectedIndex) {
        // Правильный путь к данным вопроса
        const quizSet = this.activeQuiz.set;
        const questionData = quizSet.questions[this.activeQuiz.currentQuestionIndex];
        const isCorrect = selectedIndex === questionData.correctIndex;
        this.resolveQuiz(isCorrect);
    }

    // УЛУЧШЕННАЯ ВЕРСЯ resolveQuiz С ОБЪЯСНЕНИЯМИ
    resolveQuiz(isCorrect) {
        const notificationText = this.uiContainer.getData('notification');
        const quizSet = this.activeQuiz.set;
        // Получаем данные текущего вопроса, чтобы взять из него объяснение
        const questionData = quizSet.questions[this.activeQuiz.currentQuestionIndex];
        const explanation = questionData.explanation;

        // Блокируем кнопки, чтобы нельзя было нажать дважды
        this.uiContainer.list.forEach(item => {
            if (item.type === 'Text' && item.input && item.input.enabled) {
                item.disableInteractive();
            }
        });

        if (isCorrect) {
            this.activeQuiz.correctAnswers++;
            // Показываем объяснение вместе со статусом ответа
            notificationText.setText(`Верно!\n\n${explanation}`).setColor('#ddffdd');
        } else {
            // Показываем объяснение и здесь
            notificationText.setText(`Неверно.\n\n${explanation}`).setColor('#ffdddd');
        }

        // Увеличим задержку, чтобы игрок успел прочитать объяснение
        this.time.delayedCall(1800, () => {
            this.activeQuiz.currentQuestionIndex++;
            // Если в пакете есть еще вопросы, показываем следующий
            if (this.activeQuiz.currentQuestionIndex < quizSet.questions.length) {
                this.hideCurrentUI();
                createUIPanel(this, 'quiz');
            } else {
                // Если вопросы закончились, выдаем награду и закрываем
                const reward = quizSet.reward;
                this.playerCoins += reward.coins;
                this.addFinancialLog(`+${reward.coins} (Награда за квиз)`, 'income');
                this.addXP(reward.xp);
            
                this.coinsText.setText(this.playerCoins);
                this.hideCurrentUI();
            
                const finalText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `Квиз завершен!\nПравильных ответов: ${this.activeQuiz.correctAnswers} из ${quizSet.questions.length}\n\nНаграда: ${reward.coins}К, ${reward.xp}XP`, { fontSize: '48px', color: '#ddffdd', backgroundColor: 'rgba(0,0,0,0.7)', padding: {x:20, y:10}, align: 'center' }).setOrigin(0.5).setDepth(30000);
                this.time.delayedCall(4000, () => finalText.destroy());
            
                this.activeQuiz = null;
            }
        });
    }

    activateCashback() {
        if (this.isCashbackActive) return;

        this.isCashbackActive = true;
        this.cashbackDaysLeft = 10;
        
        // ИСПРАВЛЕНО: Сначала скрываем UI, потом начисляем опыт
        this.hideCurrentUI();
        this.addXP(30);

        const successText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `Кэшбэк 5% активен на ${this.cashbackDaysLeft} дней!`, { fontSize: '48px', color: '#ddffdd', backgroundColor: 'rgba(0,0,0,0.7)', padding: {x:20, y:10}, align: 'center' }).setOrigin(0.5).setDepth(30000);
        this.time.delayedCall(3000, () => successText.destroy());
        this.updateQuestProgress('action', { product: 'activate_cashback' });
    }

    activateInsurance() {
        const insuranceCost = 2000;
        const notificationText = this.uiContainer.getData('notification');
        if (this.isInsured) { notificationText.setText('Страховка уже активна!'); return; }
        if (this.playerCoins < insuranceCost) { notificationText.setText('Недостаточно Койнов!'); return; }

        this.playerCoins -= insuranceCost;
        this.addFinancialLog(`-${insuranceCost} (Покупка страховки)`, 'expense');
        this.coinsText.setText(this.playerCoins);
        this.isInsured = true;
        this.insuranceDaysLeft = 20;
        
        // ИСПРАВЛЕНО: Сначала скрываем UI, потом начисляем опыт
        this.hideCurrentUI();
        this.addXP(40);

        const successText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `Страховка активна на ${this.insuranceDaysLeft} дней!`, { fontSize: '48px', color: '#ddffdd', backgroundColor: 'rgba(0,0,0,0.7)', padding: {x:20, y:10}, align: 'center' }).setOrigin(0.5).setDepth(30000);
        this.time.delayedCall(3000, () => successText.destroy());
        this.updateQuestProgress('action', { product: 'get_insurance' });
    }

    triggerDisaster() {
        this.sound.play('disaster_sound', { volume: 0.2 });
        playHurricaneEffect(this);
        let loss = 15000;
        let message = '';

        if (this.isInsured) {
            loss = 1000;
            message = `Ураган в Капитал Сити!\nК счастью, ваше имущество застраховано.\nУбыток составил всего ${loss} Койнов.`;
            this.isInsured = false;
            this.insuranceDaysLeft = 0;
        } else {
            message = `Ураган в Капитал Сити!\nВаше имущество не было застраховано.\nВы потеряли ${loss} Койнов!`;
        }

        this.playerCoins -= loss;
        this.addFinancialLog(`-${loss} (Убыток от урагана)`, 'expense');
        this.coinsText.setText(this.playerCoins);

        const disasterText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, message, { fontSize: '52px', color: '#DD41DB', backgroundColor: 'rgba(6, 6, 152, 0.8)', padding: {x:20, y:10}, align: 'center', wordWrap: { width: 900 } }).setOrigin(0.5).setDepth(30000);
        this.time.delayedCall(3000, () => disasterText.destroy());
    }

    activateCyberProtection() {
        const protectionCost = 1500;
        const notificationText = this.uiContainer.getData('notification');
        if (this.isCyberProtected) { notificationText.setText('Защита уже активна!'); return; }
        if (this.playerCoins < protectionCost) { notificationText.setText('Недостаточно Койнов!'); return; }

        this.playerCoins -= protectionCost;
        this.addFinancialLog(`-${protectionCost} (Покупка киберзащиты)`, 'expense');
        this.coinsText.setText(this.playerCoins);
        this.isCyberProtected = true;
        this.cyberProtectionDaysLeft = 20;
        
        // ИСПРАВЛЕНО: Сначала скрываем UI, потом начисляем опыт
        this.hideCurrentUI();
        this.addXP(40);
        
        const successText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `Киберзащита активна на ${this.cyberProtectionDaysLeft} дней!`, { fontSize: '48px', color: '#ddffdd', backgroundColor: 'rgba(0,0,0,0.7)', padding: {x:20, y:10}, align: 'center' }).setOrigin(0.5).setDepth(30000);
        this.time.delayedCall(3000, () => successText.destroy());
        this.updateQuestProgress('action', { product: 'activate_cyber' });
    }

    triggerPhishingAttack() {
        this.sound.play('phishing_sound', { volume: 0.2 });
        playPhishingEffect(this);
        let loss = 10000;
        let message = '';

        if (this.isCyberProtected) {
            loss = 500;
            message = `Фишинговая атака!\nВаша защита отразила угрозу.\nУбыток составил всего ${loss} Койнов.`;
            this.isCyberProtected = false;
            this.cyberProtectionDaysLeft = 0;
        } else {
            message = `Фишинговая атака!\nМошенники похитили ${loss} Койнов.\nПостройте Центр Киберзащиты!`;
        }

        this.playerCoins -= loss;
        this.addFinancialLog(`-${loss} (Убыток от фишинга)`, 'expense');
        this.coinsText.setText(this.playerCoins);

        const attackText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, message, { fontSize: '52px', color: '#DD41DB', backgroundColor: 'rgba(6, 6, 152, 0.8)', padding: {x:20, y:10}, align: 'center', wordWrap: { width: 900 } }).setOrigin(0.5).setDepth(30000);
        this.time.delayedCall(3000, () => attackText.destroy());
    }

    upgradeBuilding() {
        const buildingInfo = this.lastSelectedBuilding.getData('buildingInfo');
        const upgradeCost = buildingInfo.upgrade.cost;
        const notificationText = this.uiContainer.getData('notification');
        if (this.playerCoins < upgradeCost) { notificationText.setText("Недостаточно Койнов!"); return; }

        this.playerCoins -= upgradeCost;
        this.addFinancialLog(`-${upgradeCost} (Апгрейд здания)`, 'expense');
        this.coinsText.setText(this.playerCoins);
        
        this.lastSelectedBuilding.setTexture(buildingInfo.upgrade.sprite);
        buildingInfo.level = 2;
        this.lastSelectedBuilding.setData('buildingInfo', buildingInfo);

        // ИСПРАВЛЕНО: Сначала скрываем UI, потом начисляем опыт
        this.hideCurrentUI();
        this.addXP(100);
        
        // Открываем панель заново, чтобы увидеть обновленный вид
        createUIPanel(this, 'building');
    }

    // ПОЛНАЯ ЗАМЕНА ФУНКЦИИ showLevelUpUI

    showLevelUpUI() {
        let unlockedContent = '';

        // Ищем, какие ДОПОЛНИТЕЛЬНЫЕ постройки открылись на этом уровне
        for (const key in EXTRA_BUILDINGS_DATA) {
            const building = EXTRA_BUILDINGS_DATA[key];
            if (building.requiredLevel === this.playerLevel) {
                unlockedContent += `\n- ${building.name}`;
            }
        }

        if (unlockedContent === '') {
            unlockedContent = '\nВы стали опытнее и мудрее!';
        }

        const uiData = {
            level: this.playerLevel,
            unlocks: unlockedContent,
            // ВАЖНО: поле warnings убираем, оно нам больше не нужно здесь
        };
        this.uiQueue.push({ type: 'level_up', data: uiData });
        this.processUIQueue();
    }

    // ПОЛНАЯ ЗАМЕНА ФУНКЦИИ enterBuildMode 
    enterBuildMode(itemKey, isGridItem = false) {
        this.hideCurrentUI();
        this.isBuildModeActive = true; // Блокируем скролл карты
        // --- Получаем текущие координаты курсора/пальца ---
        const pointer = this.input.activePointer;
        const spriteKey = isGridItem ? itemKey : EXTRA_BUILDINGS_DATA[itemKey].sprite;
        // --- Сразу устанавливаем правильную начальную позицию ---
        // Для не-сеточных объектов сразу применяем смещение
        const initialY = isGridItem ? pointer.worldY : pointer.worldY - 150;
        this.buildGhost = this.add.image(pointer.worldX, initialY, spriteKey).setAlpha(0.7).setDepth(30000);
        // Установка origin (без изменений)
        if (isGridItem && (itemKey === 'road_h' || itemKey === 'road_v')) {
            this.buildGhost.setOrigin(0.5, 0.5);
        } else {
            this.buildGhost.setOrigin(0, 0);
        }
        // --- Логика кнопок  ---
        this.buildControls = this.add.container(this.cameras.main.centerX, 1920 - 180).setDepth(35000).setScrollFactor(0);
        const bg = this.add.graphics().fillStyle(0x000000, 0.7).fillRoundedRect(-300, -60, 600, 120, 16);
        const confirmButton = this.add.text(-150, 0, '[ Построить ]', { 
            fontSize: '32px', 
            backgroundColor: '#1919EF', // Фирменный фиолетовый
            color: '#ffffff',            // Белый текст
            padding: { x: 15, y: 8 } 
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        const cancelButton = this.add.text(150, 0, '[ Отмена ]', { 
            fontSize: '32px', 
            backgroundColor: '#DD41DB', // Фирменный малиновый
            color: '#ffffff',            // Белый текст
            padding: { x: 15, y: 8 } 
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        this.buildControls.add([bg, confirmButton, cancelButton]);
        // --- Функция обработки движения  ---
        const onMove = (pointer) => {
            if (this.buildGhost) {
                if (isGridItem) {
                    // Логика привязки к сетке 
                    let gridPos;
                    if (itemKey === 'road_h' || itemKey === 'road_v') {
                        gridPos = this.screenToSubGrid(pointer.worldX - (TILE_SIZE / 2), pointer.worldY - (TILE_SIZE / 2));
                    } else {
                        gridPos = this.screenToGrid(pointer.worldX, pointer.worldY);
                    }
                    const screenPos = this.gridToScreen(gridPos);
                    if (itemKey === 'road_h' || itemKey === 'road_v') {
                        this.buildGhost.setPosition(screenPos.x + TILE_SIZE / 2, screenPos.y + TILE_SIZE / 2);
                    } else {
                        this.buildGhost.setPosition(screenPos.x, screenPos.y);
                    }
                } else {
                    // Применяем смещение при движении 
                    this.buildGhost.setPosition(pointer.worldX, pointer.worldY - 150);
                }
            }
        };
        // --- НОВАЯ ФУНКЦИЯ "РАЗМОРОЗКИ" ---
        const onGhostClick = () => {
            // Снова делаем призрака неинтерактивным, чтобы он не мешал кликам по карте
            this.buildGhost.disableInteractive();
            
            // Снова "привязываем" его к курсору и активируем "заморозку" по клику
            this.input.on('pointermove', onMove);
            this.input.on('pointerdown', onDown);
        };
        // --- Функция обработки клика для подтверждения позиции ---
        const onDown = (pointer) => {
            // Проверяем, что клик не был по кнопкам управления
            // Используем this.buildControls, так как он доступен в этом контексте
            if (this.buildControls) {
                const controlBounds = this.buildControls.getBounds();
                if (Phaser.Geom.Rectangle.Contains(controlBounds, pointer.x, pointer.y)) {
                    return; // Если клик по кнопкам, ничего не делаем
                }
            }
            // Отключаем слежение за курсором, "замораживая" призрак
            this.input.off('pointermove', onMove);
            // Отключаем этот обработчик, чтобы он сработал только один раз
            this.input.off('pointerdown', onDown);
            // Делаем призрак интерактивным, чтобы можно было кликнуть по нему и "разморозить"
            this.buildGhost.setInteractive({ cursor: 'pointer' });
            // Назначаем ему нашу новую функцию "разморозки"
            this.buildGhost.on('pointerdown', onGhostClick);
        };
        const cleanup = () => {
            this.input.off('pointermove', onMove);
            this.input.off('pointerdown', onDown);
            if (this.buildGhost) {
                this.buildGhost.destroy();
                this.buildGhost = null;
            }
            if (this.buildControls) {
                this.buildControls.destroy();
                this.buildControls = null;
            }
            this.isBuildModeActive = false;
        };

        confirmButton.on('pointerdown', () => {
            if (isGridItem) {
                let gridPos;
                if (itemKey === 'road_h' || itemKey === 'road_v') {
                    gridPos = this.screenToSubGrid(this.buildGhost.x - (TILE_SIZE / 2), this.buildGhost.y - (TILE_SIZE / 2));
                } else {
                    gridPos = this.screenToGrid(this.buildGhost.x, this.buildGhost.y);
                }
                this.placeBaseItem(gridPos, itemKey);
            } else {
                this.placeExtraBuilding(this.buildGhost.x, this.buildGhost.y, itemKey);
            }
            cleanup();
        });

        cancelButton.on('pointerdown', () => {
            cleanup();
        });
        
        this.input.on('pointermove', onMove);
        this.input.on('pointerdown', onDown); 
        // Сразу вызываем onMove один раз, чтобы призрак привязался к сетке, если это GridItem
        onMove(pointer); 
    }

    placeExtraBuilding(x, y, buildingKey) {
        const buildingData = EXTRA_BUILDINGS_DATA[buildingKey];

        this.playerCoins -= buildingData.cost;
        this.addFinancialLog(`-${buildingData.cost} (Стройка: ${buildingData.name})`, 'expense');
        this.checkAchievement('builder', 1);
        this.coinsText.setText(this.playerCoins);
        this.addXP(30);

        // Правильное начисление бонусов
        if (buildingData.bonuses.income) {
            this.economyIncome += buildingData.bonuses.income.value;
        } else if (buildingData.bonuses.happiness) {
            this.cityHappiness += buildingData.bonuses.happiness.value;
            this.updateHappinessDisplay();
        }

        const newBuilding = this.add.image(x, y, buildingData.sprite).setOrigin(0, 0);
        newBuilding.setDepth(y + newBuilding.height); // Учитываем высоту
        newBuilding.setInteractive();
        newBuilding.setData('extraBuildingKey', buildingKey);
    
        newBuilding.on('pointerdown', () => {
            if (!this.uiContainer && !this.isDemolishMode) {
                createUIPanel(this, 'extra_building_info', { key: buildingKey });
            }
        });
    
        this.extraBuildings.push(newBuilding);
    }

    placeBaseItem(gridPos, itemKey) { // gridPos здесь больше не используется, мы его пересчитаем
        const baseItems = {
            'slot': { name: 'Слот для здания', cost: 1000 },
            'road_h': { name: 'Дорога (горизонт.)', cost: 200 },
            'road_v': { name: 'Дорога (вертик.)', cost: 200 }
        };
        const itemData = baseItems[itemKey];

        if (this.playerCoins < itemData.cost) return;

        // Пересчитываем gridPos на всякий случай, чтобы избежать ошибок
        const finalGridPos = gridPos;

        this.playerCoins -= itemData.cost;
        this.addFinancialLog(`-${itemData.cost} (Покупка: ${itemData.name})`, 'expense');
        this.coinsText.setText(this.playerCoins);
        this.addXP(5);

        const screenPos = this.gridToScreen(finalGridPos);
        const newObject = this.add.image(0, 0, itemKey).setDepth(screenPos.y);

        if (itemKey === 'road_h' || itemKey === 'road_v') {
            newObject.setOrigin(0.5, 0.5);
            newObject.setPosition(screenPos.x + TILE_SIZE / 2, screenPos.y + TILE_SIZE / 2);
        } else {
            newObject.setOrigin(0, 0);
            newObject.setPosition(screenPos.x, screenPos.y);
        }

        if (itemKey === 'slot') {
            newObject.setInteractive({ cursor: 'pointer' });
            newObject.setData('gridPos', finalGridPos);
            newObject.on('pointerover', () => { if(newObject.visible) newObject.setTint(0xdddddd); });
            newObject.on('pointerout', () => { newObject.clearTint(); });
            newObject.on('pointerdown', () => {
                if (!this.isSlotOccupied(finalGridPos) && !this.uiContainer && !this.isDemolishMode) {
                    this.showBuildUI(newObject);
                }
            });
        }
    }

    screenToGrid(worldX, worldY) {
        const gridX = Math.floor((worldX - HORIZONTAL_PADDING) / TILE_SIZE);
        const gridY = Math.floor(worldY / TILE_SIZE);
        return { x: gridX, y: gridY };
    }

    screenToSubGrid(worldX, worldY) {
        // Делим на размер тайла, чтобы получить дробные координаты сетки
        const floatGridX = (worldX - HORIZONTAL_PADDING) / TILE_SIZE;
        const floatGridY = worldY / TILE_SIZE;

        // Магия для привязки к сетке с шагом 0.25
        const steps = 4; // 4 шага на один тайл (1 / 0.25)
        const gridX = Math.round(floatGridX * steps) / steps;
        const gridY = Math.round(floatGridY * steps) / steps;

        return { x: gridX, y: gridY };
    }

    updateQuestProgress(goalType, params = {}) {
        if (this.currentQuestId === null) return; // Нет активных квестов

        const quest = QUESTS_DATA[this.currentQuestId];
        if (!quest || quest.goal.type !== goalType) return;

        let questCompleted = false;

        switch(goalType) {
            case 'build':
                if (quest.goal.building === params.buildingKey) {
                    const progress = (this.questProgress.build_count || 0) + 1;
                    this.questProgress.build_count = progress;
                    if (progress >= quest.goal.count) {
                        questCompleted = true;
                    }
                }
                break;
            case 'deposit':
                if (params.amount >= quest.goal.amount) {
                    questCompleted = true;
                }
                break;
            case 'action':
                if (quest.goal.product === params.product) {
                    questCompleted = true;
                }
                break;
        }

        if (questCompleted) {
            this.completeQuest();
        }
    }

    completeQuest() {
        const quest = QUESTS_DATA[this.currentQuestId];
        if (!quest) return;

        // Выдаем награду
        this.playerCoins += quest.reward.coins;
        this.addFinancialLog(`+${quest.reward.coins} (Награда за квест)`, 'income');
        this.addXP(quest.reward.xp);
        this.coinsText.setText(this.playerCoins);
        this.showIncomeAnimation(quest.reward.coins, '#f1c40f', 'Награда +');

        // Показываем UI о завершении
        this.uiQueue.push({ type: 'quest_complete', data: quest });
        this.processUIQueue();

        // Переходим к следующему квесту
        const nextQuestId = this.currentQuestId + 1;
        if (nextQuestId < QUESTS_DATA.length) {
            this.currentQuestId = nextQuestId;
            this.questProgress = {}; // Сбрасываем прогресс для нового квеста
            this.checkInitialQuestCompletion(); 
            this.pulseQuestIcon();
        } else {
            this.currentQuestId = null; // Квесты закончились
            this.questIcon.setVisible(false); // Прячем иконку
            this.questProgress = {};
        }
        // --- НОВЫЙ КОД ДЛЯ ВЫЗОВА ПРЕДУПРЕЖДЕНИЙ ---
        if (this.currentQuestId === 9 && !this.hasShownDisasterWarning) {
            this.hasShownDisasterWarning = true;
            const warningData = {
                title: "Внимание!",
                text: "Синоптики прогнозируют ураганы и штормы в ближайшие дни. Рекомендуется оформить страховку для защиты ваших активов."
            };
            this.uiQueue.push({ type: 'event_warning', data: warningData });
            this.processUIQueue();
        }

        if (this.currentQuestId === 11 && !this.hasShownPhishingWarning) {
            this.hasShownPhishingWarning = true;
            const warningData = {
                title: "Внимание!",
                text: "Теперь возможны фишинговые атаки. Рекомендуется активировать киберзащиту для безопасности финансов города."
            };
            this.uiQueue.push({ type: 'event_warning', data: warningData });
            this.processUIQueue();
        }
    }
    // Проверяем выполнение условий для уже выполненных квестов при загрузке
    checkInitialQuestCompletion() {
        if (this.currentQuestId === null) return; // Нет активных квестов

        const quest = QUESTS_DATA[this.currentQuestId];
        if (!quest) return;

        let shouldComplete = false;
        const goal = quest.goal;

        // Проверяем условия в зависимости от типа цели
        switch (goal.type) {
            case 'action':
                // Если цель - взять ипотеку, а она уже есть
                if (goal.product === 'take_mortgage' && this.hasMortgage) {
                    shouldComplete = true;
                }
                // Если цель - взять кредит, а он уже есть
                if (goal.product === 'take_credit' && this.hasActiveCredit) {
                    shouldComplete = true;
                }
                break;

            case 'build':
                // Считаем, сколько нужных зданий уже построено
                let builtCount = 0;
                for (const buildingKey of this.occupiedSlots.values()) {
                    if (buildingKey === goal.building) {
                        builtCount++;
                    }
                }
                // Если построено достаточно или больше
                if (builtCount >= goal.count) {
                    shouldComplete = true;
                }
                break;
        }

        // Если условия уже выполнены, засчитываем квест
        if (shouldComplete) {
            // Вызываем с небольшой задержкой, чтобы избежать "зацикливания"
            // и дать игроку увидеть, что квест сменился и тут же выполнился.
            this.time.delayedCall(500, () => {
                this.completeQuest();
            });
        }
    }

    processUIQueue() {
        if (this.uiContainer) return; // Не показывать новое окно, пока открыто старое

        if (this.uiQueue.length > 0) {
            const nextUI = this.uiQueue.shift(); // Берем первое событие из очереди
            createUIPanel(this, nextUI.type, nextUI.data);
        }
    }

    demolishObjectAt(pointer) {
        const checkZone = new Phaser.Geom.Rectangle(pointer.worldX, pointer.worldY, 1, 1);
        let objectToDelete = null;
        let refundAmount = 0;
        let data = null;

        // --- БЛОК 1: Поиск ОСНОВНЫХ зданий ---
        for (const building of this.children.list) {
            if (building.getData('buildingInfo') && Phaser.Geom.Intersects.RectangleToRectangle(checkZone, building.getBounds())) {
                objectToDelete = building;
                data = objectToDelete.getData('buildingInfo');
                refundAmount = Math.floor(data.cost * 0.5);

                // Освобождаем слот
                let foundKey = null;
                for (const [key, value] of this.occupiedSlots.entries()) {
                    const slotScreenPos = this.gridToScreen(JSON.parse(key));
                    if (objectToDelete.x === slotScreenPos.x && objectToDelete.y === slotScreenPos.y) { foundKey = key; break; }
                }
                if (foundKey) {
                    this.occupiedSlots.delete(foundKey);
                    for (const child of this.children.list) {
                        if (child.getData('gridPos') && JSON.stringify(child.getData('gridPos')) === foundKey) {
                            child.setVisible(true).setInteractive({ cursor: 'pointer' }); break;
                        }
                    }
                }
                break; 
            }
        }

        // --- БЛОК 2: Поиск ДОПОЛНИТЕЛЬНЫХ зданий ---
        if (!objectToDelete) {
            for (const building of this.extraBuildings) {
                if (Phaser.Geom.Intersects.RectangleToRectangle(checkZone, building.getBounds())) {
                    objectToDelete = building;
                    const buildingKey = building.getData('extraBuildingKey');
                    data = EXTRA_BUILDINGS_DATA[buildingKey];
                    refundAmount = Math.floor(data.cost * 0.5);
                    this.extraBuildings = this.extraBuildings.filter(b => b !== objectToDelete);
                    break;
                }
            }
        }

        // --- НОВЫЙ БЛОК 3: Поиск ДОРОГ и СЛОТОВ ---
        if (!objectToDelete) {
            // Задаем цены на базовые элементы прямо здесь для простоты
            const baseItemCosts = {
                'slot': 1000,
                'road_h': 200,
                'road_v': 200
            };

            // Ищем в общем списке объектов сцены
            for (const child of this.children.list) {
                const key = child.texture.key;
                // Проверяем, что это один из наших базовых элементов и что курсор над ним
                if ((['road_h', 'road_v', 'slot'].includes(key)) && Phaser.Geom.Intersects.RectangleToRectangle(checkZone, child.getBounds())) {
                    // Дополнительное условие для слотов: удаляем только видимые (пустые)
                    if (key === 'slot' && !child.visible) {
                        continue; // Пропускаем невидимый (занятый) слот
                    }
                    objectToDelete = child;
                    refundAmount = Math.floor(baseItemCosts[key] * 0.5);
                    data = null; // У базовых элементов нет бонусов для отката
                    break;
                }
            }
        }

        // --- ОБЩАЯ ЛОГИКА УДАЛЕНИЯ ---
        if (objectToDelete) {
            // Откат бонусов (сработает только для зданий)
            if (data && data.bonuses) {
                if (data.bonuses.income) { this.economyIncome -= data.bonuses.income.value; }
                if (data.bonuses.happiness) { 
                    this.cityHappiness -= data.bonuses.happiness.value;
                    this.updateHappinessDisplay();
                }
                if (data.bonuses.population) { this.population -= data.bonuses.population.value; }
            }

            // Возврат средств и уничтожение объекта
            this.playerCoins += refundAmount;
            this.addFinancialLog(`+${refundAmount} (Возврат за снос)`, 'income');
            this.coinsText.setText(this.playerCoins);
            this.showIncomeAnimation(refundAmount, '#aaffaa', 'Возврат +');
            objectToDelete.destroy();
        }
    }
    // ЛОГИРОВАНИЕ ФИНАНСОВЫХ СОБЫТИЙ
    addFinancialLog(message, type) {
        // type может быть 'income' (доход), 'expense' (расход) или 'neutral' (нейтральное событие)
        this.financialLog.unshift({ message, type }); // Добавляем в начало массива
    
        // Ограничиваем размер лога, чтобы не хранить бесконечную историю
        if (this.financialLog.length > 25) {
            this.financialLog.pop(); // Удаляем самый старый элемент
        }
    }

    // ПРОВЕРКА И ДОСТИЖЕНИЯ АЧИВОК
    checkAchievement(achievementId, value) {
        // Если ачивка уже получена, ничего не делаем
        if (this.unlockedAchievements.has(achievementId)) return;

        const achievementData = ACHIEVEMENTS_DATA[achievementId];
        let currentProgress = this.achievementsProgress[achievementId];
    
        // Для накопительных ачивок - прибавляем значение, для остальных - просто устанавливаем
        if (['first_savings', 'builder', 'cashback_king'].includes(achievementId)) {
            currentProgress += value;
        } else {
            currentProgress = value;
        }
        this.achievementsProgress[achievementId] = currentProgress;

        // Проверяем, выполнено ли условие
        if (currentProgress >= achievementData.goal) {
            this.unlockedAchievements.add(achievementId);
            // Показываем всплывающее уведомление
            this.showAchievementUnlockedUI(achievementData);
        }
    }

    // НОВАЯ ФУНКЦИЯ ДЛЯ ПОКАЗА УВЕДОМЛЕНИЯ ОБ АЧИВКЕ
    showAchievementUnlockedUI(achievementData) {
        // Создаем временный контейнер для уведомления
        const notification = this.add.container(this.cameras.main.centerX, 100).setDepth(40000);
    
        const bg = this.add.graphics().fillStyle(0x2c3e50, 0.9).fillRoundedRect(-300, -60, 600, 120, 16);
        const icon = this.add.image(-230, 0, achievementData.id); // Цветная иконка
        const titleText = this.add.text(-150, -25, 'Достижение получено!', { fontSize: '28px', color: '#f1c40f' }).setOrigin(0, 0.5);
        const nameText = this.add.text(-150, 20, achievementData.name, { fontSize: '24px', color: '#ecf0f1' }).setOrigin(0, 0.5);
    
        notification.add([bg, icon, titleText, nameText]);
        notification.setAlpha(0).setScale(0.8);

        // Анимация появления и исчезновения
        this.tweens.add({
            targets: notification,
            alpha: 1,
            scale: 1,
            y: 200, // Спускается вниз
            duration: 500,
            ease: 'Power2',
            hold: 3000, // Держится на экране 3 секунды
            yoyo: true, // Возвращается назад
            onComplete: () => {
                notification.destroy();
            }
        });
    }

    // АНИМАЦИИ МАШИНОК
    createCarAnimations() {
        // --- Маршрут 1 (Горизонтальная дорога) ---
        // Определяем координаты старта и финиша. 
        // нужно будет подобрать их вручную, чтобы они соответствовали вашим дорогам на карте.
        const startX1 = -100; // Начинаем за левым краем экрана
        const endX1 = SCREEN_WIDTH + 100; // Заканчиваем за правым краем
        const yPos1 = 1075; // Y-координата вашей горизонтальной дороги

        // Создаем синюю машинку
        const carBlue = this.add.image(startX1, yPos1, 'car_blue').setDepth(yPos1);

        // Создаем анимацию (tween) для движения вперед
        this.tweens.add({
            targets: carBlue,
            x: endX1, // Целевая X-координата
            duration: 8000, // Время в пути (в миллисекундах)
            ease: 'Linear', // Движение с постоянной скоростью
            onUpdate: (tween) => {
                const car = tween.targets[0];
                car.setDepth(car.y + 50); // Постоянно обновляем глубину
            },
            flipX: false,   // Убедимся, что спрайт смотрит вправо
        
            // Эта часть кода выполнится, когда машинка доедет до конца
            onComplete: () => {
                // Разворачиваем машинку и отправляем назад
                carBlue.setFlipX(true);
                this.tweens.add({
                    targets: carBlue,
                    x: startX1, // Возвращаемся в начало
                    duration: 8000,
                    ease: 'Linear',
                    yoyo: true,     // После возвращения, анимация начнется заново
                    repeat: -1,     // -1 означает бесконечное повторение
                    delay: 1000     // Небольшая задержка перед стартом
                });
            }
        });
        // --- Маршрут 2 (Вертикальная дорога) ---
        const xPos2 = 700;
        const startY2 = 1100;
        const endY2 = -100;
        const totalDuration = 8000; // Увеличим общее время, чтобы скорость была приятнее

        const carRed = this.add.image(xPos2, startY2, 'car_red').setRotation(Phaser.Math.DegToRad(-90));
        carRed.setAlpha(0);

        // --- РАСЧЕТ ПАРАМЕТРОВ ---
        const totalDistance = startY2 - endY2; // Общее расстояние
        const fadeInDistance = 200; // Дистанция для появления
        const fadeOutDistance = 200; // Дистанция для исчезновения
        const mainDistance = totalDistance - fadeInDistance - fadeOutDistance; // Основная дистанция

        // Рассчитываем время для каждого этапа пропорционально дистанции
        const fadeInDuration = (fadeInDistance / totalDistance) * totalDuration;
        const mainDuration = (mainDistance / totalDistance) * totalDuration;
        const fadeOutDuration = (fadeOutDistance / totalDistance) * totalDuration;

        // Создаем "цепочку" анимаций
        const carTweenChain = this.tweens.chain({
            targets: carRed,
            loop: -1,
            loopDelay: 3000,

            tweens: [
                // --- Анимация 1: Появление ---
                {
                    y: startY2 - fadeInDistance,
                    alpha: 1,
                    duration: fadeInDuration, // Используем рассчитанное время
                    ease: 'Linear',
                    onUpdate: (tween) => {
                        const car = tween.targets[0];
                        car.setDepth(car.y + 100);
                    }
                },
                // --- Анимация 2: Основное движение ---
                {
                    y: endY2 + fadeOutDistance,
                    duration: mainDuration, // Используем рассчитанное время
                    ease: 'Linear',
                    onUpdate: (tween) => {
                        const car = tween.targets[0];
                        car.setDepth(car.y + 100);
                    }
                },
                // --- Анимация 3: Исчезновение ---
                {
                    y: endY2,
                    alpha: 0,
                    duration: fadeOutDuration, // Используем рассчитанное время
                    ease: 'Linear',
                    onUpdate: (tween) => {
                        const car = tween.targets[0];
                        car.setDepth(car.y + 50);
                    },
                    onComplete: (tween) => {
                        const car = tween.targets[0];
                        car.y = startY2;
                    }
                }
            ]
        });
        // --- ПАРЯЩАЯ ПТИЦА ---
        // 1. Задаем центр, вокруг которого будет летать птица
        const birdCenterX = 850;
        const birdCenterY = 1700;

        // 2. Создаем "путь" (траекторию) в форме эллипса.
        // Птица будет летать по этой невидимой линии.
        const path = new Phaser.Curves.Path(birdCenterX, birdCenterY - 20); // Начинаем с верхней точки
        path.ellipseTo(
            15, 25,           // x-радиус и y-радиус (ширина и высота эллипса)
            0, 360,           // начальный и конечный угол (полный круг)
            false,            // против часовой стрелки? нет
            0                 // угол поворота эллипса
        );

        // 3. Создаем объект, который будет "бежать" по нашему пути от 0 до 1
        // 0 = начало пути, 1 = конец пути
        const pathFollower = { t: 0 };

        // 4. Добавляем сам спрайт птицы в начальную точку пути
        const bird = this.add.follower(path, path.getStartPoint().x, path.getStartPoint().y, 'bird')
            .setDepth(birdCenterY);

        // 5. Запускаем анимацию не для птицы, а для "бегунка" pathFollower
        this.tweens.add({
            targets: pathFollower,
            t: 1, // Анимируем t от 0 (начало) до 1 (конец)
            ease: 'Linear',
            duration: 5000, // Время полного круга (10 секунд)
            repeat: -1, // Бесконечное повторение
            onUpdate: () => {
                bird.setPosition(path.getPoint(pathFollower.t).x, path.getPoint(pathFollower.t).y);
                bird.setDepth(bird.y);
            }
        });
    }

    // --- Функции для Брокерского счета ---
    openBrokerAccount() {
        const cost = 20000;
        const notificationText = this.uiContainer.getData('notification');
        if (this.brokerPortfolio > 0) { notificationText.setText('Счет уже открыт!'); return; }
        if (this.playerCoins < cost) { notificationText.setText('Недостаточно Койнов!'); return; }
    
        this.playerCoins -= cost;
        this.addFinancialLog(`-${cost} (Покупка акций)`, 'expense');
        this.brokerPortfolio = cost;
        this.hideCurrentUI();
        this.addXP(50);
        // Открываем панель заново, чтобы показать изменения
        createUIPanel(this, 'building'); 
    }
    sellBrokerAccount() {
        const currentValue = Math.floor(this.brokerPortfolio);
        this.playerCoins += currentValue;
        this.addFinancialLog(`+${currentValue} (Продажа акций)`, 'income');
        this.brokerPortfolio = 0;
        this.hideCurrentUI();
        this.addXP(20);
        // Открываем панель заново, чтобы показать изменения
        createUIPanel(this, 'building');
    }

    // --- Функция для Подписки "Бонус Плюс" ---
    activateBonusPlus() {
        const cost = 2000;
        const notificationText = this.uiContainer.getData('notification');
        if (this.isBonusPlusActive) { notificationText.setText('Подписка уже активна!'); return; }
        if (this.playerCoins < cost) { notificationText.setText('Недостаточно Койнов!'); return; }

        this.playerCoins -= cost;
        this.addFinancialLog(`-${cost} (Подписка "Бонус Плюс")`, 'expense');
        this.isBonusPlusActive = true;
        this.bonusPlusDaysLeft = 20;
        this.hideCurrentUI();
        this.addXP(25);
    }

    // --- Функция для Карты жителя ---
    issueResidentCard() {
        const cost = 5000;
        const notificationText = this.uiContainer.getData('notification');
        if (this.playerCoins < cost) { notificationText.setText('Недостаточно Койнов!'); return; }

        this.playerCoins -= cost;
        this.addFinancialLog(`-${cost} (Выпуск Карт жителя)`, 'expense');
        this.population += 5;
        this.cityHappiness += 10;
        this.updateHappinessDisplay();
        this.hideCurrentUI();
        this.addXP(30);
    }

    // --- Функция для крупных уведомлений ---
    showMajorNotification(title, text) {
        // Используем очередь, чтобы уведомление не конфликтовало с другими окнами
        this.uiQueue.push({ 
            type: 'major_notification', 
            data: { title: title, text: text } 
        });
        this.processUIQueue();
    }
    // --- Функция для звукового эффекта подтверждения ---
    playConfirmSound() {
        this.sound.play('confirm_sound', {
            volume: 0.2 // Немного тише, чтобы звук был приятным
        });
    }
    // --- Функция для создания HUD ---
    createHUD() {
        // --- ОБЩИЙ ФОН ШАПКИ ---
        const headerBg = this.add.graphics().setDepth(10000).setScrollFactor(0);
        headerBg.fillGradientStyle(0x060698, 0x060698, 0x1919EF, 0x1919EF, 1);
        headerBg.fillRect(0, 0, 1080, 230); // <-- Шапка стала ниже
        headerBg.fillStyle(0x58FFFF, 0.7).fillRect(0, 226, 1080, 7);
        // --- ЦЕНТРАЛЬНЫЙ БЛОК: ЗАГОЛОВОК ---
        this.add.text(this.cameras.main.centerX, 60, 'Капитал Сити', {
            fontFamily: '"Halvar Breitschrift"', fontSize: '64px', color: '#ffffff',
            // Убрали обводку, добавили мягкое свечение
            shadow: { offsetX: 0, offsetY: 0, color: '#58FFFF', blur: 20, fill: true }
        }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
        // --- ЛЕВЫЙ БЛОК: СЧАСТЬЕ И ОПЫТ ---
        const textStyle = { fontFamily: '"Gazprombank Sans"', fontSize: '32px', color: '#ffffff' };
 
        // Индикатор Счастья
        this.happinessIcon = this.add.image(50, 140, 'heart_icon').setOrigin(0, 0.5).setDepth(10001).setScrollFactor(0);
        this.happinessText = this.add.text(115, 140, `${this.cityHappiness}%`, { ...textStyle, color: '#DD41DB', fontSize: '36px' }).setOrigin(0, 0.5).setDepth(10001).setScrollFactor(0);
        // Шкала Опыта
        this.levelText = this.add.text(50, 190, `Уровень ${this.playerLevel}`, textStyle).setOrigin(0, 0.5).setDepth(10001).setScrollFactor(0);
        this.xpBarBg = this.add.graphics().fillStyle(0x000000, 0.5).fillRoundedRect(230, 180, 300, 20, 10).setDepth(10001).setScrollFactor(0);
        this.xpBar = this.add.graphics().setDepth(10002).setScrollFactor(0);
        this.xpText = this.add.text(380, 190, `${this.playerXP}/${this.xpToNextLevel}`, { fontFamily: '"Gazprombank Sans"', fontSize: '16px', color: '#ffffff' }).setOrigin(0.5).setDepth(10003).setScrollFactor(0);
        // --- ПРАВЫЙ БЛОК: БАЛАНС ---
        this.add.image(1030, 147, 'coin_icon').setOrigin(1, 0.5).setDepth(10001).setScrollFactor(0);
        this.coinsText = this.add.text(1030 - 65, 147, this.playerCoins, { ...textStyle, fontSize: '42px' }).setOrigin(1, 0.5).setDepth(10001).setScrollFactor(0);
        this.creditText = this.add.text(1030, 190, '', { ...textStyle, fontSize: '24px', color: '#dddddd', fontStyle: 'italic' }).setOrigin(1, 0.5).setVisible(false).setDepth(10001).setScrollFactor(0);
        this.mortgageText = this.add.text(this.cameras.main.centerX, 250, '', { fontSize: '24px', color: '#ffddaa', fontStyle: 'italic' }).setOrigin(0.5).setVisible(false).setDepth(10001).setScrollFactor(0);
        // --- ПАНЕЛЬ ИКОНОК ВНИЗУ (без изменений) ---
        const createIconButton = (scene, x, y, texture, onClick) => {
            const icon = scene.add.image(x, y, texture).setDepth(10002).setInteractive({ cursor: 'pointer' }).setScrollFactor(0).on('pointerdown', onClick);
            icon.on('pointerover', () => scene.tweens.add({ targets: icon, scale: 1.15, duration: 150, ease: 'Sine.easeInOut' }));
            icon.on('pointerout', () => scene.tweens.add({ targets: icon, scale: 1.0, duration: 150, ease: 'Sine.easeInOut' }));
            return icon;
        };
        const iconY = 1920 - 90;
        this.quizIcon = createIconButton(this, 500, iconY, 'quiz_icon', () => { this.quizIcon.setVisible(false); createUIPanel(this, 'quiz'); }).setVisible(false);
        const demolishBtn = createIconButton(this, 200, iconY, 'demolish_icon', () => { this.isDemolishMode = !this.isDemolishMode; demolishBtn.setTint(this.isDemolishMode ? 0xff8888 : 0xffffff); });
        createIconButton(this, 300, iconY, 'build_icon', () => { if (!this.uiContainer) createUIPanel(this, 'extra_build'); });
        createIconButton(this, 400, iconY, 'log_icon', () => { if (!this.uiContainer) createUIPanel(this, 'financial_log'); });
        createIconButton(this, 100, iconY, 'achievements_icon', () => { if (!this.uiContainer) createUIPanel(this, 'achievements_list'); });
        this.questIcon = createIconButton(this, 1080 - 100, iconY, 'quest_icon', () => { this.tweens.killTweensOf(this.questIcon); if (!this.uiContainer) { createUIPanel(this, 'quest'); } });
    }

}

const config = { type: Phaser.AUTO, width: SCREEN_WIDTH, height: 1920, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, parent: 'game-container', dom: { createContainer: true }, scene: [MainScene] };
const game = new Phaser.Game(config);