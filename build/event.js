"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getEventInstanceId = getEventInstanceId;
exports.getEventId = getEventId;
exports.getEventDate = getEventDate;
exports.parseDate = parseDate;

var _moment = require("abl-constants/build/moment");

var _moment2 = _interopRequireDefault(_moment);

var _date = require("abl-constants/build/date");

var _misc = require("./misc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getEventInstanceId(eventId, time) {
	return eventId + "_" + _moment2.default.tz(time, "UTC").format(_date.googleFormat);
}

function getEventId(eventInstanceId) {
	return eventInstanceId.split("_")[0];
}

function getEventDate(eventInstanceId) {
	return _moment2.default.tz(eventInstanceId.split("_")[1], _date.googleFormat, "UTC").toDate();
}

function parseDate(date) {
	switch (true) {
		case (0, _misc.isType)(date, "Number"):
		case (0, _misc.isType)(date, "Date"):
			return (0, _moment2.default)(date);
		case (0, _misc.isType)(date, "String"):
			return _moment2.default.tz(date, _date.ISO_8601, "UTC");
		default:
			return (0, _moment2.default)(null);
	}
}