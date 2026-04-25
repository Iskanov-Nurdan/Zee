
function renderProduct(product) {
  const analyzed = analyzeProduct(product);
  const brand = brandInfo(analyzed.brand);
  const boycottText = brand?.boycott ? ` · Бойкот: ${brand.reason}` : "";

  resultPanel.innerHTML = `
    <article class="result-card result-card--brief">
      <div class="result-top">
        <div class="product-thumb">${analyzed.name.slice(0, 1)}</div>
        <div>
          <h2>${analyzed.name}</h2>
          <p>${analyzed.brand} · ${analyzed.category} · ${analyzed.country}${boycottText}</p>
        </div>
        ${badge(analyzed.status)}
      </div>
      <div class="analysis-grid">
        <div class="analysis-item"><span>Статус</span><strong>${statusLabel[analyzed.status]}</strong></div>
        <div class="analysis-item"><span>Уверенность</span><strong>${analyzed.confidence}%</strong></div>
        <div class="analysis-item"><span>Что делать</span><strong>${analyzed.status === "halal" ? "Можно брать" : analyzed.status === "haram" ? "Лучше избегать" : "Уточнить"}</strong></div>
      </div>
      <p class="verdict-note verdict-note--${analyzed.status}">${verdictText(analyzed.status)}</p>
      <p>${analyzed.reason}</p>
      <div class="result-actions">
        <button class="btn btn--primary" type="button" data-product-detail="${analyzed.name}">Подробнее</button>
        <button class="btn btn--secondary" type="button" data-favorite="${analyzed.name}">В избранное</button>
      </div>
    </article>
  `;

  resultPanel.querySelector("[data-product-detail]").addEventListener("click", () => renderProductDetails(analyzed));
  resultPanel.querySelector("[data-favorite]").addEventListener("click", () => toggleFavorite(analyzed));
  cacheProduct(analyzed);
  addHistory(analyzed.name, analyzed.status);
}

function renderProductDetails(product) {
  const analyzed = analyzeProduct(product);
  const brand = brandInfo(analyzed.brand);
  const boycottBlock = brand?.boycott
    ? `<div class="boycott-warning"><strong>Есть отметка о бойкоте</strong><br>${brand.name}: ${brand.reason}</div>`
    : "";
  const ingredientRows = analyzed.composition.map(name => {
    const ing = ingredientStatus(name);
    return `<div class="ingredient-row"><div><strong>${name}</strong><span>${ing.reason}</span></div>${badge(ing.status)}</div>`;
  }).join("");

  document.querySelector("#productDetailPanel").innerHTML = `
    <article class="result-card">
      <div class="result-top">
        <div class="product-thumb">${analyzed.name.slice(0, 1)}</div>
        <div>
          <h2>${analyzed.name}</h2>
          <p>${analyzed.brand} · ${analyzed.category} · ${analyzed.country}</p>
        </div>
        ${badge(analyzed.status)}
      </div>
      <div class="analysis-grid">
        <div class="analysis-item"><span>Уверенность</span><strong>${analyzed.confidence}%</strong></div>
        <div class="analysis-item"><span>Штрихкод</span><strong>${analyzed.barcode}</strong></div>
        <div class="analysis-item"><span>Источник</span><strong>${analyzed.source}</strong></div>
      </div>
      <div>
        <h2>Коротко</h2>
        <p class="verdict-note verdict-note--${analyzed.status}">${verdictText(analyzed.status)}</p>
        <p>${analyzed.reason}</p>
      </div>
      ${boycottBlock}
      <div class="source-note">Источник: ${analyzed.source}. Обновлено: ${analyzed.updatedAt || new Date().toLocaleDateString("ru-RU")}. Если точных данных нет, Zeekr честно снижает уверенность.</div>
      <div class="ingredient-list">${ingredientRows}</div>
      <div>
        <h2>Что можно посмотреть вместо этого</h2>
        <p>${analyzed.alternatives.join(", ")}</p>
      </div>
      <div class="result-actions">
        <button class="btn btn--secondary" type="button" data-favorite="${analyzed.name}">Добавить в избранное</button>
        <button class="btn btn--ghost" type="button" data-vote="correct" data-vote-target="${analyzed.name}">Все верно</button>
        <button class="btn btn--ghost" type="button" data-vote="wrong" data-vote-target="${analyzed.name}">Есть ошибка</button>
        <button class="btn btn--ghost" type="button" data-open-report>Сообщить об ошибке</button>
      </div>
    </article>
  `;

  document.querySelector("#productDetailPanel [data-favorite]").addEventListener("click", () => toggleFavorite(analyzed));
  showSection("productDetail");
  bindResultActions();
}

