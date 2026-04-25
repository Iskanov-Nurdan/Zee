document.querySelectorAll(".nav__link").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    showSection(link.dataset.section);
  });
});

document.querySelectorAll("[data-section-jump]").forEach(button => {
  button.addEventListener("click", () => showSection(button.dataset.sectionJump));
});

document.querySelectorAll("[data-add-demo]").forEach(button => {
  button.addEventListener("click", () => {
    if (!requireAuth("Предложение")) return;
    showSection("reports");
  });
});

function activateCheckMode(mode) {
  document.querySelectorAll("[data-mode]").forEach(item => item.classList.toggle("active", item.dataset.mode === mode));
  document.querySelectorAll(".check-mode").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === mode));
}

document.querySelectorAll("[data-mode]").forEach(tab => {
  tab.addEventListener("click", () => activateCheckMode(tab.dataset.mode));
});

document.querySelectorAll("[data-mode-jump]").forEach(button => {
  button.addEventListener("click", () => activateCheckMode(button.dataset.modeJump));
});

document.querySelectorAll("[data-auth-tab]").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("[data-auth-tab]").forEach(item => item.classList.remove("active"));
    document.querySelectorAll(".auth-form").forEach(form => form.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.authTab}Form`).classList.add("active");
  });
});

document.querySelectorAll("select").forEach(select => {
  if (select.dataset.enhanced === "true") return;
  select.dataset.enhanced = "true";

  const wrapper = document.createElement("div");
  wrapper.className = "custom-select";
  wrapper.dataset.customSelect = "";

  const trigger = document.createElement("button");
  trigger.className = "custom-select__trigger";
  trigger.type = "button";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.innerHTML = `<span>${select.options[select.selectedIndex]?.textContent || "Выберите"}</span>`;

  const menu = document.createElement("div");
  menu.className = "custom-select__menu";
  menu.setAttribute("role", "listbox");

  [...select.options].forEach(option => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "option");
    button.dataset.value = option.value;
    button.textContent = option.textContent;
    button.setAttribute("aria-selected", String(option.selected));
    menu.append(button);
  });

  wrapper.append(trigger, menu);
  select.classList.add("native-select-hidden");
  select.after(wrapper);
});

document.querySelectorAll("[data-custom-select]").forEach(select => {
  const trigger = select.querySelector(".custom-select__trigger");
  const hidden = select.querySelector("input[type='hidden']");
  const nativeSelect = select.previousElementSibling?.matches?.("select.native-select-hidden") ? select.previousElementSibling : null;
  const label = trigger.querySelector("span");
  const options = select.querySelectorAll("[role='option']");

  trigger.addEventListener("click", () => {
    const isOpen = select.classList.toggle("open");
    trigger.setAttribute("aria-expanded", String(isOpen));
  });

  options.forEach(option => {
    option.addEventListener("click", () => {
      if (hidden) hidden.value = option.dataset.value;
      if (nativeSelect) {
        nativeSelect.value = option.dataset.value;
        nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
      label.textContent = option.textContent;
      options.forEach(item => item.setAttribute("aria-selected", "false"));
      option.setAttribute("aria-selected", "true");
      select.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    });
  });
});

document.addEventListener("click", event => {
  document.querySelectorAll("[data-custom-select].open").forEach(select => {
    if (select.contains(event.target)) return;
    select.classList.remove("open");
    select.querySelector(".custom-select__trigger").setAttribute("aria-expanded", "false");
  });
});

function activateAdminTab(tabId) {
  document.querySelectorAll("[data-admin-tab]").forEach(item => item.classList.toggle("active", item.dataset.adminTab === tabId));
  document.querySelectorAll(".admin-tab-panel").forEach(panel => panel.classList.toggle("active", panel.id === tabId));
  document.querySelectorAll("[data-quick-admin-tab]").forEach(item => item.classList.toggle("active", item.dataset.quickAdminTab === tabId));
  window.setTimeout(() => {
    document.querySelector(`#${tabId}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 80);
}

document.querySelectorAll("[data-admin-tab]").forEach(tab => {
  tab.addEventListener("click", () => activateAdminTab(tab.dataset.adminTab));
});

document.querySelectorAll("[data-quick-admin-tab]").forEach(button => {
  button.addEventListener("click", () => {
    if (!document.body.classList.contains("admin-shell")) showSection("admin");
    activateAdminTab(button.dataset.quickAdminTab);
  });
});

document.querySelectorAll("[data-search-form]").forEach(form => {
  form.addEventListener("submit", event => {
    event.preventDefault();
    runSearch(form.dataset.searchForm, new FormData(form).get("query"));
  });
});

