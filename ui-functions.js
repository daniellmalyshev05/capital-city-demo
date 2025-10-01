// ui-functions.js

function createUIPanel(scene, type, data = {}) {
    // Если уже есть открытый UI, ничего не делаем
    if (scene.uiContainer) return;

    const centerX = scene.cameras.main.centerX;
    const centerY = scene.cameras.main.centerY;

    // Создаем контейнер для всех элементов UI
    scene.uiContainer = scene.add.container(centerX, centerY).setDepth(20000);

    // Добавляем полупрозрачный фон на весь экран
    const background = scene.add.graphics().fillStyle(0x000000, 0.7).fillRect(-centerX, -centerY, 1080, 1920);
    scene.uiContainer.add(background);

    // --- 1. ПАНЕЛЬ СТРОИТЕЛЬСТВА ---
    if (type === 'build') {
        const panel = scene.add.graphics().fillStyle(0x060698, 1).lineStyle(2, 0xeeeeee, 1).fillRoundedRect(-350, -400, 700, 800, 16).strokeRoundedRect(-350, -400, 700, 800, 16);
        scene.uiContainer.add(panel);
        scene.uiContainer.add(scene.add.text(0, -350, 'Что построить?', { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5));

        let yPos = -250;
        for (const key in BUILDINGS_DATA) {
            const building = BUILDINGS_DATA[key];
            // НОВАЯ, ЕДИНСТВЕННО ВЕРНАЯ ПРОВЕРКА:
            // Здание доступно, если для него НЕТ требования по квесту (как у банка),
            // ИЛИ если текущий ID квеста игрока больше или равен требуемому.
            const isUnlocked = !building.requiredQuestId || scene.currentQuestId >= building.requiredQuestId;
            const canAfford = scene.playerCoins >= building.cost;

            let buttonText = `[ ${building.name} (${building.cost}) ]`;
            let buttonBgColor = '#008800'; // Зеленый - можно строить

            if (!isUnlocked) {
                buttonText = `[ ${building.name}\n(Требуется завершить квест) ]`;
                buttonBgColor = '#555555'; // Серый - заблокировано по уровню
            } else if (!canAfford) {
                buttonBgColor = '#880000'; // Красный - не хватает денег
            }

            const button = scene.add.text(0, yPos, buttonText, { fontSize: '36px', backgroundColor: buttonBgColor, padding: { x: 20, y: 10 } }).setOrigin(0.5);

            if (isUnlocked && canAfford) {
                button.setInteractive({ cursor: 'pointer' });
                button.on('pointerdown', () => scene.buildBuilding(key));
            }
            scene.uiContainer.add(button);
            yPos += 120;
        }

        const noButton = scene.add.text(0, 450, '[ Отмена ]', { fontSize: '32px', backgroundColor: '#880000', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        noButton.on('pointerdown', () => scene.hideCurrentUI());
        scene.uiContainer.add(noButton);
    }
    // --- 2. ПАНЕЛЬ УПРАВЛЕНИЯ ЗДАНИЕМ ---
    else if (type === 'building') {
        const info = scene.lastSelectedBuilding.getData('buildingInfo');
        const panel = scene.add.graphics().fillStyle(0x060698, 1).lineStyle(2, 0xecf0f1, 1).fillRoundedRect(-350, -450, 700, 900, 16).strokeRoundedRect(-350, -450, 700, 900, 16);
        scene.uiContainer.add(panel);

        const buildingLevel = info.level || 1;
        scene.uiContainer.add(scene.add.text(0, -400, `${info.name} (LVL ${buildingLevel})`, { fontSize: '48px', color: '#ecf0f1' }).setOrigin(0.5));

        const notificationText = scene.add.text(0, 380, '', { fontSize: '32px', color: '#ffdddd' }).setOrigin(0.5);
        scene.uiContainer.add(notificationText);
        scene.uiContainer.setData('notification', notificationText);

        let yPos = -280;

        // БЛОК ИНФОГРАФИКИ
        if (info.bonuses) {
            if (info.bonuses.population) {
                scene.uiContainer.add(scene.add.text(-320, yPos, `💚 ${info.bonuses.population.text}`, { fontSize: '28px', color: '#2ecc71' }));
                yPos += 50;
            }
            if (info.bonuses.income) {
                scene.uiContainer.add(scene.add.text(-320, yPos, `💰 ${info.bonuses.income.text}`, { fontSize: '28px', color: '#f39c12' }));
                yPos += 50;
            }
        }
        yPos += 50;
        // Сначала всегда показываем описание, если оно есть
        if (info.description) {
            scene.uiContainer.add(scene.add.text(0, yPos, info.description, { fontSize: '32px', align: 'center', color: '#cccccc', wordWrap: { width: 650 } }).setOrigin(0.5));
            yPos += 130; // Сдвигаем позицию для следующих элементов
        }
        // Затем показываем кнопку улучшения (если есть)
        if (info.upgrade && !info.level) { // info.level отсутствует у зданий 1-го уровня
            const canAfford = scene.playerCoins >= info.upgrade.cost;
            const levelRequirementMet = scene.playerLevel >= info.upgrade.requiredLevel;
            let buttonText = `[ Улучшить (${info.upgrade.cost}) ]`;
            let bgColor = '#e67e22'; // Оранжевый, можно улучшить

            if (!levelRequirementMet) {
                buttonText = `[ Улучшить (нужен LVL ${info.upgrade.requiredLevel}) ]`;
                bgColor = '#555555'; // Серый, заблокировано
            } else if (!canAfford) {
                // Красный, не хватает денег (эта проверка остается)
                bgColor = '#880000'; 
            }

            const upgradeButton = scene.add.text(0, yPos, buttonText, { fontSize: '32px', backgroundColor: bgColor, padding: { x: 15, y: 8 } }).setOrigin(0.5);

            if (canAfford && levelRequirementMet) {
                upgradeButton.setInteractive({ cursor: 'pointer' });
                upgradeButton.on('pointerdown', () => scene.upgradeBuilding());
            }
            scene.uiContainer.add(upgradeButton);
            yPos += 100;
        }
        // А потом показываем продукты, если они есть
        if (info.products && info.products.length > 0) {
            info.products.forEach(product => {
                const isUnlocked = buildingLevel >= product.requiredLevel;
                let buttonText = product.name;
                const buttonBgColor = isUnlocked ? '#3498db' : '#555555';

                if (!isUnlocked) {
                    buttonText = `${product.name}\n(Нужен LVL 2 здания)`;
                }

                const productButtonStyle = { fontSize: '36px', backgroundColor: buttonBgColor, padding: { x: 25, y: 15 }, color: '#ecf0f1', wordWrap: { width: 500 }, align: 'center' };
                const productButton = scene.add.text(0, yPos, buttonText, productButtonStyle).setOrigin(0.5);

                if (isUnlocked) {
                    productButton.setInteractive({ cursor: 'pointer' });
                    productButton.on('pointerdown', () => { scene.hideCurrentUI(); createUIPanel(scene, product.id); });
                }
                scene.uiContainer.add(productButton);
                yPos += 180; // Увеличил отступ для многострочных названий
            });
        }
        // КНОПКА ЗАКРЫТИЯ
        const closeButton = scene.add.image(350 - 30, -450 + 30, 'close_button').setInteractive({ cursor: 'pointer' });
        closeButton.on('pointerdown', () => scene.hideCurrentUI());
        scene.uiContainer.add(closeButton);
    }
    // --- 3. ПАНЕЛИ ПРОДУКТОВ ---
    else if (type === 'product_deposit') {
        const panel = scene.add.graphics().fillStyle(0x1a2530, 1).lineStyle(2, 0x77aaff, 1).fillRoundedRect(-400, -400, 800, 750, 16).strokeRoundedRect(-400, -400, 800, 750, 16);
        scene.uiContainer.add(panel);
        scene.uiContainer.add(scene.add.text(0, -350, 'Накопительный счет', { fontSize: '48px', color: '#ecf0f1' }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -250, 'Вложите Койны, чтобы получать пассивный доход.\nСтавка: до 15% годовых', { fontSize: '32px', align: 'center', color: '#cccccc', wordWrap: { width: 750 } }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -50, `Текущий вклад: ${scene.depositAmount} Койнов`, { fontSize: '32px', color: '#aaffaa' }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, 50, 'Сумма для нового вклада:', { fontSize: '32px' }).setOrigin(0.5));

        const inputElement = document.getElementById('deposit-input');
        inputElement.style.display = 'block';
        const canvas = scene.sys.game.canvas;
        const gameScale = canvas.clientWidth / scene.sys.game.config.width;
        const inputHeight = 50 * gameScale;
        const canvasCenterX = canvas.offsetLeft + (canvas.clientWidth / 2);
        const canvasCenterY = canvas.offsetTop + (canvas.clientHeight / 2) + (85 * gameScale); // Скорректировано положение
        inputElement.style.left = `${canvasCenterX - (inputElement.offsetWidth / 2)}px`;
        inputElement.style.top = `${canvasCenterY - (inputHeight / 2)}px`;
        inputElement.style.transform = `scale(${gameScale})`;

        const yesButton = scene.add.text(-120, 230, '[ Вложить ]', { fontSize: '32px', backgroundColor: '#008800', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        yesButton.on('pointerdown', () => scene.makeDeposit());
        const noButton = scene.add.text(120, 230, '[ Назад ]', { fontSize: '32px', backgroundColor: '#880000', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        noButton.on('pointerdown', () => { scene.hideCurrentUI(); createUIPanel(scene, 'building'); });
        // ui-functions.js - в блоке product_deposit
        const infoButton = scene.add.text(0, 300, '[ Узнать о реальном продукте ]', { fontSize: '28px', color: '#77aaff' }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        infoButton.on('pointerdown', () => {
            openUrl('https://www.gazprombank.ru/accounts/save-easy/'); // <-- ВАША ССЫЛКА ЗДЕСЬ
        });
        scene.uiContainer.add(infoButton);

        const notificationText = scene.add.text(0, 180, '', { fontSize: '32px', color: '#ffdddd' }).setOrigin(0.5); // Скорректировано положение
        scene.uiContainer.add([yesButton, noButton, notificationText]);
        scene.uiContainer.setData('notification', notificationText);
    }
    else if (type === 'product_credit') {
        const panel = scene.add.graphics().fillStyle(0x1a2530, 1).lineStyle(2, 0xffa07a, 1).fillRoundedRect(-400, -400, 800, 700, 16).strokeRoundedRect(-400, -400, 800, 700, 16);
        scene.uiContainer.add(panel);
        scene.uiContainer.add(scene.add.text(0, -350, 'Кредитная карта', { fontSize: '48px', color: '#ecf0f1' }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -200, 'Получите Койны для срочных нужд.\nВерните их в течение 12 игровых дней,\nчтобы не платить проценты.\n\nРеальные условия: до 180 дней без %', { fontSize: '32px', align: 'center', color: '#cccccc', wordWrap: { width: 750 } }).setOrigin(0.5));

        const backButton = scene.add.text(0, 280, '[ Назад ]', { fontSize: '32px', backgroundColor: '#880000', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        backButton.on('pointerdown', () => { scene.hideCurrentUI(); createUIPanel(scene, 'building'); });

        const notificationText = scene.add.text(0, 50, '', { fontSize: '32px', color: '#ffdddd' }).setOrigin(0.5);
        scene.uiContainer.add([backButton, notificationText]);
        scene.uiContainer.setData('notification', notificationText);

        if (scene.hasActiveCredit) {
            const repayButton = scene.add.text(0, 150, `[ Погасить ${scene.creditDebt} К ]`, { fontSize: '32px', backgroundColor: '#e67e22', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
            repayButton.on('pointerdown', () => scene.repayCredit());
            scene.uiContainer.add(repayButton);
        } else {
            const getCreditButton = scene.add.text(0, 150, '[ Получить 5000 Койнов ]', { fontSize: '32px', backgroundColor: '#27ae60', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
            getCreditButton.on('pointerdown', () => scene.takeCredit());
            scene.uiContainer.add(getCreditButton);
        }

        // Новая кнопка
        const infoButton = scene.add.text(0, 220, '[ Узнать о реальном продукте ]', { fontSize: '28px', color: '#ffA500' }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        infoButton.on('pointerdown', () => {
            openUrl('https://www.gazprombank.ru/personal/credit-cards/7950641/');
        });
        scene.uiContainer.add(infoButton);
    }
    else if (type === 'product_mortgage') {
        const panel = scene.add.graphics().fillStyle(0x1a2530, 1).lineStyle(2, 0x9b59b6, 1).fillRoundedRect(-400, -400, 800, 700, 16).strokeRoundedRect(-400, -400, 800, 700, 16);
        scene.uiContainer.add(panel);
        scene.uiContainer.add(scene.add.text(0, -350, 'Ипотека', { fontSize: '48px', color: '#ecf0f1' }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -200, `Срок: 30 дней. Платеж: ${scene.mortgagePayment}/день.\nПолучите крупную сумму для постройки\nЖилого Квартала.`, { fontSize: '32px', align: 'center', color: '#cccccc', wordWrap: { width: 750 } }).setOrigin(0.5));
    
        const backButton = scene.add.text(0, 280, '[ Назад ]', { fontSize: '32px', backgroundColor: '#880000', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        backButton.on('pointerdown', () => { scene.hideCurrentUI(); createUIPanel(scene, 'building'); });
    
        const notificationText = scene.add.text(0, 50, '', { fontSize: '32px', color: '#ffdddd' }).setOrigin(0.5);
        scene.uiContainer.add([backButton, notificationText]);
        scene.uiContainer.setData('notification', notificationText);

        if (!scene.hasMortgage) {
            const getButton = scene.add.text(0, 150, '[ Получить 70000 Койнов ]', { fontSize: '32px', backgroundColor: '#8e44ad', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
            getButton.on('pointerdown', () => scene.takeMortgage());
            scene.uiContainer.add(getButton);
        } else {
             scene.uiContainer.add(scene.add.text(0, 150, `Ипотека уже активна!\nОсталось: ${scene.mortgageDaysLeft} д.`, { fontSize: '36px', align: 'center', color: '#ffddaa' }).setOrigin(0.5));
        }

        // Новая кнопка
        const infoButton = scene.add.text(0, 220, '[ Узнать о реальном продукте ]', { fontSize: '28px', color: '#c39bd3' }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        infoButton.on('pointerdown', () => {
            openUrl('https://www.gazprombank.ru/personal/take_credit/mortgage/5546683/');
        });
        scene.uiContainer.add(infoButton);
    }
    else if (type === 'product_pds') {
        const panel = scene.add.graphics().fillStyle(0x3d3d5c, 1).lineStyle(2, 0xaaaaff, 1).fillRoundedRect(-400, -400, 800, 700, 16).strokeRoundedRect(-400, -400, 800, 700, 16);
        scene.uiContainer.add(panel);
        scene.uiContainer.add(scene.add.text(0, -350, 'Программа долгосрочных сбережений', { fontSize: '42px', color: '#ecf0f1', wordWrap: { width: 750 }, align: 'center' }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -200, 'Вложите средства с господдержкой.\nГарантированный доход по окончании\nпрограммы через 30 дней.', { fontSize: '32px', align: 'center', color: '#cccccc', wordWrap: { width: 750 } }).setOrigin(0.5));

        const backButton = scene.add.text(0, 280, '[ Назад ]', { fontSize: '32px', backgroundColor: '#880000', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        backButton.on('pointerdown', () => { scene.hideCurrentUI(); createUIPanel(scene, 'building'); });

        const notificationText = scene.add.text(0, 50, '', { fontSize: '32px', color: '#ffdddd' }).setOrigin(0.5);
        scene.uiContainer.add([backButton, notificationText]);
        scene.uiContainer.setData('notification', notificationText);

        if (scene.pdsInvestment > 0) {
             scene.uiContainer.add(scene.add.text(0, 150, `Накоплено в ПДС: ${Math.floor(scene.pdsInvestment)} Койнов\nВернется через: ${scene.pdsMaturityDays} д.`, { fontSize: '36px', align: 'center', color: '#aaaaff' }).setOrigin(0.5));
        } else {
            const investButton = scene.add.text(0, 150, '[ Вложить 25000 Койнов ]', { fontSize: '32px', backgroundColor: '#0055a4', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
            investButton.on('pointerdown', () => scene.investInPDS());
            scene.uiContainer.add(investButton);
        }

        const infoButton = scene.add.text(0, 220, '[ Узнать о реальном продукте ]', { fontSize: '28px', color: '#aaaaff' }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        infoButton.on('pointerdown', () => {
            openUrl('https://www.gazprombank.ru/personal/page/pds/');
        });
        scene.uiContainer.add(infoButton);
    }
    else if (type === 'product_cashback') {
        // Высота панели увеличена с 600 до 650 для дополнительного пространства
        const panel = scene.add.graphics().fillStyle(0x1a2530, 1).lineStyle(2, 0x2ecc71, 1).fillRoundedRect(-400, -350, 800, 650, 16).strokeRoundedRect(-400, -350, 800, 650, 16);
        scene.uiContainer.add(panel);
        scene.uiContainer.add(scene.add.text(0, -300, 'Умная карта', { fontSize: '48px', color: '#ecf0f1' }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -180, 'Получайте 5% кэшбэка со всех трат\nна строительство в течение 10 дней!', { fontSize: '32px', align: 'center', color: '#cccccc', wordWrap: { width: 750 } }).setOrigin(0.5));

        // Кнопка "Назад" сдвинута ниже
        const backButton = scene.add.text(0, 260, '[ Назад ]', { fontSize: '32px', backgroundColor: '#880000', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        backButton.on('pointerdown', () => { scene.hideCurrentUI(); createUIPanel(scene, 'building'); });
        scene.uiContainer.add(backButton);

        // Основная кнопка/текст сдвинуты ниже для лучшей компоновки
        if (scene.isCashbackActive) {
            const timerText = scene.add.text(0, 80, `Кэшбэк активен!\nОсталось: ${scene.cashbackDaysLeft} д.`, { fontSize: '36px', align: 'center', color: '#2ecc71' }).setOrigin(0.5);
            scene.uiContainer.add(timerText);
        } else {
            const activateButton = scene.add.text(0, 80, '[ Активировать на 10 дней ]', { fontSize: '32px', backgroundColor: '#27ae60', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
            activateButton.on('pointerdown', () => scene.activateCashback());
            scene.uiContainer.add(activateButton);
        }

        // Новая кнопка
        const infoButton = scene.add.text(0, 180, '[ Узнать о реальном продукте ]', { fontSize: '28px', color: '#2ecc71' }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        infoButton.on('pointerdown', () => {
            openUrl('https://www.gazprombank.ru/personal/cards/7579039/');
        });
        scene.uiContainer.add(infoButton);
    }
    else if (type === 'product_insurance') {
        const panel = scene.add.graphics().fillStyle(0x1a2530, 1).lineStyle(2, 0xf1c40f, 1).fillRoundedRect(-400, -350, 800, 650, 16).strokeRoundedRect(-400, -350, 800, 650, 16);
        scene.uiContainer.add(panel);
        scene.uiContainer.add(scene.add.text(0, -300, 'Страхование имущества', { fontSize: '48px', color: '#ecf0f1' }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -180, 'Защитите город от случайных\nфинансовых потерь на 20 дней.', { fontSize: '32px', align: 'center', color: '#cccccc', wordWrap: { width: 750 } }).setOrigin(0.5));

        const backButton = scene.add.text(0, 250, '[ Назад ]', { fontSize: '32px', backgroundColor: '#880000', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        backButton.on('pointerdown', () => { scene.hideCurrentUI(); createUIPanel(scene, 'building'); });

        const notificationText = scene.add.text(0, -20, '', { fontSize: '32px', color: '#ffdddd' }).setOrigin(0.5);
        scene.uiContainer.add([backButton, notificationText]);
        scene.uiContainer.setData('notification', notificationText);

        if (scene.isInsured) {
            const timerText = scene.add.text(0, 80, `Страховка активна!\nОсталось: ${scene.insuranceDaysLeft} д.`, { fontSize: '36px', align: 'center', color: '#f1c40f' }).setOrigin(0.5);
            scene.uiContainer.add(timerText);
        } else {
            const activateButton = scene.add.text(0, 80, '[ Оформить за 2000 Койнов ]', { fontSize: '32px', backgroundColor: '#f39c12', padding: { x: 15, y: 8 }, color: '#000000' }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
            activateButton.on('pointerdown', () => scene.activateInsurance());
            scene.uiContainer.add(activateButton);
        }

        // Новая кнопка
        const infoButton = scene.add.text(0, 180, '[ Узнать о реальном продукте ]', { fontSize: '28px', color: '#f1c40f' }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        infoButton.on('pointerdown', () => {
            openUrl('https://www.gazprombank.ru/personal/page/insurance-service-products/');
        });
        scene.uiContainer.add(infoButton);
    }
    else if (type === 'product_cyber') {
        const panel = scene.add.graphics().fillStyle(0x1a2530, 1).lineStyle(2, 0x1abc9c, 1).fillRoundedRect(-400, -350, 800, 650, 16).strokeRoundedRect(-400, -350, 800, 650, 16);
        scene.uiContainer.add(panel);
        scene.uiContainer.add(scene.add.text(0, -300, 'Защита счетов', { fontSize: '48px', color: '#ecf0f1' }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -180, 'Активируйте защиту от мошенников\nи фишинговых атак на 20 дней.', { fontSize: '32px', align: 'center', color: '#cccccc', wordWrap: { width: 750 } }).setOrigin(0.5));

        const backButton = scene.add.text(0, 280, '[ Назад ]', { fontSize: '32px', backgroundColor: '#880000', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        backButton.on('pointerdown', () => { scene.hideCurrentUI(); createUIPanel(scene, 'building'); });

        const notificationText = scene.add.text(0, -20, '', { fontSize: '32px', color: '#ffdddd' }).setOrigin(0.5);
        scene.uiContainer.add([backButton, notificationText]);
        scene.uiContainer.setData('notification', notificationText);

        if (scene.isCyberProtected) {
            const timerText = scene.add.text(0, 80, `Защита активна!\nОсталось: ${scene.cyberProtectionDaysLeft} д.`, { fontSize: '36px', align: 'center', color: '#1abc9c' }).setOrigin(0.5);
            scene.uiContainer.add(timerText);
        } else {
            const activateButton = scene.add.text(0, 80, '[ Активировать за 1500 Койнов ]', { fontSize: '32px', backgroundColor: '#16a085', padding: { x: 15, y: 8 }, color: '#ffffff' }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
            activateButton.on('pointerdown', () => scene.activateCyberProtection());
            scene.uiContainer.add(activateButton);
        }

        // Новая кнопка
        const infoButton = scene.add.text(0, 230, '[ Узнать о реальном продукте ]', { fontSize: '28px', color: '#1abc9c' }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        infoButton.on('pointerdown', () => {
            openUrl('https://gpbmobile.ru/safe');
        });
        scene.uiContainer.add(infoButton);
        // Дополнительная кнопка со статьей
        const articleButton = scene.add.text(0, 180, 'Про то, как защититься от мошенников, можно почитать тут.', { fontSize: '24px', color: '#aaffaa', align: 'center', wordWrap: { width: 700 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        articleButton.on('pointerdown', () => {
            openUrl('https://www.gazprombank.ru/pro-finance/safety/kak-zashchitit-dengi-na-bankovskoi-karte/');
        });
        scene.uiContainer.add(articleButton);
    }
    // --- НОВАЯ ПАНЕЛЬ: БРОКЕРСКИЙ СЧЕТ ---
    else if (type === 'product_broker') {
        const panel = scene.add.graphics().fillStyle(0x1a2530, 1).lineStyle(2, 0x3498db, 1).fillRoundedRect(-400, -400, 800, 750, 16).strokeRoundedRect(-400, -400, 800, 750, 16);
        scene.uiContainer.add(panel);
        scene.uiContainer.add(scene.add.text(0, -350, 'Брокерский счет', { fontSize: '48px', color: '#ecf0f1' }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -220, 'Инвестируйте в акции и получайте\nдивиденды. Стоимость портфеля\nменяется каждый день.', { fontSize: '32px', align: 'center', color: '#cccccc' }).setOrigin(0.5));
        
        // Кнопка со ссылкой на реальный продукт
        const infoButton = scene.add.text(0, 280, '[ Узнать о реальном продукте ]', { fontSize: '28px', color: '#3498db' }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        infoButton.on('pointerdown', () => {
            openUrl('https://www.gazprombank.ru/personal/distance/investapp/'); 
        });
        scene.uiContainer.add(infoButton);
        const backButton = scene.add.text(0, 320, '[ Назад ]', { fontSize: '32px', backgroundColor: '#880000', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        backButton.on('pointerdown', () => { scene.hideCurrentUI(); createUIPanel(scene, 'building'); });
    
        const notificationText = scene.add.text(0, -50, '', { fontSize: '32px', color: '#ffdddd' }).setOrigin(0.5);
        scene.uiContainer.add([backButton, notificationText]);
        scene.uiContainer.setData('notification', notificationText);

        if (scene.brokerPortfolio > 0) {
            const portfolioValue = Math.floor(scene.brokerPortfolio);
            const color = portfolioValue >= 20000 ? '#aaffaa' : '#ffaaaa';
            scene.uiContainer.add(scene.add.text(0, 80, `Стоимость портфеля:`, { fontSize: '36px', color: '#ffffff' }).setOrigin(0.5));
            scene.uiContainer.add(scene.add.text(0, 140, `${portfolioValue} Койнов`, { fontSize: '48px', color: color }).setOrigin(0.5));
            const sellButton = scene.add.text(0, 240, '[ Продать портфель ]', { fontSize: '32px', backgroundColor: '#e67e22', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
            sellButton.on('pointerdown', () => scene.sellBrokerAccount());
            scene.uiContainer.add(sellButton);
        } else {
            const buyButton = scene.add.text(0, 150, '[ Купить акции на 20000 Койнов ]', { fontSize: '32px', backgroundColor: '#2980b9', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
            buyButton.on('pointerdown', () => scene.openBrokerAccount());
            scene.uiContainer.add(buyButton);
        }
    }
    // --- НОВАЯ ПАНЕЛЬ: ПОДПИСКА "БОНУС ПЛЮС" ---
    else if (type === 'product_bonus_plus') {
        const panel = scene.add.graphics().fillStyle(0x1a2530, 1).lineStyle(2, '#f1c40f', 1).fillRoundedRect(-400, -350, 800, 650, 16).strokeRoundedRect(-400, -350, 800, 650, 16);
        scene.uiContainer.add(panel);
        scene.uiContainer.add(scene.add.text(0, -300, 'Подписка "Бонус Плюс"', { fontSize: '48px', color: '#ecf0f1' }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -180, 'Увеличивает все налоговые\nпоступления на 10%.\nДействует 20 дней.', { fontSize: '32px', align: 'center', color: '#cccccc' }).setOrigin(0.5));
        // Кнопка со ссылкой на реальный продукт
        const infoButton = scene.add.text(0, 190, '[ Узнать о реальном продукте ]', { fontSize: '28px', color: '#f1c40f' }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        infoButton.on('pointerdown', () => {
            openUrl('https://www.gazprombank.ru/personal/page/gazprom-bonus-plus/'); 
        });
        scene.uiContainer.add(infoButton);
        const backButton = scene.add.text(0, 250, '[ Назад ]', { fontSize: '32px', backgroundColor: '#880000', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        backButton.on('pointerdown', () => { scene.hideCurrentUI(); createUIPanel(scene, 'building'); });

        const notificationText = scene.add.text(0, -20, '', { fontSize: '32px', color: '#ffdddd' }).setOrigin(0.5);
        scene.uiContainer.add([backButton, notificationText]);
        scene.uiContainer.setData('notification', notificationText);

        if (scene.isBonusPlusActive) {
            scene.uiContainer.add(scene.add.text(0, 120, `Подписка активна!\n+10% к налогам\nОсталось: ${scene.bonusPlusDaysLeft} д.`, { fontSize: '36px', align: 'center', color: '#f1c40f' }).setOrigin(0.5));
        } else {
            const subscribeButton = scene.add.text(0, 120, '[ Оформить за 2000 Койнов ]', { fontSize: '32px', backgroundColor: '#f39c12', color: '#000000', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
            subscribeButton.on('pointerdown', () => scene.activateBonusPlus());
            scene.uiContainer.add(subscribeButton);
        }
    }

    // --- НОВАЯ ПАНЕЛЬ: КАРТА ЖИТЕЛЯ ---
    else if (type === 'product_resident_card') {
        const panel = scene.add.graphics().fillStyle(0x1a2530, 1).lineStyle(2, '#2ecc71', 1).fillRoundedRect(-400, -350, 800, 650, 16).strokeRoundedRect(-400, -350, 800, 650, 16);
        scene.uiContainer.add(panel);
        scene.uiContainer.add(scene.add.text(0, -300, 'Карта жителя', { fontSize: '48px', color: '#ecf0f1' }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -150, 'Выпуск карт жителя улучшит\nинфраструктуру, повысит счастье\nи привлечет новых людей в город.\n\nБонус: +10% счастья, +5 населения', { fontSize: '32px', align: 'center', color: '#cccccc' }).setOrigin(0.5));
        // Кнопка со ссылкой на реальный продукт
        const infoButton = scene.add.text(0, 200, '[ Узнать о реальном продукте ]', { fontSize: '28px', color: '#2ecc71' }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        infoButton.on('pointerdown', () => {
            openUrl('https://www.gazprombank.ru/personal/cards/6486911/'); 
        });
        scene.uiContainer.add(infoButton);
        const backButton = scene.add.text(0, 250, '[ Назад ]', { fontSize: '32px', backgroundColor: '#880000', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        backButton.on('pointerdown', () => { scene.hideCurrentUI(); createUIPanel(scene, 'building'); });

        const notificationText = scene.add.text(0, 50, '', { fontSize: '32px', color: '#ffdddd' }).setOrigin(0.5);
        scene.uiContainer.add([backButton, notificationText]);
        scene.uiContainer.setData('notification', notificationText);

        const issueButton = scene.add.text(0, 150, '[ Выпустить карты за 5000 Койнов ]', { fontSize: '32px', backgroundColor: '#27ae60', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        issueButton.on('pointerdown', () => scene.issueResidentCard());
        scene.uiContainer.add(issueButton);
    }
    // --- 4. ПАНЕЛЬ КВИЗА ---
    else if (type === 'quiz') {
        const quizSet = scene.activeQuiz.set;
        const currentQuestionIndex = scene.activeQuiz.currentQuestionIndex;
        const questionData = quizSet.questions[currentQuestionIndex];

        const panel = scene.add.graphics().fillStyle(0x060698, 1).lineStyle(2, 0xBDCEFA, 1).fillRoundedRect(-450, -500, 900, 1000, 16).strokeRoundedRect(-450, -500, 900, 1000, 16);
        scene.uiContainer.add(panel);
        scene.uiContainer.add(scene.add.text(0, -450, quizSet.setName, { fontSize: '48px', color: '#BDCEFA' }).setOrigin(0.5));

        // --- ДОБАВЛЕНО: Счетчик вопросов ---
        const progressText = `Вопрос ${currentQuestionIndex + 1} / ${quizSet.questions.length}`;
        scene.uiContainer.add(scene.add.text(0, -400, progressText, { fontSize: '32px', color: '#BDCEFA' }).setOrigin(0.5));
    
        scene.uiContainer.add(scene.add.text(0, -280, questionData.question, { fontSize: '36px', align: 'center', color: '#DEE1EE', wordWrap: { width: 850 } }).setOrigin(0.5));
    
        let yPos = -100;
        questionData.answers.forEach((answer, index) => {
            const answerButtonStyle = { fontSize: '32px', backgroundColor: '#34495e', padding: { x: 20, y: 10 }, color: '#ecf0f1', wordWrap: { width: 700 }, align: 'center'};
            const answerButton = scene.add.text(0, yPos, answer, answerButtonStyle).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
            answerButton.on('pointerdown', () => scene.answerQuiz(index));
            scene.uiContainer.add(answerButton);
            yPos += 150;
        });

        // Сдвигаем текст уведомления ниже
        const notificationText = scene.add.text(0, yPos + 20, '', { fontSize: '32px', color: '#ffdddd', align: 'center', wordWrap: { width: 850 } }).setOrigin(0.5);
        scene.uiContainer.add(notificationText);
        scene.uiContainer.setData('notification', notificationText);

        // --- ДОБАВЛЕНО: Кнопка закрытия (крестик) ---
        const closeButton = scene.add.image(450 - 30, -500 + 30, 'close_button').setInteractive({ cursor: 'pointer' });
        closeButton.on('pointerdown', () => {
            scene.hideCurrentUI();
            scene.activeQuiz = null; // Важно! Сбрасываем квиз, чтобы иконка могла появиться снова
        });
        scene.uiContainer.add(closeButton);
    }

    else if (type === 'level_up') {
        const panel = scene.add.graphics().fillStyle(0x060698, 1).lineStyle(4, 0xBDCEFA, 1).fillRoundedRect(-350, -400, 700, 800, 16).strokeRoundedRect(-350, -400, 700, 800, 16);
        scene.uiContainer.add(panel);
        scene.uiContainer.add(scene.add.text(0, -320, `Новый уровень: ${data.level}!`, { fontSize: '64px', color: '#58FFFF', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -200, 'Открыт доступ:', { fontSize: '42px', color: '#ecf0f1' }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -100, data.unlocks, { fontSize: '36px', color: '#ddffdd', align: 'center', wordWrap: { width: 650 } }).setOrigin(0.5));
    
        // Показываем предупреждение, если оно есть
        if (data.warnings) {
            scene.uiContainer.add(scene.add.text(0, 100, data.warnings, { fontSize: '32px', color: '#ffdddd', align: 'center', wordWrap: { width: 650 } }).setOrigin(0.5));
        }

        const okButton = scene.add.text(0, 320, '[ Отлично! ]', { fontSize: '32px', backgroundColor: '#3498db', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        okButton.on('pointerdown', () => scene.hideCurrentUI());
        scene.uiContainer.add(okButton);
    }
    // --- 5. ПАНЕЛЬ ДОПОЛНИТЕЛЬНЫХ ПОСТРОЕК ---
    else if (type === 'extra_build') {
        const panel = scene.add.graphics().fillStyle(0x060698, 1).lineStyle(2, 0xeeeeee, 1).fillRoundedRect(-500, -700, 1000, 1400, 16).strokeRoundedRect(-500, -700, 1000, 1400, 16);
        scene.uiContainer.add(panel);
        scene.uiContainer.add(scene.add.text(0, -650, 'Дополнительные постройки', { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5));

        const activeTabColor = '#3498db'; const inactiveTabColor = '#555555';
        // --- РАСПОЛОЖЕНИЕ ДЛЯ ТРЕХ ВКЛАДОК ---
        const economyTab = scene.add.text(-330, -580, '[ Экономика ]', { fontSize: '36px', backgroundColor: activeTabColor, padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        const decorTab = scene.add.text(0, -580, '[ Декор ]', { fontSize: '36px', backgroundColor: inactiveTabColor, padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        const baseTab = scene.add.text(330, -580, '[ База ]', { fontSize: '36px', backgroundColor: inactiveTabColor, padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
    
        const economyContent = scene.add.container(0, 0);
        const decorContent = scene.add.container(0, 0).setVisible(false);
        const baseContent = scene.add.container(0, 0).setVisible(false); // Новый контейнер для "Базы"

        const createButtons = (category, container) => {
            let yPos = -450;
            for (const key in EXTRA_BUILDINGS_DATA) {
                const building = EXTRA_BUILDINGS_DATA[key];
                if (building.category === category) {
                    const isUnlocked = scene.playerLevel >= building.requiredLevel;
                    const canAfford = scene.playerCoins >= building.cost;
                    let buttonText = `[ ${building.name} (${building.cost}) ]`;
                    let bgColor = '#27ae60'; // Зеленый по умолчанию

                    if (!isUnlocked) {
                        buttonText = `[ ${building.name} (LVL ${building.requiredLevel}) ]`;
                        bgColor = '#555555'; // Серый, если заблокировано
                    } else if (!canAfford) {
                        bgColor = '#880000'; // Красный, если не хватает денег
                    }
                    const button = scene.add.text(0, yPos, `[ ${building.name} (${building.cost}) ]`, { fontSize: '32px', backgroundColor: bgColor, padding: {x: 15, y: 8} }).setOrigin(0.5);
                    button.setText(buttonText).setBackgroundColor(bgColor);
                    // Кнопка интерактивна только если все условия выполнены
                    if (isUnlocked && canAfford) {
                        button.setInteractive({ cursor: 'pointer' });
                        // Передаем false, так как это не элемент сетки
                        button.on('pointerdown', () => scene.enterBuildMode(key, false));
                    }
                    container.add(button);
                    yPos += 100;
                }
            }
        };
    
        // --- НОВЫЙ КОД: СОЗДАНИЕ КНОПОК ДЛЯ БАЗОВЫХ ЭЛЕМЕНТОВ ---
        const createBaseButtons = (container) => {
            const baseItems = {
                'slot': { name: 'Слот для здания', cost: 1000 },
                'road_h': { name: 'Дорога (горизонт.)', cost: 200 },
                'road_v': { name: 'Дорога (вертик.)', cost: 200 }
            };
            let yPos = -450;
            for (const key in baseItems) {
                const item = baseItems[key];
                const canAfford = scene.playerCoins >= item.cost;
                const bgColor = canAfford ? '#27ae60' : '#555555';
                const button = scene.add.text(0, yPos, `[ ${item.name} (${item.cost}) ]`, { fontSize: '32px', backgroundColor: bgColor, padding: {x: 15, y: 8} }).setOrigin(0.5);
                if (canAfford) {
                    button.setInteractive({ cursor: 'pointer' });
                    // Используем ту же функцию, но передаем true (это элемент сетки)
                    button.on('pointerdown', () => scene.enterBuildMode(key, true)); 
                }
                container.add(button);
                yPos += 100;
            }
        };

        createButtons('economy', economyContent);
        createButtons('decor', decorContent);
        createBaseButtons(baseContent); // Вызываем новую функцию
    
        scene.uiContainer.add([economyTab, decorTab, baseTab, economyContent, decorContent, baseContent]);
    
        // --- ОБНОВЛЕННАЯ ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ---
        const setActiveTab = (activeTab) => {
            economyTab.setBackgroundColor(inactiveTabColor);
            decorTab.setBackgroundColor(inactiveTabColor);
            baseTab.setBackgroundColor(inactiveTabColor);
            economyContent.setVisible(false);
            decorContent.setVisible(false);
            baseContent.setVisible(false);

            if (activeTab === 'economy') { economyTab.setBackgroundColor(activeTabColor); economyContent.setVisible(true); }
            else if (activeTab === 'decor') { decorTab.setBackgroundColor(activeTabColor); decorContent.setVisible(true); }
            else if (activeTab === 'base') { baseTab.setBackgroundColor(activeTabColor); baseContent.setVisible(true); }
        };

        economyTab.on('pointerdown', () => setActiveTab('economy'));
        decorTab.on('pointerdown', () => setActiveTab('decor'));
        baseTab.on('pointerdown', () => setActiveTab('base'));

        const closeButton = scene.add.image(500 - 30, -700 + 30, 'close_button').setInteractive({ cursor: 'pointer' });
        closeButton.on('pointerdown', () => scene.hideCurrentUI());
        scene.uiContainer.add(closeButton);
    }

    // --- ПАНЕЛЬ ТЕКУЩЕГО ЗАДАНИЯ (ФИНАЛЬНАЯ ВЕРСИЯ ПАРСЕРА) ---
    else if (type === 'quest') {
        const quest = QUESTS_DATA[scene.currentQuestId];
        if (!quest) { scene.hideCurrentUI(); return; }

        const panel = scene.add.graphics().fillStyle(0x060698, 1).lineStyle(2, 0xBDCEFA, 1).fillRoundedRect(-450, -450, 900, 900, 16).strokeRoundedRect(-450, -450, 900, 900, 16);
        scene.uiContainer.add(panel);

        scene.uiContainer.add(scene.add.text(0, -400, quest.title, { fontSize: '48px', color: '#BDCEFA', align: 'center', wordWrap: { width: 850 } }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -200, quest.text, { fontSize: '36px', color: '#DEE1EE', align: 'center', wordWrap: { width: 850 } }).setOrigin(0.5));

        if (quest.info) {
            let infoTextContent = quest.info;
            let url = null;
        
            // УНИВЕРСАЛЬНЫЙ ПОИСК ССЫЛКИ
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const foundUrls = quest.info.match(urlRegex);
        
            if (foundUrls && foundUrls.length > 0) {
                url = foundUrls[0]; // Берем первую найденную ссылку
                // Убираем URL из текста для чистоты
                infoTextContent = infoTextContent.replace(url, '').replace('Подробнее:', '').trim();
            }

            scene.uiContainer.add(scene.add.text(0, 50, infoTextContent, { fontSize: '32px', color: '#aaccff', align: 'center', wordWrap: { width: 850 } }).setOrigin(0.5));

            if (url) {
                let buttonText = '[ Узнать о реальном продукте ]';
                if (scene.currentQuestId === 13) {
                    buttonText = '[ Почитать ]';
                }
                const infoButton = scene.add.text(0, 250, buttonText, { fontSize: '32px', color: '#77aaff' }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
                infoButton.on('pointerdown', () => { openUrl(url); });
                scene.uiContainer.add(infoButton);
            }
        }

        const okButton = scene.add.text(0, 380, '[ Понятно ]', { fontSize: '32px', backgroundColor: '#3498db', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        okButton.on('pointerdown', () => scene.hideCurrentUI());
        scene.uiContainer.add(okButton);
    }
    // --- ПАНЕЛЬ ЗАВЕРШЕНИЯ ЗАДАНИЯ ---
    else if (type === 'quest_complete') {
        const quest = data; // Данные квеста передаются в data

        const panel = scene.add.graphics().fillStyle(0x060698, 1).lineStyle(4, 0xBDCEFA, 1).fillRoundedRect(-400, -350, 800, 700, 16).strokeRoundedRect(-400, -350, 800, 700, 16);
        scene.uiContainer.add(panel);

        scene.uiContainer.add(scene.add.text(0, -280, 'Задание выполнено!', { fontSize: '54px', color: '#58FFFF' }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -200, `«${quest.title}»`, { fontSize: '40px', color: '#ecf0f1' }).setOrigin(0.5));

        scene.uiContainer.add(scene.add.text(0, -50, 'Награда:', { fontSize: '36px', color: '#cccccc' }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, 50, `+ ${quest.reward.coins} Койнов\n+ ${quest.reward.xp} XP`, { fontSize: '42px', color: '#ddffdd', align: 'center' }).setOrigin(0.5));

        const okButton = scene.add.text(0, 250, '[ Отлично! ]', { fontSize: '32px', backgroundColor: '#3498db', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        okButton.on('pointerdown', () => {
            scene.playConfirmSound();
            scene.hideCurrentUI();
        });
        scene.uiContainer.add(okButton);
    }

    // --- 6. ПАНЕЛЬ ПРЕДУПРЕЖДЕНИЯ ---
    else if (type === 'event_warning') {
        const panel = scene.add.graphics().fillStyle(0x521e26, 1).lineStyle(3, 0xff7777, 1).fillRoundedRect(-450, -300, 900, 600, 16).strokeRoundedRect(-450, -300, 900, 600, 16);
        scene.uiContainer.add(panel);

        scene.uiContainer.add(scene.add.text(0, -220, data.title, { fontSize: '64px', color: '#ffdddd', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -50, data.text, { fontSize: '36px', color: '#cccccc', align: 'center', wordWrap: { width: 800 } }).setOrigin(0.5));

        const okButton = scene.add.text(0, 220, '[ Я понял ]', { fontSize: '32px', backgroundColor: '#c0392b', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        okButton.on('pointerdown', () => scene.hideCurrentUI());
        scene.uiContainer.add(okButton);
    }

    // --- 7. ПАНЕЛЬ ИНФОРМАЦИИ О ДОПОЛНИТЕЛЬНОЙ ПОСТРОЙКЕ ---
    else if (type === 'extra_building_info') {
        const buildingData = EXTRA_BUILDINGS_DATA[data.key];
        const panel = scene.add.graphics().fillStyle(0x060698, 1).lineStyle(2, 0xBDCEFA, 1).fillRoundedRect(-250, -150, 500, 300, 16).strokeRoundedRect(-250, -150, 500, 300, 16);
        scene.uiContainer.add(panel);

        scene.uiContainer.add(scene.add.text(0, -100, buildingData.name, { fontSize: '40px', color: '#BDCEFA' }).setOrigin(0.5));

        let yPos = -20;
        if (buildingData.bonuses) {
            if (buildingData.bonuses.income) {
                scene.uiContainer.add(scene.add.text(0, yPos, `💰 ${buildingData.bonuses.income.text}`, { fontSize: '36px', color: '#DEE1EE' }).setOrigin(0.5));
                yPos += 60;
            }
            if (buildingData.bonuses.happiness) {
                 scene.uiContainer.add(scene.add.text(0, yPos, `😊 ${buildingData.bonuses.happiness.text}`, { fontSize: '36px', color: '#DD41DB' }).setOrigin(0.5));
            }
        }

        const closeButton = scene.add.image(250 - 25, -150 + 25, 'close_button').setScale(0.8).setInteractive({ cursor: 'pointer' });
        closeButton.on('pointerdown', () => scene.hideCurrentUI());
        scene.uiContainer.add(closeButton);
    }

    // --- 8. ПАНЕЛЬ ФИНАНСОВОГО ЖУРНАЛА ---
    else if (type === 'financial_log') {
        const panel = scene.add.graphics().fillStyle(0x060698, 1).lineStyle(2, 0xeeeeee, 1).fillRoundedRect(-450, -600, 900, 1200, 16).strokeRoundedRect(-450, -600, 900, 1200, 16);
        scene.uiContainer.add(panel);

        scene.uiContainer.add(scene.add.text(0, -550, 'Финансовый Журнал', { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5));
    
        // Если лог пуст, показываем сообщение
        if (scene.financialLog.length === 0) {
            scene.uiContainer.add(scene.add.text(0, 0, 'Пока нет финансовых операций.', { fontSize: '32px', color: '#999999' }).setOrigin(0.5));
        } else {
            let yPos = -480;
            // Проходим по логу и создаем текстовые объекты
            for (const entry of scene.financialLog) {
                let entryColor = '#ffffff'; // Нейтральный цвет по умолчанию
                if (entry.type === 'income') {
                    entryColor = '#2ecc71'; // Зеленый для доходов
                } else if (entry.type === 'expense') {
                    entryColor = '#e74c3c'; // Красный для расходов
                }

                const logText = scene.add.text(-420, yPos, entry.message, { fontSize: '32px', color: entryColor, wordWrap: { width: 840 } }).setOrigin(0, 0);
                scene.uiContainer.add(logText);
            
                yPos += logText.height + 15; // Сдвигаемся вниз на высоту текста + отступ
            
                // Прерываем цикл, если вышли за пределы панели
                if (yPos > 550) break;
            }
        }

        const closeButton = scene.add.image(450 - 30, -600 + 30, 'close_button').setInteractive({ cursor: 'pointer' });
        closeButton.on('pointerdown', () => scene.hideCurrentUI());
        scene.uiContainer.add(closeButton);
    }

    // --- 9. ПАНЕЛЬ СПИСКА ДОСТИЖЕНИЙ ---
    else if (type === 'achievements_list') {
        const panel = scene.add.graphics().fillStyle(0x1a2530, 1).lineStyle(2, 0x77aaff, 1).fillRoundedRect(-450, -700, 900, 1400, 16).strokeRoundedRect(-450, -700, 900, 1400, 16);
        scene.uiContainer.add(panel);
        scene.uiContainer.add(scene.add.text(0, -650, 'Достижения', { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5));
    
        let yPos = -550;
        for (const key in ACHIEVEMENTS_DATA) {
            const achievement = ACHIEVEMENTS_DATA[key];
            const isUnlocked = scene.unlockedAchievements.has(key);
        
            const iconKey = isUnlocked ? key : `${key}_disabled`;
            const textColor = isUnlocked ? '#ecf0f1' : '#7f8c8d';

            // Иконка
            scene.uiContainer.add(scene.add.image(-350, yPos, iconKey).setScale(0.8));
            // Название
            scene.uiContainer.add(scene.add.text(-250, yPos - 20, achievement.name, { fontSize: '32px', color: textColor }).setOrigin(0, 0.5));
            // Описание
            scene.uiContainer.add(scene.add.text(-250, yPos + 25, achievement.description, { fontSize: '24px', color: '#95a5a6' }).setOrigin(0, 0.5));
        
            yPos += 150;
            if (yPos > 600) break; // Ограничение, если ачивок будет много
        }

        const closeButton = scene.add.image(450 - 30, -700 + 30, 'close_button').setInteractive({ cursor: 'pointer' });
        closeButton.on('pointerdown', () => scene.hideCurrentUI());
        scene.uiContainer.add(closeButton);
    }

    // --- 10. ПАНЕЛЬ ЕЖЕДНЕВНОГО БОНУСА ---
    else if (type === 'daily_bonus') {
        const panel = scene.add.graphics().fillStyle(0x060698, 1).lineStyle(4, 0xBDCEFA, 1).fillRoundedRect(-400, -350, 800, 700, 16).strokeRoundedRect(-400, -350, 800, 700, 16);
        scene.uiContainer.add(panel);

        scene.uiContainer.add(scene.add.text(0, -250, 'Ежедневный Бонус!', { fontSize: '64px', color: '#58FFFF', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, -150, 'Спасибо, что зашли в Капитал Сити!', { fontSize: '32px', color: '#ecf0f1' }).setOrigin(0.5));
    
        // Здесь data.amount - это сумма бонуса, которую мы передадим
        scene.uiContainer.add(scene.add.text(0, 50, `Ваша награда:\n+ ${data.amount} Койнов`, { fontSize: '48px', color: '#ddffdd', align: 'center' }).setOrigin(0.5));

        const okButton = scene.add.text(0, 250, '[ Забрать ]', { fontSize: '32px', backgroundColor: '#000000', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
    
        okButton.on('pointerdown', () => {
            scene.playConfirmSound();
            // Начисляем бонус
            scene.playerCoins += data.amount;
            scene.coinsText.setText(scene.playerCoins);
            scene.showIncomeAnimation(data.amount, '#f1c40f', 'Бонус +');
            scene.addFinancialLog(`+${data.amount}К (Ежедневный бонус)`, 'income');
        
            scene.hideCurrentUI();
        });
        scene.uiContainer.add(okButton);
    }

    // --- 11. ПАНЕЛЬ КРУПНОГО УВЕДОМЛЕНИЯ (НОВАЯ) ---
    else if (type === 'major_notification') {
        const panel = scene.add.graphics().fillStyle(0x060698, 1).lineStyle(4, 0x2ecc71, 1).fillRoundedRect(-400, -300, 800, 600, 16).strokeRoundedRect(-400, -300, 800, 600, 16);
        scene.uiContainer.add(panel);

        scene.uiContainer.add(scene.add.text(0, -180, data.title, { fontSize: '64px', color: '#ddffdd', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5));
        scene.uiContainer.add(scene.add.text(0, 0, data.text, { fontSize: '48px', color: '#ecf0f1', align: 'center', wordWrap: { width: 700 } }).setOrigin(0.5));

        const okButton = scene.add.text(0, 200, '[ Отлично! ]', { fontSize: '32px', backgroundColor: '#27ae60', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        okButton.on('pointerdown', () => {
            scene.playConfirmSound();
            scene.hideCurrentUI();
        });
        scene.uiContainer.add(okButton);
    }
    // --- 12. ПАНЕЛЬ ПРИВЕТСТВИЯ ---
    else if (type === 'welcome_screen') {
        // ПАТЧ 2: Уменьшаем высоту панели
        const panelHeight = 1300; 
        const yOffset = 60;
        const panelGfx = scene.add.graphics();
        panelGfx.fillGradientStyle(0x1A1A3D, 0x0A0A2A, 0x1A1A3D, 0x0A0A2A, 1);
        panelGfx.fillRoundedRect(-500, -panelHeight/2, 1000, panelHeight, 16);
        panelGfx.lineStyle(3, 0x58FFFF, 0.8);
        panelGfx.strokeRoundedRect(-500, -panelHeight/2, 1000, panelHeight, 16);
        const title = scene.add.text(0, -panelHeight/2 + 80 + yOffset, 'Добро пожаловать!', { fontFamily: '"Halvar Breitschrift"', fontSize: '52px', color: '#ffffff', shadow: { color: '#58FFFF', blur: 15, fill: true } }).setOrigin(0.5);
        scene.uiContainer.add([panelGfx, title]);
    
        let yPos = -450 + yOffset;
        const textStyle = { fontFamily: '"Gazprombank Sans"', fontSize: '32px', color: '#cccccc', wordWrap: { width: 650 } }; // <-- Уменьшили ширину блока текста
        const rowSpacing = 120;
        const textX = -420; // <-- ПАТЧ 1: Сдвинули весь текст правее

        const text1 = scene.add.text(textX, yPos, 'Чтобы получить максимум от демоверсии, последовательно выполняйте квесты.', textStyle).setOrigin(0, 0.5);
        const icon1 = scene.add.image(380, yPos, 'quest_icon'); // <-- Сдвинули иконку левее
        scene.uiContainer.add([text1, icon1]);
        yPos += rowSpacing;

        const text2 = scene.add.text(textX, yPos, 'Стройте основные здания, кликая на пустые слоты на карте.', textStyle).setOrigin(0, 0.5);
        const icon2 = scene.add.image(380, yPos, 'slot').setScale(0.45); // <-- ПАТЧ 1: Добавили недостающую иконку
        scene.uiContainer.add([text2, icon2]);
        yPos += rowSpacing;

        const text3 = scene.add.text(textX, yPos, 'Для покупки других сооружений и декора нажмите на иконку строительства.', textStyle).setOrigin(0, 0.5);
        const icon3 = scene.add.image(380, yPos, 'build_icon');
        scene.uiContainer.add([text3, icon3]);
        yPos += rowSpacing;

        const text4 = scene.add.text(textX, yPos, 'Для получения очков опыта вы также можете проходить квизы, отвечая на вопросы.', textStyle).setOrigin(0, 0.5);
        const icon4 = scene.add.image(380, yPos, 'quiz_icon');
        scene.uiContainer.add([text4, icon4]);
        yPos += 150;

        const finalText = scene.add.text(0, yPos + 20, 'Развивайте город, следите за финансами в журнале, украшайте его и делайте жителей счастливее!', { fontFamily: '"Gazprombank Sans"', fontSize: '34px', color: '#ecf0f1', align: 'center', wordWrap: { width: 900 } }).setOrigin(0.5);
        scene.uiContainer.add(finalText);

        const startButtonGfx = scene.add.graphics();
        startButtonGfx.fillStyle(0x000000, 1);
        startButtonGfx.fillRoundedRect(-275, -45, 550, 90, 45);
        const startButtonText = scene.add.text(0, 0, 'Начать игру', { fontFamily: '"Gazprombank Sans"', fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);
        const startButton = scene.add.container(0, yPos + 180 + yOffset, [startButtonGfx, startButtonText])
            .setSize(550, 90)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                scene.startGameFirstTime();
                scene.playConfirmSound();
            });
        
        scene.uiContainer.add(startButton);
    }

}

/**
 * Уничтожает текущий контейнер UI и скрывает все связанные HTML элементы.
 * @param {Phaser.Scene} scene - Текущая игровая сцена.
 */
function hideCurrentUI(scene) {
    if (scene.uiContainer) {
        scene.uiContainer.destroy();
        scene.uiContainer = null;
    }
    document.getElementById('deposit-input').style.display = 'none';

    // ДОБАВЛЕНО: Проверяем очередь после закрытия окна
    // Небольшая задержка, чтобы окна не "слиплись"
    scene.time.delayedCall(100, () => {
        scene.processUIQueue();
    });
}

function openUrl(url) {
    window.open(url, '_blank');
}