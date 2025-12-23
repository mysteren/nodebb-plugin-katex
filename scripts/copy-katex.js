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

	// Вариант 1: Локальный node_modules плагина
	const localPath = path.join(pluginRoot, "node_modules", "katex", "dist");
	if (fs.existsSync(localPath)) {
		console.log("[KaTeX] Found in local node_modules");
		return localPath;
	}

	// Вариант 2: Hoisted в корень NodeBB (../../node_modules/katex)
	const hoistedPath = path.join(
		pluginRoot,
		"..",
		"..",
		"node_modules",
		"katex",
		"dist",
	);
	if (fs.existsSync(hoistedPath)) {
		console.log("[KaTeX] Found in hoisted node_modules");
		return hoistedPath;
	}

	return null;
}

try {
	console.log("[KaTeX Plugin] Running postinstall...");

	const pluginRoot = path.resolve(__dirname, "..");
	const katexSource = findKatexDist();
	const katexDest = path.join(pluginRoot, "static", "katex");

	if (!katexSource) {
		console.error("[KaTeX] ERROR: katex not found!");
		process.exit(1);
	}

	if (fs.existsSync(katexDest)) {
		fs.rmSync(katexDest, { recursive: true, force: true });
	}

	console.log("[KaTeX] Copying from:", katexSource);
	console.log("[KaTeX] Copying to:", katexDest);

	copyDir(katexSource, katexDest);

	console.log("[KaTeX] Postinstall completed!");
} catch (err) {
	console.error("[KaTeX] Postinstall failed:", err);
	process.exit(1);
}
