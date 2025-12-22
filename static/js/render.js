/**
 * KaTeX Client-side Renderer
 * Loads KaTeX CSS and renders expressions in the DOM
 */

(function () {
	"use strict";

	const KATEX_VERSION = "0.16.27";
	const CDN_BASE = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist`;
	const CSS_URL = `${CDN_BASE}/katex.min.css`;
	const JS_URL = `${CDN_BASE}/katex.min.js`;

	/**
	 * Load stylesheet from CDN
	 */
	function loadStylesheet() {
		if (document.querySelector(`link[href="${CSS_URL}"]`)) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = CSS_URL;
			link.onload = resolve;
			link.onerror = reject;
			document.head.appendChild(link);
		});
	}

	/**
	 * Load KaTeX library from CDN
	 */
	function loadKaTeX() {
		if (window.katex) {
			return Promise.resolve(window.katex);
		}

		return new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src = JS_URL;
			script.onload = () => resolve(window.katex);
			script.onerror = reject;
			document.head.appendChild(script);
		});
	}

	/**
	 * Render KaTeX expressions in the page
	 */
	async function renderExpressions() {
		try {
			// Load resources if needed
			await loadStylesheet();

			// Check if expressions exist before loading KaTeX
			const hasExpressions =
				document.querySelector(".katex-display") ||
				document.querySelector(".katex-inline");

			if (!hasExpressions) {
				return;
			}

			const katex = await loadKaTeX();

			// Re-render any dynamic expressions if needed
			const expressions = document.querySelectorAll("[data-katex]");
			expressions.forEach((el) => {
				try {
					const expression = el.dataset.katex;
					const displayMode = el.classList.contains("katex-display");
					const rendered = katex.renderToString(expression, {
						displayMode,
						throwOnError: false,
						trust: true,
					});
					el.innerHTML = rendered;
				} catch (err) {
					console.warn("KaTeX render error:", err.message);
				}
			});
		} catch (err) {
			console.error("KaTeX initialization error:", err);
		}
	}

	/**
	 * Initialize on page load
	 */
	function init() {
		// Load resources immediately
		loadStylesheet().catch(console.error);

		// Render on DOM ready
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", renderExpressions);
		} else {
			renderExpressions();
		}

		// Support for dynamic content (AJAX posts)
		if (window.$) {
			$(document).on("ready pjax:end ajaxStop", renderExpressions);
		}
	}

	// Start when script loads
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
