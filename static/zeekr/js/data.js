const products = [
  {
    type: "product",
    name: "Coca Cola Vanilla",
    brand: "Coca Cola",
    category: "Напитки",
    country: "USA",
    status: "doubtful",
    confidence: 80,
    barcode: "5449000131836",
    source: "Открытый каталог",
    reason: "Natural flavors требуют уточнения источника ароматизаторов.",
    composition: ["Carbonated water", "Sugar", "Color E150d", "Natural Flavors", "Caffeine"],
    alternatives: ["Zamzam Cola", "Qibla Cola", "Локальные halal напитки"]
  },
  {
    type: "product",
    name: "Doritos Hot Chili",
    brand: "Doritos",
    category: "Снэки",
    country: "USA",
    status: "doubtful",
    confidence: 74,
    barcode: "5000328371231",
    source: "Партнерский каталог",
    reason: "Есть ароматизаторы и сырные ферменты неизвестного происхождения.",
    composition: ["Corn", "Vegetable oil", "Cheese powder", "Natural flavors", "E471"],
    alternatives: ["Halal Chips Chili", "Takis Halal certified"]
  },
  {
    type: "product",
    name: "KitKat",
    brand: "Nestle",
    category: "Сладости",
    country: "Switzerland",
    status: "doubtful",
    confidence: 82,
    barcode: "7613035371201",
    source: "Внешний каталог товаров",
    reason: "Lecithin обычно допустим, но ароматизаторы и цепочка производства требуют проверки.",
    composition: ["Sugar", "Wheat flour", "Cocoa butter", "Lecithin", "Natural flavors"],
    alternatives: ["Halal certified wafer", "Alpen Gold halal line"]
  },
  {
    type: "product",
    name: "Kinder Bueno",
    brand: "Ferrero",
    category: "Сладости",
    country: "Germany",
    status: "halal",
    confidence: 91,
    barcode: "8000500037560",
    source: "Проверенная база Zeekr",
    reason: "В демо-составе не найдено запрещённых ингредиентов.",
    composition: ["Milk chocolate", "Hazelnuts", "Sugar", "Lecithin", "Whey powder"],
    alternatives: ["Kinder Bueno White", "Halal hazelnut bar"]
  }
];

const ingredients = [
  { name: "Gelatin", aliases: "Желатин", category: "Stabilizer", status: "doubtful", origin: "Животное происхождение", reason: "Halal только при подтверждённом halal-источнике.", used: "Сладости, йогурты, капсулы" },
  { name: "E120", aliases: "Carmine, Cochineal", category: "Color", status: "haram", origin: "Насекомые", reason: "Краситель животного происхождения, часто считается недопустимым.", used: "Напитки, конфеты, косметика" },
  { name: "Carmine", aliases: "E120", category: "Color", status: "haram", origin: "Насекомые", reason: "То же, что E120.", used: "Красные продукты и косметика" },
  { name: "Lecithin", aliases: "E322", category: "Emulsifier", status: "halal", origin: "Соя или яйца", reason: "Обычно допустим, если не из запрещённых источников.", used: "Шоколад, выпечка" },
  { name: "E471", aliases: "Mono- and diglycerides", category: "Emulsifier", status: "doubtful", origin: "Растительное или животное", reason: "Нужен источник жирных кислот.", used: "Выпечка, снеки, мороженое" },
  { name: "Natural Flavors", aliases: "Ароматизаторы", category: "Flavor", status: "doubtful", origin: "Разный источник", reason: "Может содержать спиртовые носители или животные компоненты.", used: "Напитки, сладости, соусы" }
];

const brands = [
  { name: "Nestle", country: "Switzerland", categories: "Сладости, напитки, детское питание", boycott: true, reason: "Есть запросы пользователей на дополнительную проверку источников.", halal: ["KitKat selected markets", "Nido certified lines"] },
  { name: "Coca Cola", country: "USA", categories: "Напитки", boycott: true, reason: "Отмечен в демо-мониторинге бойкота.", halal: ["Classic Cola", "Zero Sugar"] },
  { name: "Pepsi", country: "USA", categories: "Напитки", boycott: false, reason: "Нет активной отметки в демо-списке.", halal: ["Pepsi", "7UP"] },
  { name: "McDonald's", country: "USA", categories: "Фастфуд", boycott: true, reason: "Требуется региональная проверка и источник.", halal: ["Только отдельные сертифицированные рестораны"] },
  { name: "Ferrero", country: "Germany", categories: "Сладости", boycott: false, reason: "Нет активной отметки.", halal: ["Kinder Bueno", "Nutella selected markets"] }
];

const moderation = [
  ["Новый товар", "Haribo Goldbears", "Нужен источник желатина", "Ожидает"],
  ["Жалоба", "KitKat", "Пользователь указал другой состав", "В работе"],
  ["Ингредиент", "E441", "Синоним Gelatin", "Ожидает"]
];

const users = [
  ["Amina", "amina@zeekr.app", "Авторизованный", "Кыргызстан", "Активен", "История, избранное, жалобы"],
  ["Dias", "admin@zeekr.app", "Администратор", "Кыргызстан", "Активен", "Полный доступ"],
  ["Moderator KG", "mod@zeekr.app", "Модератор", "Кыргызстан", "Активен", "Жалобы, справочники"]
];

const roles = [
  ["Гость", "Чтение", "Поиск товаров, ингредиентов, брендов", "Без входа"],
  ["Авторизованный", "Пользователь", "История, избранное, жалобы, предложения, голосование", "После регистрации"],
  ["Модератор", "Операционный доступ", "Жалобы, справочники, очередь проверки", "Назначает админ"],
  ["Администратор", "Полный доступ", "Пользователи, роли, модераторы, логика, аналитика, настройки", "Защищённая роль"]
];

const moderators = [
  ["Moderator KG", "mod@zeekr.app", "Ингредиенты, жалобы", "18 задач", "Активен"],
  ["Aisha Review", "review@zeekr.app", "Товары, OCR", "7 задач", "Активен"],
  ["Brand Check", "brand@zeekr.app", "Бренды, бойкот", "5 задач", "Пауза"]
];

const rules = [
  ["Pork / Lard", "Haram", "Любое точное совпадение", "99%"],
  ["Alcohol", "Haram", "Если указан как ингредиент или носитель", "95%"],
  ["E120 / Carmine", "Haram", "Краситель животного происхождения", "99%"],
  ["Gelatin", "Нужно уточнить", "Нельзя только при свином источнике, иначе нужен источник", "80%"],
  ["E471", "Нужно уточнить", "Требуется источник жирных кислот", "78%"],
  ["Natural Flavors", "Нужно уточнить", "Нужна детализация состава ароматизатора", "72%"]
];

const externalSources = [
  ["Открытые каталоги", "Товары, штрихкоды, состав", "Активен", "Приоритет 1"],
  ["Партнерские каталоги", "Сертифицированные halal-линейки", "Активен", "Приоритет 2"],
  ["Публичные данные брендов", "Сайты брендов и описания", "Активен", "Приоритет 3"],
  ["Внутренняя база Zeekr", "Нормализация и история проверок", "Активен", "Всегда"]
];

const statusLabel = {
  halal: "Можно",
  haram: "Нельзя",
  doubtful: "Нужно уточнить"
};

const statusRank = { haram: 3, doubtful: 2, halal: 1 };
