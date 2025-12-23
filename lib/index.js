/**
 * Серверная часть плагина
 * Минимальная логика - вся работа на клиенте
 */

"use strict";

/**
 * Инициализация плагина при загрузке приложения
 */
function init(_params, callback) {
	console.log("[KaTeX] Plugin initialized");
	callback();
}

module.exports = {
	init,
};
