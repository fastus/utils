"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getEventInstanceId = getEventInstanceId;
exports.getEventId = getEventId;
exports.getEventDate = getEventDate;

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _momentTimezone = require("moment-timezone");

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

var _date = require("abl-constants/build/date");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getEventInstanceId(eventId, time) {
	return eventId + "_" + _moment2.default.tz(time, "UTC").format(_date.googleFormat);
} // eslint-disable-line no-unused-vars

function getEventId(eventInstanceId) {
	return eventInstanceId.split("_")[0];
}

function getEventDate(eventInstanceId) {
	return _moment2.default.tz(eventInstanceId.split("_")[1], _date.googleFormat, "UTC").toDate();
}