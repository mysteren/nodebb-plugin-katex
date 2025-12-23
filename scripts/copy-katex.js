const fs = require("fs");
const path = require("path");

const sourceDir = path.join(__dirname, "../node_modules/katex/dist");
const targetDir = path.join(__dirname, "../static/katex");

// Создаем целевую директорию если её нет
if (!fs.existsSync(targetDir)) {
	fs.mkdirSync(targetDir, { recursive: true });
}

// Копируем файлы
function copyRecursive(src, dest) {
	if (fs.statSync(src).isDirectory()) {
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest, { recursive: true });
		}
		fs.readdirSync(src).forEach((file) => {
			copyRecursive(path.join(src, file), path.join(dest, file));
		});
	} else {
		fs.copyFileSync(src, dest);
	}
}

copyRecursive(sourceDir, targetDir);
console.log("KaTeX files copied successfully");
