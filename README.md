# KaTeX Math Renderer for NodeBB

[English](#english) | [Русский](#russian)

---

<a name="english"></a>
## English

Modern KaTeX math rendering plugin for NodeBB 4+.

### Features

- ✨ **Lazy loading** - KaTeX loads only when math expressions are detected on the page
- 📐 **Display mode syntax** - Currently supports `$$...$$` delimiters
- 🎨 **Server-side ready** - Minimal server logic, client-side rendering
- 🌐 **CDN delivery** - Uses bundled KaTeX for fast delivery
- 🚀 **Parser hook integration** - Seamlessly integrates with NodeBB's parser
- 📱 **Responsive design** - Works on mobile and desktop devices
- 🌙 **Dark theme support** - Automatically adapts to color schemes

### Installation

#### Via npm (recommended)

```bash
cd /path/to/nodebb
npm install nodebb-plugin-katex2
```

#### Manual installation

1. Clone the plugin into `/nodebb/node_modules/`
2. Activate the plugin in NodeBB admin panel
3. Restart NodeBB

```bash
cd /path/to/nodebb/node_modules
git clone https://github.com/mysteren/nodebb-plugin-katex.git
cd ../..
npm install ./node_modules/nodebb-plugin-katex
./nodebb restart
```

### Usage

#### Display mode (separate line)

Currently, only the `$$...$$` syntax is fully supported and tested:

```
$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

Example with integrals:

```
$$
\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

**Note:** While the code includes support for `\[...\]` (display) and `\(...\)` (inline) delimiters, these modes are not currently guaranteed to work correctly. Use `$$...$$` for reliable math rendering.

### Architecture

#### `lib/index.js`
Main plugin module with hooks:
- `init()` - Plugin initialization on load

#### `static/js/render.js`
Client-side script for:
- Loading KaTeX CSS and JS from bundled assets
- Lazy initialization (only when expressions are present)
- Dynamic content support (AJAX navigation)
- Cleaning HTML tags inside math expressions

#### `static/css/katex.css`
Additional styles for:
- Proper inline expression spacing
- Display expression alignment
- Dark theme support

### Technical Details

#### Server-side
- Minimal server-side logic
- Plugin initialization hook only
- No server-side parsing overhead

#### Client-side Loading
- KaTeX CSS loads only when math expressions are detected
- KaTeX JS loads from bundled assets
- Auto-render extension for automatic detection
- Support for dynamic content via AJAX
- HTML tag cleanup inside math expressions

### Compatibility

- **NodeBB**: 4.0+
- **Node.js**: 18+
- **Browsers**: All modern browsers (Chrome, Firefox, Safari, Edge)

### Dependencies

- **katex** (^0.16.27) - KaTeX math typesetting library

### Development Dependencies

- **eslint** (^9.35.0) - Code linting

### Performance

- Fast client-side rendering
- Lazy resource loading
- Minimal page load impact
- Caching support
- No server-side parsing overhead

### Scripts

```bash
npm run lint    # Check code style
npm run fix     # Auto-fix linting issues
```

### License

MIT

### Author

Timofey (mysteren)

### Acknowledgments

- Original plugin by [Benjamin Abel](https://github.com/benabel/nodebb-plugin-katex)
- [KaTeX](https://katex.org/) - Fast math typesetting library by Khan Academy

---

<a name="russian"></a>
## Русский

Современный плагин для поддержки математических выражений KaTeX в NodeBB 4+.

### Возможности

- ✨ **Ленивая загрузка** - KaTeX подгружается только когда на странице есть математические выражения
- 📐 **Режим отображения** - В настоящее время поддерживается синтаксис `$$...$$`
- 🎨 **Готов к серверу** - Минимальная серверная логика, рендеринг на клиенте
- 🌐 **CDN доставка** - Использует встроенный KaTeX для быстрой доставки
- 🚀 **Интеграция с парсером** - Бесшовно интегрируется с парсером NodeBB
- 📱 **Адаптивный дизайн** - Работает на мобильных и десктопных устройствах
- 🌙 **Поддержка тёмной темы** - Автоматически адаптируется к схеме цветов

### Установка

#### Через npm (рекомендуется)

```bash
cd /путь/к/nodebb
npm install nodebb-plugin-katex2
```

#### Ручная установка

1. Клонируйте плагин в `/nodebb/node_modules/`
2. Активируйте плагин в панели администратора NodeBB
3. Перезапустите NodeBB

```bash
cd /путь/к/nodebb/node_modules
git clone https://github.com/mysteren/nodebb-plugin-katex.git
cd ../..
npm install ./node_modules/nodebb-plugin-katex
./nodebb restart
```

### Использование

#### Display режим (отдельной строкой)

В настоящее время полностью поддерживается и протестирован только синтаксис `$$...$$`:

```
$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

Пример с интегралами:

```
$$
\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

**Примечание:** Хотя в коде присутствует поддержка разделителей `\[...\]` (отображаемый режим) и `\(...\)` (встроенный режим), корректная работа этих режимов в настоящее время не гарантируется. Используйте `$$...$$` для надёжного отображения формул.

### Архитектура

#### `lib/index.js`
Основной модуль плагина с хуками:
- `init()` - Инициализация плагина при загрузке

#### `static/js/render.js`
Клиентский скрипт для:
- Загрузки KaTeX CSS и JS из встроенных ресурсов
- Ленивой инициализации (только при наличии выражений)
- Поддержки динамического контента (AJAX навигация)
- Очистки HTML-тегов внутри математических выражений

#### `static/css/katex.css`
Дополнительные стили для:
- Правильного отступа inline выражений
- Выравнивания display выражений
- Поддержки тёмной темы

### Технические детали

#### Серверная часть
- Минимальная логика на сервере
- Только хук инициализации плагина
- Отсутствие нагрузки на парсинг на сервере

#### Загрузка на клиенте
- KaTeX CSS загружается только при обнаружении математических выражений
- KaTeX JS загружается из встроенных ресурсов
- Расширение auto-render для автоматического обнаружения
- Поддержка динамического контента через AJAX
- Очистка HTML-тегов внутри математических выражений

### Совместимость

- **NodeBB**: 4.0+
- **Node.js**: 18+
- **Браузеры**: Все современные браузеры (Chrome, Firefox, Safari, Edge)

### Зависимости

- **katex** (^0.16.27) - Библиотека математической вёрстки KaTeX

### Зависимости для разработки

- **eslint** (^9.35.0) - Проверка стиля кода

### Производительность

- Быстрый рендеринг на клиенте
- Ленивая загрузка ресурсов
- Минимальное влияние на загрузку страницы
- Поддержка кэширования
- Отсутствие нагрузки на парсинг на сервере

### Скрипты

```bash
npm run lint    # Проверка стиля кода
npm run fix     # Автоматическое исправление ошибок стиля
```

### Лицензия

MIT

### Автор

Timofey (mysteren)

### Благодарности

- Оригинальный плагин от [Benjamin Abel](https://github.com/benabel/nodebb-plugin-katex)
- [KaTeX](https://katex.org/) - Быстрая библиотека математической вёрстки от Khan Academy
