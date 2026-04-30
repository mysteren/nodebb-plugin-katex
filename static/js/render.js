/**
 * Ленивая загрузка и рендеринг KaTeX для NodeBB
 * Версия 2.0 - исправлены проблемы с SPA-навигацией
 */

(function () {
	"use strict";

	console.log("[KaTeX] Plugin initialized");

	// === Состояние загрузки ===
	let katexLoaded = false;
	let katexLoading = false;
	let loadCallbacks = [];

	// === Debounce таймеры ===
	let renderTimer = null;
	const RENDER_DELAY = 150; // Задержка перед рендерингом (мс)

	// === Регулярное выражение для быстрой проверки ===
	const MATH_PATTERN = /\$\$|\\\[|\\\(|\$/;

	/**
	 * Debounce функция - откладывает выполнение
	 * @param {Function} func - Функция для выполнения
	 * @param {number} wait - Задержка в мс
	 */
	function debounce(func, wait) {
		return function executedFunction() {
			const context = this;
			const args = arguments;

			clearTimeout(renderTimer);
			renderTimer = setTimeout(function () {
				func.apply(context, args);
			}, wait);
		};
	}

	/**
	 * Проверка полной загрузки KaTeX
	 */
	function isKatexReady() {
		return (
			typeof window.katex !== "undefined" &&
			typeof window.katex.render === "function"
			// typeof window.renderMathInElement === "function" &&
			// typeof window.katex.__parse !== "undefined" // внутренняя проверка
		);
	}

	/**
	 * Проверка наличия формул в элементе
	 * @param {HTMLElement} element
	 * @returns {boolean}
	 */
	function hasFormulas(element) {
		if (!element) return false;

		// Быстрая проверка через textContent
		return MATH_PATTERN.test(element.textContent);
	}

	/**
	 * Проверка наличия формул на странице
	 * @returns {boolean}
	 */
	function hasMathContent() {
		// Проверяем в постах
		const posts = document.querySelectorAll(
			'.posts-container [component="post/content"]',
		);
		for (let i = 0; i < posts.length; i++) {
			if (hasFormulas(posts[i])) {
				return true;
			}
		}

		// Проверяем в превью редактора
		const preview = document.querySelector(".preview-container");
		if (hasFormulas(preview)) {
			return true;
		}

		// Проверяем в заголовках тем
		const titles = document.querySelectorAll('[component="topic/title"]');
		for (let i = 0; i < titles.length; i++) {
			if (hasFormulas(titles[i])) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Загрузка CSS файла
	 * @param {string} href - Путь к CSS
	 * @returns {Promise}
	 */
	function loadCSS(href) {
		return new Promise(function (resolve, reject) {
			// Проверяем, не загружен ли уже
			const existing = document.querySelector('link[href="' + href + '"]');
			if (existing) {
				resolve();
				return;
			}

			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = href;
			link.onload = resolve;
			link.onerror = reject;
			document.head.appendChild(link);
		});
	}

	/**
	 * Загрузка JavaScript файла
	 * @param {string} src - Путь к JS
	 * @returns {Promise}
	 */
	function loadScript(src) {
		return new Promise(function (resolve, reject) {
			// Проверяем глобальный объект
			if (window.renderMathInElement && window.katex) {
				resolve();
				return;
			}

			// Проверяем, не загружен ли уже скрипт
			const existing = document.querySelector('script[src="' + src + '"]');
			if (existing) {
				// Ждем, пока загрузится
				existing.onload = resolve;
				existing.onerror = reject;
				return;
			}

			const script = document.createElement("script");
			script.src = src;
			script.onload = resolve;
			script.onerror = reject;
			document.body.appendChild(script);
		});
	}

	/**
	 * Ожидание готовности KaTeX с таймаутом
	 */
	function waitForKatex(maxAttempts = 50, interval = 50) {
		return new Promise((resolve, reject) => {
			let attempts = 0;

			const check = () => {
				if (isKatexReady()) {
					resolve();
					return;
				}

				attempts++;
				if (attempts >= maxAttempts) {
					reject(new Error("KaTeX did not initialize in time"));
					return;
				}

				setTimeout(check, interval);
			};

			check();
		});
	}

	/**
	 * Загрузка библиотеки KaTeX
	 * @returns {Promise}
	 */
	async function loadKaTeX() {
		// Если уже загружено
		if (katexLoaded && window.renderMathInElement && window.katex) {
			return;
		}

		// Если загружается сейчас - ждем
		if (katexLoading) {
			return new Promise(function (resolve) {
				loadCallbacks.push(resolve);
			});
		}

		console.log("[KaTeX] Loading library...");
		katexLoading = true;

		try {
			// Правильный путь согласно plugin.json staticDirs
			const basePath = "/assets/plugins/nodebb-plugin-katex2/katex/";

			await loadScript(basePath + "katex.min.js");

			// 3. Ждем инициализации katex
			await waitForKatex(10000);

			// Параллельная загрузка всех ресурсов
			await Promise.all([
				loadCSS(basePath + "katex.min.css"),
				loadScript(basePath + "contrib/auto-render.min.js"),
			]);

			// Проверяем, что библиотека действительно загрузилась
			if (!window.renderMathInElement || !window.katex) {
				throw new Error("KaTeX library not available after loading");
			}

			katexLoaded = true;
			katexLoading = false;
			console.log("[KaTeX] Library loaded successfully");

			// Вызываем все ожидающие колбэки
			loadCallbacks.forEach(function (callback) {
				callback();
			});
			loadCallbacks = [];
		} catch (err) {
			katexLoading = false;
			katexLoaded = false;
			console.error("[KaTeX] Failed to load library:", err);
			throw err;
		}
	}

	/**
	 * Конфигурация рендеринга KaTeX
	 */
	const KATEX_CONFIG = {
		delimiters: [
			{ left: "$$", right: "$$", display: true },
			{ left: "\\[", right: "\\]", display: true },
			{ left: "\\(", right: "\\)", display: false },
		],
		throwOnError: false,
		errorColor: "#cc0000",
		strict: false,
		trust: false,
		// Игнорируем уже отрендеренные элементы
		ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
		ignoredClasses: ["katex", "katex-display", "katex-rendered"],
	};

	/**
	 * Очистка HTML-тегов внутри формул
	 * @param {HTMLElement} element
	 */
	function cleanMathElements(element) {
		if (!element) return;

		const walker = document.createTreeWalker(
			element,
			NodeFilter.SHOW_TEXT,
			null,
			false,
		);

		const nodesToProcess = [];
		let node;

		// Собираем текстовые узлы с формулами
		while ((node = walker.nextNode())) {
			const text = node.textContent;
			if (MATH_PATTERN.test(text)) {
				nodesToProcess.push(node);
			}
		}

		// Очищаем от лишних HTML-тегов
		nodesToProcess.forEach(function (textNode) {
			let parent = textNode.parentNode;

			// Пропускаем уже отрендеренные элементы
			if (parent && parent.classList && parent.classList.contains("katex")) {
				return;
			}

			if (
				parent &&
				(parent.innerHTML.includes("<br") ||
					parent.innerHTML.includes("<p") ||
					parent.innerHTML.includes("<span"))
			) {
				const cleanText = parent.textContent;

				if (MATH_PATTERN.test(cleanText)) {
					parent.textContent = cleanText;
				}
			}
		});
	}

	/**
	 * Рендеринг формул в элементе
	 * @param {HTMLElement} element
	 * @returns {boolean} - true если что-то отрендерено
	 */
	function renderMath(element) {
		if (!element || !window.renderMathInElement) {
			return false;
		}

		// Проверяем наличие формул
		if (!hasFormulas(element)) {
			return false;
		}

		// Проверяем, не рендерили ли уже этот элемент
		if (element.hasAttribute("data-katex-rendered")) {
			return false;
		}

		try {
			// Очищаем от HTML-тегов
			cleanMathElements(element);

			// Рендерим формулы
			window.renderMathInElement(element, KATEX_CONFIG);

			// Помечаем как отрендеренный
			element.setAttribute("data-katex-rendered", "true");

			return true;
		} catch (err) {
			console.error("[KaTeX] Render error:", err);
			return false;
		}
	}

	/**
	 * Сброс флага рендеринга для обновленного контента
	 * @param {HTMLElement} element
	 */
	function markForRerender(element) {
		if (element && element.hasAttribute("data-katex-rendered")) {
			element.removeAttribute("data-katex-rendered");

			// Также сбрасываем для вложенных элементов
			const rendered = element.querySelectorAll("[data-katex-rendered]");
			rendered.forEach(function (el) {
				el.removeAttribute("data-katex-rendered");
			});
		}
	}

	/**
	 * Рендеринг всех постов на странице
	 */
	async function renderAllPosts() {
		// Проверяем наличие формул
		if (!hasMathContent()) {
			console.log("[KaTeX] No math content found");
			return;
		}

		try {
			// Загружаем KaTeX если нужно
			await loadKaTeX();

			let renderCount = 0;

			// Рендерим посты
			const posts = document.querySelectorAll('[component="post/content"]');
			posts.forEach(function (post) {
				if (renderMath(post)) {
					renderCount++;
				}
			});

			// Рендерим превью редактора
			const preview = document.querySelector(".preview-container");
			if (preview) {
				renderMath(preview);
			}

			// Рендерим заголовки тем
			const titles = document.querySelectorAll('[component="topic/title"]');
			titles.forEach(function (title) {
				renderMath(title);
			});

			if (renderCount > 0) {
				console.log("[KaTeX] Rendered " + renderCount + " new posts");
			}
		} catch (err) {
			console.error("[KaTeX] Failed to render posts:", err);
		}
	}

	/**
	 * Debounced версия рендеринга
	 */
	const debouncedRender = debounce(renderAllPosts, RENDER_DELAY);

	/**
	 * Обработчик для событий навигации
	 * Критично для SPA-режима NodeBB
	 */
	function handleNavigation() {
		// Сбрасываем все флаги рендеринга при навигации
		const allPosts = document.querySelectorAll("[data-katex-rendered]");
		allPosts.forEach(function (post) {
			post.removeAttribute("data-katex-rendered");
		});

		// Запускаем рендеринг с задержкой
		debouncedRender();
	}

	/**
	 * Инициализация плагина
	 */
	function init() {
		console.log("[KaTeX] Initializing plugin");

		// Первоначальный рендеринг
		debouncedRender();

		// === События NodeBB ===

		// Навигация в SPA (КРИТИЧНО!)
		$(window).on("action:ajaxify.end", function (event, data) {
			console.log("[KaTeX] Page navigation detected:", data.url);
			handleNavigation();
		});

		// Загрузка новых постов (скролл, пагинация)
		$(window).on("action:posts.loaded", function (event, data) {
			console.log("[KaTeX] New posts loaded:", data.posts.length);
			debouncedRender();
		});

		// Загрузка темы
		$(window).on("action:topic.loaded", function (event, data) {
			console.log("[KaTeX] Topic loaded:", data.tid);
			debouncedRender();
		});

		// Обновление превью в редакторе
		$(window).on("action:composer.preview", function () {
			if (hasMathContent()) {
				loadKaTeX()
					.then(function () {
						const preview = document.querySelector(".preview-container");
						if (preview) {
							markForRerender(preview);
							renderMath(preview);
						}
					})
					.catch(function (err) {
						console.error("[KaTeX] Preview render error:", err);
					});
			}
		});

		// Редактирование поста
		$(window).on("action:posts.edited", function (event, data) {
			console.log("[KaTeX] Post edited:", data.post.pid);
			debouncedRender();
		});

		// Создание нового поста
		$(window).on("action:posts.loaded", function () {
			debouncedRender();
		});
	}

	// === Точка входа ===

	// NodeBB использует jQuery, поверяем его наличие
	// if (typeof $ === "undefined" || typeof jQuery === "undefined") {
	// 	console.error("[KaTeX] jQuery not found! Plugin may not work correctly.");
	// }

	// Запуск после полной загрузки
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		// DOM уже загружен
		init();
	}
})();
