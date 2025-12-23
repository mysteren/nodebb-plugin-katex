#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function copyDir(src, dest) {
	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest, { recursive: true });
	}

	const entries = fs.readdirSync(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			copyDir(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

function findKatexDist() {
	const pluginRoot = path.resolve(__dirname, "..");

	// Все возможные пути поиска
	const searchPaths = [
		// 1. Локальный node_modules плагина
		path.join(pluginRoot, "node_modules", "katex", "dist"),
		// 2. Hoisted в NodeBB (2 уровня вверх)
		path.join(pluginRoot, "..", "..", "node_modules", "katex", "dist"),
		// 3. Hoisted выше (3 уровня)
		path.join(pluginRoot, "..", "..", "..", "node_modules", "katex", "dist"),
		// 4. В соседней папке (параллельно плагину)
		path.join(pluginRoot, "..", "katex", "dist"),
	];

	console.log("[KaTeX] Searching for katex dist...");
	for (const searchPath of searchPaths) {
		console.log("  Checking:", searchPath);
		if (fs.existsSync(searchPath)) {
			console.log("[KaTeX] ✓ Found at:", searchPath);
			return searchPath;
		}
	}

	return null;
}

try {
	console.log("[KaTeX Plugin] Running postinstall...");

	const pluginRoot = path.resolve(__dirname, "..");
	const katexDest = path.join(pluginRoot, "static", "katex");

	// Ищем KaTeX
	const katexSource = findKatexDist();

	if (!katexSource) {
		console.warn("[KaTeX] WARNING: katex not found!");
		console.warn("[KaTeX] This is normal during initial npm install.");
		console.warn(
			"[KaTeX] Run 'npm rebuild nodebb-plugin-katex2' after installation completes.",
		);
		// Не блокируем установку
		process.exit(0);
	}

	// Удаляем старую директорию
	if (fs.existsSync(katexDest)) {
		console.log("[KaTeX] Removing old directory...");
		fs.rmSync(katexDest, { recursive: true, force: true });
	}

	// Копируем файлы
	console.log("[KaTeX] Copying files...");
	console.log("[KaTeX]   From:", katexSource);
	console.log("[KaTeX]   To:", katexDest);

	copyDir(katexSource, katexDest);

	console.log("[KaTeX] ✓ Postinstall completed!");
} catch (err) {
	console.error("[KaTeX] ✗ Postinstall failed:", err.message);
	// Не блокируем установку
	process.exit(0);
}
