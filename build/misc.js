"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isType = isType;
exports.getRandomString = getRandomString;
exports.tpl = tpl;
exports.toDollars = toDollars;

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isType(variable, type) {
	return Object.prototype.toString.call(variable) === "[object " + type + "]";
}

function getRandomString() {
	var length = arguments.length <= 0 || arguments[0] === undefined ? 64 : arguments[0];
	var type = arguments.length <= 1 || arguments[1] === undefined ? 3 : arguments[1];

	var chars = ["0123456789", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"];
	var randomBytes = _crypto2.default.randomBytes(length);
	var result = new Array(length);
	var cursor = 0;
	for (var i = 0; i < length; i++) {
		cursor += randomBytes[i];
		result[i] = chars[type][cursor % chars[type].length];
	}
	return result.join("");
}

function tpl(template, data) {
	return template.replace(/(\$\{([^\{\}]+)\})/g, function ($0, $1, $2) {
		return $2 in data ? data[$2] : "";
	});
}

function toDollars(amount) {
	return "$" + (amount && amount / 100 || 0).toFixed(2);
}