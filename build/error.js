"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.makeError = makeError;
exports.checkModel = checkModel;
exports.checkUser = checkUser;
exports.checkActive = checkActive;
exports.checkPast = checkPast;

var _ablLang = require("abl-lang");

var _date = require("abl-constants/build/date");

function _makeError(text) {
	var code = arguments.length <= 1 || arguments[1] === undefined ? 500 : arguments[1];

	var error = new Error();
	error.message = text;
	error.status = code;
	return error;
}

function getText(displayName, key, user, fallback) {
	return (0, _ablLang.translate)("error.server." + displayName + "-" + key, user) || displayName.charAt(0).toUpperCase() + displayName.slice(1) + " " + fallback;
}

function makeError(key, user) {
	var code = arguments.length <= 2 || arguments[2] === undefined ? 400 : arguments[2];

	return _makeError((0, _ablLang.translate)("error.server." + key, user), code);
}

function checkModel(user) {
	return function checkModelInner(model) {
		if (!model) {
			throw _makeError(getText(this.displayName, "not-found", user, "Not Found"), 404);
		} else {
			return model;
		}
	};
}

function checkUser(user) {
	return function checkOperatorInner(model) {
		if (user._id.toString() !== model[this.constructor.realm]._id.toString()) {
			throw makeError("access-denied", user, 403);
		} else {
			return model;
		}
	};
}

function checkActive() {
	var isAllowed = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

	return function checkActiveInner(model, request) {
		var isAdmin = !request.user.apiKeys[0].public;
		var isActive = model.status === this.constructor.statuses.active;
		if (!isActive && !(isAllowed && isAdmin)) {
			throw _makeError(getText(this.displayName, "not-active", request.user, "Is Not Active"), 400);
		} else {
			return model;
		}
	};
}

function checkPast() {
	var isAllowed = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
	var field = arguments.length <= 1 || arguments[1] === undefined ? "startTime" : arguments[1];

	return function checkPastInner(model, request) {
		var isAdmin = !request.user.apiKeys[0].public;
		var isPast = model[field] <= _date.date; // <= for tests
		if (isPast && !(isAllowed && isAdmin)) {
			throw makeError("event-has-passed", request.user);
		}
	};
}