document.querySelectorAll("[data-sample-search]").forEach(button => {
  button.addEventListener("click", () => {
    const input = document.querySelector("#productSearch");
    input.value = button.dataset.sampleSearch;
    runSearch(button.dataset.sampleType || "product", input.value);
  });
});

document.querySelector("[data-run-ocr]").addEventListener("click", runOcrDemo);

document.querySelectorAll("[data-photo-source]").forEach(button => {
  button.addEventListener("click", () => {
    const input = document.querySelector(button.dataset.photoSource === "camera" ? "#cameraInput" : "#galleryInput");
    input?.click();
  });
});

function syncPhotoInput(sourceInput) {
  const file = sourceInput.files?.[0];
  const photoInput = document.querySelector("#photoInput");
  const status = document.querySelector("[data-photo-status]");
  const preview = document.querySelector("[data-photo-preview]");

  if (!file) return;

  state.selectedPhotoFile = file;
  if (photoInput && window.DataTransfer) {
    const transfer = new DataTransfer();
    transfer.items.add(file);
    photoInput.files = transfer.files;
  }
  if (status) status.textContent = file.name;

  if (preview) {
    preview.src = URL.createObjectURL(file);
    preview.classList.remove("is-hidden");
  }

  runOcrDemo();
}

document.querySelectorAll("#cameraInput, #galleryInput, #photoInput").forEach(input => {
  input.addEventListener("change", () => syncPhotoInput(input));
});

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(item => item.classList.remove("active"));
    chip.classList.add("active");
    state.activeFilter = chip.dataset.filter;
    renderBrandCards();
    renderFilteredProducts();
  });
});

document.querySelector(".mobile-menu").addEventListener("click", () => {
  document.querySelector(".sidebar").classList.toggle("open");
});

document.querySelectorAll("[data-open-report]").forEach(button => button.addEventListener("click", openReport));
document.querySelectorAll("[data-close-report]").forEach(button => button.addEventListener("click", closeReport));
document.querySelector("[data-clear-history]").addEventListener("click", () => {
  state.history = [];
  saveState();
  renderLists();
});
document.querySelector("#brandCountry").addEventListener("change", renderBrandCards);
document.querySelector("#authActionBtn")?.addEventListener("click", () => showSection(state.currentUser ? "cabinet" : "auth"));
document.querySelector("#loginForm").addEventListener("submit", event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  loginUser(data.email, data.password);
});
document.querySelector("#registerForm").addEventListener("submit", event => {
  event.preventDefault();
  registerUser(Object.fromEntries(new FormData(event.currentTarget)));
});
document.querySelector("#reportForm").addEventListener("submit", event => {
  const data = Object.fromEntries(new FormData(event.currentTarget));
  state.reports.unshift({
    ...data,
    user: state.currentUser?.email || "unknown",
    date: new Date().toLocaleString("ru-RU")
  });
  saveState();
  renderModerationTable();
  renderMyReportsTable();
  event.currentTarget.reset();
});
document.querySelector("#suggestProductForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!requireAuth("Предложение товара")) return;
  state.suggestions.unshift({
    ...Object.fromEntries(new FormData(event.currentTarget)),
    user: state.currentUser.email,
    date: new Date().toLocaleString("ru-RU")
  });
  saveState();
  renderModerationTable();
  renderLists();
  event.currentTarget.reset();
  alert("Товар отправлен на модерацию.");
});
document.querySelector("#adminProductForm").addEventListener("submit", event => {
  event.preventDefault();
  addAdminProduct(Object.fromEntries(new FormData(event.currentTarget)));
  event.currentTarget.reset();
});
document.querySelector("#adminBrandForm").addEventListener("submit", event => {
  event.preventDefault();
  addAdminBrand(Object.fromEntries(new FormData(event.currentTarget)));
  event.currentTarget.reset();
});
document.querySelector("#adminIngredientForm").addEventListener("submit", event => {
  event.preventDefault();
  addAdminIngredient(Object.fromEntries(new FormData(event.currentTarget)));
  event.currentTarget.reset();
});
document.querySelector("#logoutBtn").addEventListener("click", () => {
  state.currentUser = null;
  saveState();
  renderAuthState();
  showSection("auth");
});

renderIngredientsTable();
renderBrandCards();
renderBoycottTable();
renderModerationTable();
renderUsersTable();
renderAdminTables();
renderLists();
renderMyReportsTable();
renderAuthState();
renderIngredientsAccess();
document.body.dataset.section = document.querySelector(".page.active")?.id || "home";
bindDemoActions();
