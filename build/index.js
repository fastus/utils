"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isType = isType;
exports.getType = getType;
exports.getEventInstanceId = getEventInstanceId;
exports.getEventId = getEventId;
exports.getEventDate = getEventDate;
exports.countAttendees = countAttendees;
exports.getRandomString = getRandomString;
exports.getIP = getIP;
exports.getCurrency = getCurrency;
exports.tpl = tpl;
exports.setStatus = setStatus;
exports.setRegExp = setRegExp;
exports.toDollars = toDollars;

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _momentTimezone = require("moment-timezone");

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _escapeStringRegexp = require("escape-string-regexp");

var _escapeStringRegexp2 = _interopRequireDefault(_escapeStringRegexp);

var _date = require("abl-constants/build/date");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isType(variable, type) {
	return Object.prototype.toString.call(variable) === "[object " + type + "]";
} // eslint-disable-line no-unused-vars

function getType(variable) {
	return Object.prototype.toString.call(variable).match(/\s([^\]]+)/)[1];
}

function getEventInstanceId(eventId, time) {
	return eventId + "_" + _moment2.default.tz(time, "UTC").format(_date.googleFormat);
}

function getEventId(eventInstanceId) {
	return eventInstanceId.split("_")[0];
}

function getEventDate(eventInstanceId) {
	return _moment2.default.tz(eventInstanceId.split("_")[1], _date.googleFormat, "UTC").toDate();
}

function countAttendees(attendees) {
	return Object.keys(attendees || {}).reduce(function (memo, key) {
		return memo + attendees[key];
	}, 0);
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

function getIP(request) {
	return request.get("CF-Connecting-IP") || request.ip;
}

function getCurrency(user) {
	if (user.payment) {
		return user.payment.currency;
	} else {
		return user.location && user.location.countryCode.toLowerCase() === "ca" ? "cad" : "usd";
	}
}

function tpl(template, data) {
	return template.replace(/(\$\{([^\{\}]+)\})/g, function ($0, $1, $2) {
		return $2 in data ? data[$2] : "";
	});
}

function setStatus(clean, query, constructor) {
	var status = isType(query.status, "Object") ? query.status[constructor.name.slice(0, -10).toLowerCase()] : query.status;
	switch (status) {
		case "all":
			break;
		case "inactive":
			Object.assign(clean, { status: constructor.statuses.inactive });
			break;
		case "active":
		default:
			Object.assign(clean, { status: constructor.statuses.active });
			break;
	}
}

function setRegExp(clean, query, fields) {
	fields.forEach(function (name) {
		if (query[name]) {
			Object.assign(clean, {
				name: {
					$regex: "^" + (0, _escapeStringRegexp2.default)(query[name]),
					$options: "i"
				}
			});
		}
	});
}

function toDollars(amount) {
	return "$" + (amount || 0).toFixed(2);
}