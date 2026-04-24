
const resultPanel = document.querySelector("#resultPanel");
const historyList = document.querySelector("#historyList");
const favoritesList = document.querySelector("#favoritesList");
const suggestionsList = document.querySelector("#suggestionsList");
const votesList = document.querySelector("#votesList");

const state = {
  history: JSON.parse(localStorage.getItem("zeekr_history") || "[]"),
  favorites: JSON.parse(localStorage.getItem("zeekr_favorites") || "[]"),
  productCache: JSON.parse(localStorage.getItem("zeekr_product_cache") || "[]"),
  reports: JSON.parse(localStorage.getItem("zeekr_reports") || "[]"),
  suggestions: JSON.parse(localStorage.getItem("zeekr_suggestions") || "[]"),
  votes: JSON.parse(localStorage.getItem("zeekr_votes") || "[]"),
  customProducts: JSON.parse(localStorage.getItem("zeekr_custom_products") || "[]"),
  customBrands: JSON.parse(localStorage.getItem("zeekr_custom_brands") || "[]"),
  customIngredients: JSON.parse(localStorage.getItem("zeekr_custom_ingredients") || "[]"),
  currentUser: JSON.parse(localStorage.getItem("zeekr_current_user") || "null"),
  registeredUsers: JSON.parse(localStorage.getItem("zeekr_users") || "[]"),
  photoChecked: false,
  selectedPhotoFile: null,
  activeFilter: "all"
};

if (!state.registeredUsers.some(user => user.email === "admin@zeekr.app")) {
  state.registeredUsers.push({
    name: "Dias",
    email: "admin@zeekr.app",
    password: "admin123",
    role: "Администратор",
    country: "Кыргызстан",
    language: "Русский",
    status: "Активен"
  });
}

function saveState() {
  localStorage.setItem("zeekr_history", JSON.stringify(state.history));
  localStorage.setItem("zeekr_favorites", JSON.stringify(state.favorites));
  localStorage.setItem("zeekr_product_cache", JSON.stringify(state.productCache));
  localStorage.setItem("zeekr_reports", JSON.stringify(state.reports));
  localStorage.setItem("zeekr_suggestions", JSON.stringify(state.suggestions));
  localStorage.setItem("zeekr_votes", JSON.stringify(state.votes));
  localStorage.setItem("zeekr_custom_products", JSON.stringify(state.customProducts));
  localStorage.setItem("zeekr_custom_brands", JSON.stringify(state.customBrands));
  localStorage.setItem("zeekr_custom_ingredients", JSON.stringify(state.customIngredients));
  localStorage.setItem("zeekr_current_user", JSON.stringify(state.currentUser));
  localStorage.setItem("zeekr_users", JSON.stringify(state.registeredUsers));
}

function isAuthenticated() {
  return Boolean(state.currentUser);
}

function requireAuth(action) {
  if (isAuthenticated()) return true;
  alert(`${action} доступно после регистрации или входа.`);
  showSection("auth");
  return false;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function findByQuery(list, query) {
  const q = normalize(query);
  return list.find(item => normalize(item.name).includes(q) || q.includes(normalize(item.name)));
}

function allProducts() {
  return [...state.customProducts, ...products];
}

function allBrands() {
  return [...state.customBrands, ...brands];
}

function allIngredients() {
  return [...state.customIngredients, ...ingredients];
}

function brandInfo(name) {
  return findByQuery(allBrands(), name);
}

function badge(status) {
  const cls = status === "halal" ? "badge--halal" : status === "haram" ? "badge--haram" : "badge--doubtful";
  return `<span class="badge ${cls}">${statusLabel[status]}</span>`;
}

function displayStatus(status) {
  return statusLabel[status] || (status === "boycott" ? "Бойкот" : status === "not_found" ? "Нет данных" : status || "Без статуса");
}

function itemTypeLabel(type) {
  const labels = {
    product: "Товар",
    ingredient: "Ингредиент",
    brand: "Бренд"
  };
  return labels[type] || type || "Объект";
}

function verdictText(status) {
  if (status === "halal") return "В демо-базе не найдено запрещенных компонентов. Все равно сверяйте состав с упаковкой.";
  if (status === "haram") return "Есть компонент, который лучше не пропускать. Откройте подробности и проверьте причину.";
  return "Нужен источник происхождения или уточнение состава. Это не запрет, а сигнал проверить внимательнее.";
}

function ingredientStatus(name) {
  const item = findByQuery(allIngredients(), name);
  return item || { name, status: "doubtful", reason: "Недостаточно данных по ингредиенту." };
}

function deriveProductStatus(items) {
  return items.reduce((max, item) => statusRank[item.status] > statusRank[max] ? item.status : max, "halal");
}

function calculateConfidence(items, source) {
  const base = source === "Проверенная база Zeekr" ? 92 : source === "Распознавание состава" ? 78 : 84;
  const penalty = items.filter(item => item.status === "doubtful").length * 5;
  const boost = items.some(item => item.status === "haram") ? 16 : 0;
  return Math.max(55, Math.min(99, base - penalty + boost));
}

function analyzeProduct(product) {
  const checked = product.composition.map(ingredientStatus);
  const status = deriveProductStatus(checked);
  const haramItems = checked.filter(item => item.status === "haram").map(item => item.name);
  const doubtfulItems = checked.filter(item => item.status === "doubtful").map(item => item.name);
  const reason = haramItems.length
    ? `Найдены запрещённые или haram-компоненты: ${haramItems.join(", ")}.`
    : doubtfulItems.length
      ? `Есть сомнительные компоненты или недостаточно данных: ${doubtfulItems.join(", ")}.`
      : "В составе не найдено запрещённых или сомнительных ингредиентов.";

  return {
    ...product,
    status,
    confidence: calculateConfidence(checked, product.source),
    reason,
    checkedIngredients: checked
  };
}

function cacheProduct(product) {
  const cached = { ...product, updatedAt: new Date().toLocaleString("ru-RU"), source: product.source || "Внешний источник" };
  state.productCache = [cached, ...state.productCache.filter(item => normalize(item.name) !== normalize(product.name))].slice(0, 20);
  saveState();
  return cached;
}

function findProduct(query) {
  return findByQuery(state.productCache, query) || findByQuery(allProducts(), query);
}

function addHistory(label, status) {
  if (!isAuthenticated()) return;
  state.history.unshift({ label, status, date: new Date().toLocaleString("ru-RU") });
  state.history = state.history.slice(0, 8);
  saveState();
  renderLists();
}

function toggleFavorite(item) {
  if (!requireAuth("Избранное")) return;
  const key = `${item.type}:${item.name}`;
  const exists = state.favorites.some(fav => fav.key === key);
  state.favorites = exists ? state.favorites.filter(fav => fav.key !== key) : [{ key, name: item.name, type: item.type, status: item.status || (item.boycott ? "boycott" : "brand") }, ...state.favorites];
  saveState();
  renderLists();
}
