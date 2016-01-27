"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getIP = getIP;
exports.getCurrency = getCurrency;
exports.setStatus = setStatus;
exports.setRegExp = setRegExp;

var _momentTimezone = require("moment-timezone");

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

var _escapeStringRegexp = require("escape-string-regexp");

var _escapeStringRegexp2 = _interopRequireDefault(_escapeStringRegexp);

var _misc = require("./misc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-line no-unused-vars
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

function setStatus(clean, query, constructor) {
	var status = (0, _misc.isType)(query.status, "Object") ? query.status[constructor.name.slice(0, -10).toLowerCase()] : query.status;
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