# Zeekr frontend

Структура подготовлена под Django Templates + static files.

## Структура

```text
templates/
  base.html
  index.html
  partials/
    sidebar.html
    topbar.html
    report_modal.html
  pages/
    auth.html
    home.html
    ingredients.html
    brands.html
    boycott.html
    cabinet.html
    reports.html
    users.html
    admin.html

static/
  zeekr/
    css/
      styles.css
      responsive.css
    js/
      data.js
      core.js
      app.js
      init.js
```

`index.html` в корне оставлен как статическая версия, которую можно открыть без Django.

## Django view пример

```python
from django.shortcuts import render


def index(request):
    return render(request, "index.html")
```

В `settings.py` должны быть настроены `TEMPLATES` и `STATIC_URL`.
