"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.makeError = makeError;
exports.checkObject = checkObject;
exports.checkUser = checkUser;
exports.checkActive = checkActive;
exports.checkPast = checkPast;

var _ablLang = require("abl-lang");

var _ablLang2 = _interopRequireDefault(_ablLang);

var _date = require("abl-constants/build/date");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _makeError(text) {
	var code = arguments.length <= 1 || arguments[1] === undefined ? 500 : arguments[1];

	var error = new Error();
	error.message = text;
	error.status = code;
	return error;
}

function getText(displayName, key, user, fallback) {
	return _ablLang2.default.translate("error/server/" + displayName + "-" + key, user) || displayName.charAt(0).toUpperCase() + displayName.slice(1) + " " + fallback;
}

function makeError(key, user) {
	var code = arguments.length <= 2 || arguments[2] === undefined ? 400 : arguments[2];

	return _makeError(_ablLang2.default.translate("error/server/" + key, user), code);
}

function checkObject(controller, user) {
	return function (model) {
		if (!model) {
			throw _makeError(getText(controller.displayName, "not-found", user, "Not Found"), 404);
		} else {
			return model;
		}
	};
}

function checkUser(controller, user) {
	return function (model) {
		if (user._id.toString() !== model.user._id.toString()) {
			throw makeError("access-denied", user, 403);
		} else {
			return model;
		}
	};
}

function checkActive() {
	var isAllowed = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
	var context = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

	return function isActiveInner(model, request) {
		var controller = context || this;
		var isAdmin = !request.user.apiKeys[0].public;
		var isActive = model.status === controller.constructor.statuses.active;
		if (!isActive && !(isAllowed && isAdmin)) {
			throw _makeError(getText(controller.displayName, "not-active", request.user, "Is Not Active"), 400);
		} else {
			return model;
		}
	};
}

function checkPast() {
	var isAllowed = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
	var field = arguments.length <= 1 || arguments[1] === undefined ? "startTime" : arguments[1];

	return function isPastInner(model, request) {
		var isAdmin = !request.user.apiKeys[0].public;
		var isPast = model[field] <= _date.date; // <= for tests
		if (isPast && !(isAllowed && isAdmin)) {
			throw makeError("event-has-passed", request.user);
		}
	};
}