function renderIngredient(item) {
  resultPanel.innerHTML = `
    <article class="result-card">
      <div class="result-top">
        <div class="product-thumb">E</div>
        <div>
          <h2>${item.name}</h2>
          <p>${item.aliases} · ${item.category}</p>
        </div>
        ${badge(item.status)}
      </div>
      <div class="analysis-grid">
        <div class="analysis-item"><span>Происхождение</span><strong>${item.origin}</strong></div>
        <div class="analysis-item"><span>Где используется</span><strong>${item.used}</strong></div>
        <div class="analysis-item"><span>Статус</span><strong>${statusLabel[item.status]}</strong></div>
      </div>
      <div><h2>Почему такой статус</h2><p>${item.reason}</p></div>
      <div class="result-actions">
        <button class="btn btn--secondary" type="button" data-favorite="${item.name}">Добавить в избранное</button>
        <button class="btn btn--ghost" type="button" data-vote="correct" data-vote-target="${item.name}">Все верно</button>
        <button class="btn btn--ghost" type="button" data-vote="wrong" data-vote-target="${item.name}">Есть ошибка</button>
      </div>
    </article>
  `;

  resultPanel.querySelector("[data-favorite]").addEventListener("click", () => toggleFavorite({ ...item, type: "ingredient" }));
  bindResultActions();
  addHistory(item.name, item.status);
}

function renderBrand(item) {
  resultPanel.innerHTML = `
    <article class="result-card">
      <div class="result-top">
        <div class="product-thumb">B</div>
        <div>
          <h2>${item.name}</h2>
          <p>${item.country} · ${item.categories}</p>
        </div>
        <span class="badge ${item.boycott ? "badge--boycott" : "badge--halal"}">${item.boycott ? "Бойкот" : "Без отметок"}</span>
      </div>
      <div><h2>Почему есть отметка</h2><p>${item.reason}</p></div>
      <div><h2>Товары, которые стоит проверить отдельно</h2><p>${item.halal.join(", ")}</p></div>
      <div class="result-actions">
        <button class="btn btn--secondary" type="button" data-favorite="${item.name}">Добавить в избранное</button>
        <button class="btn btn--ghost" type="button" data-vote="correct" data-vote-target="${item.name}">Все верно</button>
        <button class="btn btn--ghost" type="button" data-vote="wrong" data-vote-target="${item.name}">Есть ошибка</button>
      </div>
    </article>
  `;

  resultPanel.querySelector("[data-favorite]").addEventListener("click", () => toggleFavorite({ ...item, type: "brand" }));
  bindResultActions();
  addHistory(item.name, item.boycott ? "boycott" : "brand");
}

