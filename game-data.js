const BUILDINGS_DATA = {
    'bank': {
        name: 'Центральный Банк', cost: 10000, requiredLevel: 1,
        upgrade: { cost: 25000, sprite: 'bank_lvl2', requiredLevel: 2 },
        description: 'Откройте доступ к финансовым\nпродуктам и услугам.',
        products: [
            { id: 'product_deposit', name: 'Накопительный счет', requiredLevel: 1 },
            { id: 'product_credit', name: 'Кредитная карта', requiredLevel: 1 },
            { id: 'product_mortgage', name: 'Оформить ипотеку', requiredLevel: 1 }
        ]
    },
    'residence': {
        name: 'Жилой Квартал', cost: 80000, requiredLevel: 2, requiredQuestId: 4,
        upgrade: { cost: 40000, sprite: 'residence_lvl2', requiredLevel: 3 },
        bonuses: {
            population: { value: 10, text: '+500 жителей' },
            income:     { value: 50, text: '+50 койнов/день' }
        },
        description: 'Увеличивает население и приносит\nдополнительный доход (налоги)\nкаждый игровой день.',
        products: [
            { id: 'product_resident_card', name: 'Выпустить Карту жителя', requiredLevel: 2 }
        ]
    },
    'investment': {
        name: 'Инвест. Центр', cost: 50000, requiredLevel: 2, requiredQuestId: 5,
        upgrade: { cost: 30000, sprite: 'investment_lvl2', requiredLevel: 4 },
        description: 'Инвестируйте в Программу долгосрочных\nсбережений (ПДС).',
        products: [ 
            { id: 'product_pds', name: 'Программа долгосрочных сбережений', requiredLevel: 1 }, 
            { id: 'product_broker', name: 'Открыть Брокерский счет', requiredLevel: 2 }

        ]
    },
    'mall': {
        name: 'Торговый Центр', cost: 30000, requiredLevel: 2, requiredQuestId: 7,
        upgrade: { cost: 15000, sprite: 'mall_lvl2', requiredLevel: 4 },
        description: 'Активируйте Умную карту, чтобы получать\nкэшбэк 5% со всех трат на строительство.',
        products: [ 
            { id: 'product_cashback', name: 'Умная карта', requiredLevel: 1 }, 
            { id: 'product_bonus_plus', name: 'Подписка Бонус Плюс', requiredLevel: 2 }
        ]
    },
    'insurance': {
        name: 'Страховая Компания', cost: 40000, requiredLevel: 3, requiredQuestId: 9,
        upgrade: { cost: 20000, sprite: 'insurance_lvl2', requiredLevel: 5 },
        description: 'Защитите свои активы от непредвиденных\nфинансовых потерь.',
        products: [ { id: 'product_insurance', name: 'Оформить страховку', requiredLevel: 1 } ]
    },
    'cyber': {
        name: 'Центр Киберзащиты', cost: 35000, requiredLevel: 3, requiredQuestId: 11,
        upgrade: { cost: 18000, sprite: 'cyber_lvl2', requiredLevel: 5 },
        description: 'Защитите финансы города от цифровых\nугроз и мошенников.',
        products: [ { id: 'product_cyber', name: 'Активировать защиту', requiredLevel: 1 } ]
    }
};

const TALL_OBJECTS = [
    // Старый декор
    'tree', 'fir_tree', 'bush', 'bench', 'lamppost', 'pond', 'playground',
    // Основные здания
    'bank', 'residence', 'investment', 'mall', 'insurance', 'cyber',
    // Дополнительные здания
    'factory_tile', 'mine_tile', 'service_tile', 'cinema_tile', 'park_tile', 'stadium_tile', 'cafe_tile', 'museum_tile'
];