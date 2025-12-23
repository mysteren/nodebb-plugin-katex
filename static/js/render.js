/**
 * Ленивая загрузка и рендеринг KaTeX
 * Библиотека загружается только если на странице есть формулы
 */

(function () {
	"use strict";

	console.log("Katex render");

	// Флаги загрузки
	let katexLoaded = false;
	let katexLoading = false;
	let loadCallbacks = [];

	/**
	 * Регулярное выражение для поиска формул
	 * Ищем разделители: $$, \[, \(
	 */
	const MATH_PATTERN = /\$\$|\\\[|\\\(/;

	/**
	 * Проверка наличия формул на странице
	 * @returns {boolean}
	 */
	function hasMathContent() {
		// Проверяем в постах
		const posts = document.querySelectorAll('[component="post/content"]');

		for (let i = 0; i < posts.length; i++) {
			if (MATH_PATTERN.test(posts[i].textContent)) {
				return true;
			}
		}

		// Проверяем в превью редактора
		const preview = document.querySelector(".preview-container");
		if (preview && MATH_PATTERN.test(preview.textContent)) {
			return true;
		}

		// Проверяем в заголовках
		const titles = document.querySelectorAll('[component="topic/title"]');
		for (let i = 0; i < titles.length; i++) {
			if (MATH_PATTERN.test(titles[i].textContent)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Динамическая загрузка CSS файла
	 * @param {string} href - Путь к CSS файлу
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
	 * Динамическая загрузка JavaScript файла
	 * @param {string} src - Путь к JS файлу
	 * @returns {Promise}
	 */
	function loadScript(src) {
		return new Promise(function (resolve, reject) {
			// Проверяем, не загружен ли уже
			const existing = document.querySelector('script[src="' + src + '"]');
			if (existing) {
				resolve();
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
	 * Загрузка библиотеки KaTeX (с async/await и параллельной загрузкой)
	 * @returns {Promise}
	 */
	async function loadKaTeX() {
		// Если уже загружено
		if (katexLoaded) {
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
			// Путь к библиотеке в node_modules
			// const basePath = "/plugins/nodebb-plugin-katex/node_modules/katex/dist/";
			// Находим правильный путь
			// Путь к файлам через modules
			const basePath = "/assets/plugins/nodebb-plugin-katex2/katex/";

			// Параллельная загрузка всех файлов
			await Promise.all([
				loadCSS(basePath + "katex.min.css"),
				loadScript(basePath + "katex.min.js"),
				loadScript(basePath + "contrib/auto-render.min.js"),
			]);

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
			console.error("[KaTeX] Failed to load library:", err);
			throw err;
		}
	}

	/**
	 * Конфигурация KaTeX
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
	};

	/**
	 * Очистка HTML-тегов внутри формул
	 * Markdown может добавить <br>, <p> и другие теги
	 * @param {HTMLElement} element
	 */
	function cleanMathElements(element) {
		const walker = document.createTreeWalker(
			element,
			NodeFilter.SHOW_TEXT,
			null,
			false,
		);

		const nodesToProcess = [];
		let node;

		// Собираем все текстовые узлы с формулами
		while ((node = walker.nextNode())) {
			const text = node.textContent;
			if (MATH_PATTERN.test(text)) {
				nodesToProcess.push(node);
			}
		}

		// Очищаем найденные узлы от HTML
		nodesToProcess.forEach(function (textNode) {
			let parent = textNode.parentNode;

			if (
				parent &&
				(parent.innerHTML.includes("<br") || parent.innerHTML.includes("<p"))
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
	 */
	function renderMath(element) {
		if (!element) return;

		try {
			// Сначала очищаем от HTML-тегов
			cleanMathElements(element);

			// Затем рендерим формулы
			renderMathInElement(element, KATEX_CONFIG);
		} catch (err) {
			console.error("[KaTeX] Render error:", err);
		}
	}

	/**
	 * Рендеринг всех постов (async)
	 */
	async function renderAllPosts() {
		// Проверяем наличие формул
		if (!hasMathContent()) {
			console.log("[KaTeX] No math content found, skipping");
			return;
		}

		try {
			// Загружаем KaTeX если нужно
			await loadKaTeX();

			// Рендерим посты
			const posts = document.querySelectorAll('[component="post/content"]');
			posts.forEach(function (post) {
				renderMath(post);
			});

			// Рендерим превью
			const preview = document.querySelector(".preview-container");
			if (preview) {
				renderMath(preview);
			}

			// Рендерим заголовки
			const titles = document.querySelectorAll('[component="topic/title"]');
			titles.forEach(function (title) {
				renderMath(title);
			});

			console.log("[KaTeX] Rendered " + posts.length + " posts");
		} catch (err) {
			console.error("[KaTeX] Failed to render:", err);
		}
	}

	/**
	 * Инициализация
	 */
	function init() {
		// Первый рендеринг
		renderAllPosts();

		// События NodeBB для динамического контента

		// Когда загружаются новые посты (скролл, пагинация)
		window.addEventListener("action:posts.loaded", function () {
			setTimeout(function () {
				renderAllPosts();
			}, 50);
		});

		// Когда открывается тема
		window.addEventListener("action:topic.loaded", function () {
			setTimeout(function () {
				renderAllPosts();
			}, 50);
		});

		// Когда происходит навигация
		window.addEventListener("action:ajaxify.end", function () {
			setTimeout(function () {
				renderAllPosts();
			}, 100);
		});

		// Когда обновляется превью в редакторе
		window.addEventListener("action:composer.preview", async function () {
			if (hasMathContent()) {
				try {
					await loadKaTeX();
					const preview = document.querySelector(".preview-container");
					if (preview) {
						renderMath(preview);
					}
				} catch (err) {
					console.error("[KaTeX] Preview render error:", err);
				}
			}
		});
	}

	// Запуск после загрузки DOM
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