function renderNotFound(query) {
  resultPanel.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__visual">?</div>
      <h2>Недостаточно данных</h2>
      <p>По запросу "${query}" пока нет точной карточки. Отправьте товар на проверку, и он попадет в очередь модерации.</p>
      <button class="btn btn--primary" type="button" data-open-report>Предложить товар</button>
    </div>
  `;
  resultPanel.querySelector("[data-open-report]").addEventListener("click", openReport);
  addHistory(query, "not_found");
}

function runSearch(type, query) {
  if (!query.trim()) return;
  if (type === "product") {
    const item = findProduct(query);
    item ? renderProduct(item) : renderNotFound(query);
  }
  if (type === "ingredient") {
    const item = findByQuery(allIngredients(), query);
    item ? renderIngredient({ ...item, type: "ingredient" }) : renderNotFound(query);
    showSection("home");
  }
  if (type === "brand") {
    const item = findByQuery(allBrands(), query);
    item ? renderBrand(item) : renderNotFound(query);
    showSection("home");
  }
}

function renderIngredientsAccess() {
  document.querySelectorAll('.nav__link[data-section="ingredients"]').forEach(link => {
    link.classList.toggle("is-hidden", !state.photoChecked);
  });

  const ingredientsPageActive = document.querySelector("#ingredients")?.classList.contains("active");
  if (!state.photoChecked && ingredientsPageActive) showSection("home");
}

function runOcrDemo() {
  const manualText = document.querySelector("#ocrText").value.trim();
  const photoFile = state.selectedPhotoFile || document.querySelector("#photoInput")?.files?.[0];
  const pipeline = document.querySelector("#ocrPipeline");

  if (!manualText && !photoFile) {
    state.photoChecked = false;
    renderIngredientsAccess();
    if (pipeline) {
      pipeline.classList.remove("ocr-pipeline--done");
      pipeline.innerHTML = "";
    }
    return;
  }

  const extracted = manualText ? splitCsv(manualText) : ["Gelatin", "E120", "Natural Flavors", "E471"];
  const checked = extracted.map(ingredientStatus);
  const status = deriveProductStatus(checked);
  const haramItems = checked.filter(item => item.status === "haram").map(item => item.name);
  const doubtfulItems = checked.filter(item => item.status === "doubtful").map(item => item.name);
  const confidence = calculateConfidence(checked, "Распознавание состава");
  const product = {
    type: "product",
    name: "Товар по фото состава",
    brand: "Неизвестный бренд",
    category: "Фото состава",
    country: "Страна не указана",
    status,
    confidence,
    barcode: "Нет данных",
    source: "Распознавание состава",
    reason: haramItems.length
      ? `Найдены ингредиенты со статусом «Нельзя»: ${haramItems.join(", ")}.`
      : doubtfulItems.length
        ? `Есть ингредиенты, которые нужно уточнить: ${doubtfulItems.join(", ")}.`
        : "Запрещённых и сомнительных ингредиентов не найдено.",
    composition: extracted,
    alternatives: ["Товар с halal-сертификатом", "Продукт без E120", "Продукт без желатина"]
  };

  state.photoChecked = true;
  renderIngredientsAccess();

  if (pipeline) {
    pipeline.classList.add("ocr-pipeline--done");
    pipeline.innerHTML = `
      <div class="ocr-step ocr-step--done">
        <span>1</span>
        <strong>Фото принято</strong>
        <p>${photoFile?.name || "Использован ручной OCR-текст"}</p>
      </div>
      <div class="ocr-step ocr-step--done">
        <span>2</span>
        <strong>Состав извлечён</strong>
        <p>${extracted.join(", ")}</p>
      </div>
      <div class="ocr-step ocr-step--done">
        <span>3</span>
        <strong>Итог: ${statusLabel[status]}</strong>
        <p>Уверенность ${confidence}%. Нажмите «Подробнее», чтобы увидеть причины по каждому ингредиенту.</p>
      </div>
      <div class="ocr-ingredients">
        ${checked.map(item => `
          <div class="ingredient-row">
            <div><strong>${item.name}</strong><span>${item.reason}</span></div>${badge(item.status)}
          </div>
        `).join("")}
      </div>
    `;
  }

  renderProduct(product);
}

function renderTable(selector, headers, rows) {
  const table = document.querySelector(selector);
  table.innerHTML = `
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(row => `<tr>${row.map((cell, index) => `<td data-label="${headers[index] || ""}">${cell}</td>`).join("")}</tr>`).join("")}</tbody>
  `;
}

function renderIngredientsTable() {
  renderTable("#ingredientsTable", ["Название", "Синонимы", "Категория", "Статус", "Причина"], allIngredients().map(item => [
    item.name,
    item.aliases,
    item.category,
    badge(item.status),
    item.reason
  ]));
}

function renderBrandCards() {
  const selected = document.querySelector("#brandCountry").value;
  const byCountry = selected === "all" ? allBrands() : allBrands().filter(brand => brand.country === selected);
  const list = state.activeFilter === "boycott" ? byCountry.filter(brand => brand.boycott) : byCountry;
  document.querySelector("#brandCards").innerHTML = list.map(brand => `
    <article class="brand-card">
      <div class="brand-card__top">
        <h3>${brand.name}</h3>
        <span class="badge ${brand.boycott ? "badge--boycott" : "badge--halal"}">${brand.boycott ? "Бойкот" : "Без отметок"}</span>
      </div>
      <p>${brand.country}</p>
      <p>${brand.categories}</p>
      <button class="btn btn--secondary btn--sm" type="button" data-brand="${brand.name}">Открыть</button>
    </article>
  `).join("");

  document.querySelectorAll("[data-brand]").forEach(button => {
    button.addEventListener("click", () => {
      showSection("home");
      renderBrand(findByQuery(allBrands(), button.dataset.brand));
    });
  });
}

function renderFilteredProducts() {
  let list = [...state.productCache, ...allProducts()].filter((item, index, all) => {
    return all.findIndex(candidate => normalize(candidate.name) === normalize(item.name)) === index;
  }).map(analyzeProduct);

  if (["halal", "haram", "doubtful"].includes(state.activeFilter)) {
    list = list.filter(product => product.status === state.activeFilter);
  }
  if (state.activeFilter === "boycott") {
    const boycottBrands = new Set(allBrands().filter(brand => brand.boycott).map(brand => normalize(brand.name)));
    list = list.filter(product => boycottBrands.has(normalize(product.brand)));
  }
  if (state.activeFilter === "no-gelatin") {
    list = list.filter(product => !product.composition.some(item => normalize(item).includes("gelatin")));
  }
  if (state.activeFilter === "no-e120") {
    list = list.filter(product => !product.composition.some(item => normalize(item).includes("e120") || normalize(item).includes("carmine")));
  }

  resultPanel.innerHTML = `
    <article class="result-card">
      <div class="panel__head">
        <h2>Подходящие товары</h2>
        <span class="badge">${list.length} товаров</span>
      </div>
      <div class="ingredient-list">
        ${list.length ? list.map(product => `
          <button class="ingredient-row product-filter-row" type="button" data-product-name="${product.name}">
            <div><strong>${product.name}</strong><span>${product.brand} · ${product.reason}</span></div>${badge(product.status)}
          </button>
        `).join("") : `<div class="empty-state"><p>По этому фильтру пока пусто. Попробуйте другой фильтр или проверьте товар по названию.</p></div>`}
      </div>
    </article>
  `;

  resultPanel.querySelectorAll("[data-product-name]").forEach(button => {
    button.addEventListener("click", () => renderProduct(findProduct(button.dataset.productName)));
  });
}

function renderBoycottTable() {
  renderTable("#boycottTable", ["Бренд", "Страна", "Категории", "Причина"], allBrands().filter(b => b.boycott).map(brand => [
    brand.name,
    brand.country,
    brand.categories,
    brand.reason
  ]));
}

function renderModerationTable() {
  const reportRows = state.reports.map(report => [report.type, report.user, report.comment, "Новая жалоба"]);
  const suggestionRows = state.suggestions.map(item => ["Предложение товара", item.user, `${item.name} · ${item.brand || "бренд не указан"} · ${item.comment || ""}`, "Ожидает"]);
  renderTable("#moderationTable", ["Тип", "Объект", "Комментарий", "Статус"], [...reportRows, ...suggestionRows, ...moderation]);
}

function renderMyReportsTable() {
  const email = state.currentUser?.email;
  const rows = state.reports
    .filter(report => report.user === email)
    .map(report => [report.type, report.comment, report.date, "Новая жалоба"]);
  renderTable("#myReportsTable", ["Тип", "Комментарий", "Дата", "Статус"], rows.length ? rows : [["Нет жалоб", "Вы ещё не отправляли жалобы", "-", "-"]]);
}

function renderUsersTable() {
  const registeredRows = state.registeredUsers.map(user => [
    user.name,
    user.email,
    user.role,
    user.country,
    user.status,
    "История, избранное, жалобы"
  ]);
  const registeredEmails = new Set(state.registeredUsers.map(user => user.email));
  const systemRows = users.filter(user => !registeredEmails.has(user[1]));
  renderTable("#usersTable", ["Имя", "Email", "Роль", "Страна", "Статус", "Права"], [...registeredRows, ...systemRows]);
}

function renderAdminUsersTable() {
  const registeredRows = state.registeredUsers.map(user => [
    user.name,
    user.email,
    user.role,
    user.country,
    user.status,
    `<button class="btn btn--secondary btn--sm" type="button" data-demo-action="Изменение роли будет подключено к backend">Изменить роль</button>`
  ]);
  const registeredEmails = new Set(state.registeredUsers.map(user => user.email));
  const systemRows = users.filter(user => !registeredEmails.has(user[1])).map(user => [
    user[0],
    user[1],
    user[2],
    user[3],
    user[4],
    `<button class="btn btn--secondary btn--sm" type="button" data-demo-action="Изменение роли будет подключено к backend">Изменить роль</button>`
  ]);
  renderTable("#adminUsersTable", ["Имя", "Email", "Роль", "Страна", "Статус", "Действие"], [...registeredRows, ...systemRows]);
  bindDemoActions();
}

function renderAdminTables() {
  renderAdminUsersTable();
  renderTable("#rolesTable", ["Роль", "Уровень", "Права", "Условие"], roles);
  renderTable("#moderatorsTable", ["Имя", "Email", "Зона ответственности", "Очередь", "Статус"], moderators);
  renderTable("#adminIngredientsTable", ["Название", "Синонимы", "Категория", "Статус", "Причина"], allIngredients().map(item => [
    item.name,
    item.aliases,
    item.category,
    badge(item.status),
    item.reason
  ]));
  renderTable("#adminProductsTable", ["Название", "Бренд", "Категория", "Статус", "Источник"], allProducts().map(product => {
    const analyzed = analyzeProduct(product);
    return [analyzed.name, analyzed.brand, analyzed.category, badge(analyzed.status), analyzed.source];
  }));
  renderTable("#adminBrandsTable", ["Название", "Страна", "Категории", "Бойкот", "Причина"], allBrands().map(brand => [
    brand.name,
    brand.country,
    brand.categories,
    brand.boycott ? "Да" : "Нет",
    brand.reason
  ]));
  renderTable("#rulesTable", ["Компонент", "Итоговый статус", "Условие", "Уверенность"], rules);
  renderTable("#sourcesTable", ["Источник", "Данные", "Статус", "Приоритет"], externalSources);
  renderTable("#cacheTable", ["Товар", "Бренд", "Статус", "Источник", "Обновлено"], state.productCache.map(product => [
    product.name,
    product.brand,
    badge(product.status),
    product.source,
    product.updatedAt || "-"
  ]));
}

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function addAdminProduct(data) {
  const product = {
    type: "product",
    name: data.name,
    brand: data.brand,
    category: data.category,
    country: data.country,
    barcode: data.barcode || "Нет данных",
    source: data.source || "Внесено админом",
    composition: splitCsv(data.composition),
    alternatives: splitCsv(data.alternatives).length ? splitCsv(data.alternatives) : ["Нет альтернатив"],
    reason: "Будет рассчитано по составу",
    status: "doubtful",
    confidence: 70
  };
  state.customProducts = [product, ...state.customProducts.filter(item => normalize(item.name) !== normalize(product.name))];
  saveState();
  renderAdminTables();
  renderFilteredProducts();
}

function addAdminBrand(data) {
  const brand = {
    name: data.name,
    country: data.country,
    categories: data.categories,
    boycott: data.boycott === "true",
    reason: data.reason || "Описание не указано",
    halal: splitCsv(data.halal)
  };
  state.customBrands = [brand, ...state.customBrands.filter(item => normalize(item.name) !== normalize(brand.name))];
  saveState();
  renderBrandCards();
  renderBoycottTable();
  renderAdminTables();
}

function addAdminIngredient(data) {
  const ingredient = {
    name: data.name,
    aliases: data.aliases || "Не указано",
    category: data.category,
    status: data.status,
    origin: data.origin || "Не указано",
    reason: data.reason,
    used: data.used || "Не указано",
    type: "ingredient"
  };
  state.customIngredients = [ingredient, ...state.customIngredients.filter(item => normalize(item.name) !== normalize(ingredient.name))];
  saveState();
  renderIngredientsTable();
  renderAdminTables();
}

function renderLists() {
  historyList.innerHTML = state.history.length ? state.history.map(item => `
    <div class="activity-item"><div><strong>${item.label}</strong><span>${item.date}</span></div><span class="badge">${displayStatus(item.status)}</span></div>
  `).join("") : `<div class="empty-state"><p>Здесь появятся товары и ингредиенты, которые вы проверяли после входа.</p></div>`;

  favoritesList.innerHTML = state.favorites.length ? state.favorites.map(item => `
    <div class="activity-item"><div><strong>${item.name}</strong><span>${itemTypeLabel(item.type)}</span></div><span class="badge">${displayStatus(item.status)}</span></div>
  `).join("") : `<div class="empty-state"><p>Сохраняйте спорные товары, бренды и ингредиенты, чтобы не искать их заново.</p></div>`;

  const email = state.currentUser?.email;
  const userSuggestions = state.suggestions.filter(item => item.user === email);
  suggestionsList.innerHTML = userSuggestions.length ? userSuggestions.map(item => `
    <div class="activity-item"><div><strong>${item.name}</strong><span>${item.brand || "Бренд не указан"} · ${item.date}</span></div><span class="badge">Ожидает</span></div>
  `).join("") : `<div class="empty-state"><p>Если товара нет в базе, предложите его в разделе обращений.</p></div>`;

  const userVotes = state.votes.filter(item => item.user === email);
  votesList.innerHTML = userVotes.length ? userVotes.map(item => `
    <div class="activity-item"><div><strong>${item.target}</strong><span>${item.date}</span></div><span class="badge">${item.value === "correct" ? "Все верно" : "Есть ошибка"}</span></div>
  `).join("") : `<div class="empty-state"><p>Когда вы отметите карточку как верную или ошибочную, голос появится здесь.</p></div>`;
}

function addVote(target, value) {
  if (!requireAuth("Голосование")) return;
  state.votes = [{ target, value, user: state.currentUser.email, date: new Date().toLocaleString("ru-RU") }, ...state.votes];
  saveState();
  renderLists();
  alert("Спасибо, отметка сохранена. Так база становится точнее.");
}

function bindResultActions() {
  document.querySelectorAll("[data-vote]").forEach(button => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => addVote(button.dataset.voteTarget, button.dataset.vote));
  });
  document.querySelectorAll("[data-open-report]").forEach(button => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", openReport);
  });
}

function bindDemoActions() {
  document.querySelectorAll("[data-demo-action]").forEach(button => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => alert(button.dataset.demoAction));
  });
}

function renderAuthState() {
  const user = state.currentUser;
  const isAdmin = user?.role === "Администратор";
  const userPill = document.querySelector("#userPill");
  const authActionBtn = document.querySelector("#authActionBtn");
  const authNavLink = document.querySelector("#authNavLink");
  if (userPill) userPill.textContent = user ? `${user.name} · ${user.role}` : "Гость";
  if (authActionBtn) authActionBtn.textContent = user ? "Кабинет" : "Войти";
  if (authNavLink) authNavLink.classList.toggle("is-hidden", Boolean(user));
  document.querySelector("#profileName").value = user?.name || "Гость";
  document.querySelector("#profileEmail").value = user?.email || "Не авторизован";
  document.querySelector("#profileLanguage").value = user?.language || "Русский";
  document.querySelector("#profileCountry").value = user?.country || "Кыргызстан";
  document.querySelectorAll(".admin-only").forEach(item => item.classList.toggle("is-hidden", !isAdmin));
  document.querySelectorAll(".auth-only").forEach(item => item.classList.toggle("is-hidden", !user));
  if (user && document.querySelector("#auth").classList.contains("active")) {
    showSection("cabinet");
  }
}

function loginUser(email, password) {
  const user = state.registeredUsers.find(item => item.email === email && item.password === password);
  if (!user) {
    alert("Пользователь не найден. Проверьте email и пароль или пройдите регистрацию.");
    return;
  }
  state.currentUser = user;
  saveState();
  renderAuthState();
  showSection("cabinet");
}

function registerUser(data) {
  const exists = state.registeredUsers.some(user => user.email === data.email);
  if (exists) {
    alert("Пользователь с таким email уже зарегистрирован.");
    return;
  }
  const user = { ...data, role: "Авторизованный", status: "Активен" };
  state.registeredUsers.unshift(user);
  state.currentUser = user;
  saveState();
  renderAuthState();
  renderUsersTable();
  renderAdminTables();
  showSection("cabinet");
}

function showSection(id) {
  if (id === "ingredients" && !state.photoChecked) {
    showSection("home");
    return;
  }
  if (id === "auth" && state.currentUser) {
    showSection("cabinet");
    return;
  }
  if (id === "cabinet" && !state.currentUser) {
    showSection("auth");
    return;
  }
  if (id === "reports" && !state.currentUser) {
    showSection("auth");
    return;
  }
  const adminSections = ["users", "admin"];
  if (adminSections.includes(id) && state.currentUser?.role !== "Администратор") {
    showSection(state.currentUser ? "cabinet" : "auth");
    return;
  }
  document.querySelectorAll(".page").forEach(page => page.classList.toggle("active", page.id === id));
  document.querySelectorAll(".nav__link").forEach(link => link.classList.toggle("active", link.dataset.section === id));
  document.body.classList.toggle("admin-shell", ["users", "admin"].includes(id));
  document.body.dataset.section = id;
  if (id === "reports") renderMyReportsTable();
  document.querySelector(".sidebar").classList.remove("open");
}

function openReport() {
  if (!requireAuth("Жалобы")) return;
  document.querySelector("#reportModal").showModal();
}

function closeReport() {
  document.querySelector("#reportModal").close();
}

