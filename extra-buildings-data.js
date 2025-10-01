// extra-buildings-data.js - НОВАЯ, ПРАВИЛЬНАЯ СТРУКТУРА

const EXTRA_BUILDINGS_DATA = {
    // Категория: Экономика
    'factory': {
        name: 'Завод', cost: 20000, category: 'economy',
        bonuses: { income: { value: 100, text: '+100 койнов/день' } }, // Прямой доход в день
        sprite: 'factory_tile', // Имя ассета
        requiredLevel: 3
    },
    'mine': {
        name: 'Рудник', cost: 22000, category: 'economy',
        bonuses: { income: { value: 120, text: '+120 койнов/день' } },
        sprite: 'mine_tile',
        requiredLevel: 5
    },
    'service': {
        name: 'Автосервис', cost: 18000, category: 'economy',
        bonuses: { income: { value: 90, text: '+90 койнов/день' } },
        sprite: 'service_tile',
        requiredLevel: 1
    },

    // Категория: Декор
    'cinema': {
        name: 'Кинотеатр', cost: 15000, category: 'decor',
        bonuses: { happiness: { value: 10, text: '+10 счастья' } }, // Бонус к счастью
        sprite: 'cinema_tile',
        requiredLevel: 2
    },
    'park': {
        name: 'Парк', cost: 8000, category: 'decor',
        bonuses: { happiness: { value: 5, text: '+5 счастья' } },
        sprite: 'park_tile',
        requiredLevel: 4
    },
    'stadium': {
        name: 'Стадион', cost: 25000, category: 'decor',
        bonuses: { happiness: { value: 15, text: '+15 счастья' } },
        sprite: 'stadium_tile',
        requiredLevel: 5
    },
    'cafe': {
        name: 'Кофейня', cost: 12000, category: 'decor',
        bonuses: { happiness: { value: 8, text: '+8 счастья' } },
        sprite: 'cafe_tile',
        requiredLevel: 2
    },
    'museum': {
        name: 'Музей', cost: 17000, category: 'decor',
        bonuses: { happiness: { value: 12, text: '+12 счастья' } },
        sprite: 'museum_tile',
        requiredLevel: 3
    },
    'tree': {
        name: 'Дерево',
        cost: 150,
        sprite: 'tree',
        category: 'decor',
        bonuses: { happiness: { value: 2, text: '+2 счастья' } },
        requiredLevel: 1
    },
    'fir_tree': {
        name: 'Ель',
        cost: 150,
        sprite: 'fir_tree',
        category: 'decor',
        bonuses: { happiness: { value: 2, text: '+2 счастья' } },
        requiredLevel: 1
    },
    'bush': {
        name: 'Куст',
        cost: 75,
        sprite: 'bush',
        category: 'decor',
        bonuses: { happiness: { value: 1, text: '+1 счастья' } },
        requiredLevel: 1
    },
    'flowers': {
        name: 'Клумба',
        cost: 100,
        sprite: 'flowers',
        category: 'decor',
        bonuses: { happiness: { value: 1, text: '+1 счастья' } },
        requiredLevel: 1
    },
    'bench': {
        name: 'Скамейка',
        cost: 200,
        sprite: 'bench',
        category: 'decor',
        bonuses: { happiness: { value: 2, text: '+2 счастья' } },
        requiredLevel: 1
    },
    'lamppost': {
        name: 'Фонарный столб',
        cost: 250,
        sprite: 'lamppost',
        category: 'decor',
        bonuses: { happiness: { value: 1, text: '+1 счастья' } },
        requiredLevel: 1
    },
    'pond': {
        name: 'Пруд',
        cost: 1200,
        sprite: 'pond',
        category: 'decor',
        bonuses: { happiness: { value: 10, text: '+10 счастья' } },
        requiredLevel: 1
    },
    'playground': {
        name: 'Детская площадка',
        cost: 2500,
        sprite: 'playground',
        category: 'decor',
        bonuses: { happiness: { value: 15, text: '+15 счастья' } },
        requiredLevel: 1
    }
};