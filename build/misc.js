"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getType = getType;
exports.isType = isType;
exports.getRandomString = getRandomString;
exports.tpl = tpl;
exports.toDollars = toDollars;
exports.formatUrl = formatUrl;

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _ablLang = require("abl-lang");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getType(variable) {
	return Object.prototype.toString.call(variable);
}

function isType(variable, type) {
	return getType(variable) === "[object " + type + "]";
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
		return (0, _ablLang.getObject)($2, data);
	});
}

function toDollars(amount) {
	return "$" + (amount && amount / 100 || 0).toFixed(2);
}

function formatUrl(_ref) {
	var protocol = _ref.protocol;
	var hostname = _ref.hostname;
	var port = _ref.port;

	// url.format puts port 80 which we dont need
	return protocol + "://" + hostname + (port === "80" ? "" : ":" + port) + "/";
}