"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.prepare = prepare;

var _lodash = require("lodash");

var _date = require("abl-constants/build/date");

var _misc = require("./misc");

var _transaction = require("./transaction");

var _moment = require("abl-constants/build/moment");

var _moment2 = _interopRequireDefault(_moment);

var _rrule = require("rrule");

var _config = require("./configs/config");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = _config2.default[process.env.NODE_ENV];
var dateTimeFormat = _date.dateFormat + " " + _date.timeFormat;

function prepareActivity(activity) {
	return {
		activity: {
			title: activity.title,
			description: activity.description,
			requirements: (activity.requirements.length ? activity.requirements : ["N/A"]).map(function (item) {
				return "- " + item;
			}).join("\n"),
			whatToBring: (activity.whatToBring.length ? activity.whatToBring : ["N/A"]).map(function (item) {
				return "- " + item;
			}).join("\n"),
			included: (activity.whatIncluded.length ? activity.whatIncluded : ["N/A"]).map(function (item) {
				return "- " + item;
			}).join("\n"),
			location: activity.location ? "[" + activity.location.streetAddress + "](https://www.google.com/maps/place/" + activity.location.streetAddress.replace(/\s/g, "+") + ")" : ""
		}
	};
}

function prepareEvent(event) {
	var startTime = (0, _moment2.default)(event.startTime).tz(event.timeZone);
	var endTime = (0, _moment2.default)(event.endTime).tz(event.timeZone);
	var originalStartTime = (0, _moment2.default)(event.originalStartTime).tz(event.timeZone);
	var originalEndTime = (0, _moment2.default)(event.originalEndTime).tz(event.timeZone);

	return {
		event: {
			title: event.title,
			eventInstanceId: event.eventInstanceId,
			startTime: startTime.format(_date.timeFormat),
			startDate: startTime.format(_date.dateFormat),
			startDateTime: startTime.format(dateTimeFormat),
			endTime: endTime.format(_date.timeFormat),
			endDate: endTime.format(_date.dateFormat),
			endDateTime: endTime.format(dateTimeFormat),
			endDateTimeOrTime: endTime.format(startTime.diff(endTime, "d") ? dateTimeFormat : _date.timeFormat),
			originalStartDateTime: originalStartTime.format(dateTimeFormat),
			originalEndDateTime: originalEndTime.format(dateTimeFormat)
		}
	};
}

function prepareTimeSlot(timeslot) {
	return {
		event: {
			rrule: new _rrule.RRule({
				freq: _rrule.RRule.WEEKLY,
				byweekday: timeslot.daysRunning.map(function (day) {
					return { getJsWeekday: function getJsWeekday() {
							return day;
						} };
				}),
				dtstart: _moment2.default.tz(timeslot.startTime, timeslot.timeZone).toDate(),
				until: _moment2.default.tz(timeslot.untilTime, timeslot.timeZone).toDate()
			}).toText()
		}
	};
}

function prepareBooking(booking, operator) {
	return {
		booking: {
			id: booking.bookingId,
			notes: booking.notes || "N/A",
			date: (0, _moment2.default)(booking.created).format(dateTimeFormat),
			answers: operator.preferences.features.questions ? booking.answers.map(function (answer) {
				return "**" + answer.questionText + "**\n " + answer.answerText;
			}).join("\n\n") : ""
		}
	};
}

function prepareTransaction(transaction) {
	var charges = {};
	var amounts = {};

	["aap", "addon", "coupon", "discount", "fee", "tax"].forEach(function (type) {
		// charge types
		charges[type] = transaction.charges.filter(function (payment) {
			return payment.type === type;
		});
		amounts[type] = charges[type].reduce(function (memo, payment) {
			return memo + payment.amount;
		}, 0);
	});

	return {
		booking: {
			attendees: (0, _transaction.printAA)(charges.aap, "aap").join("\n\n"),
			addons: (0, _transaction.printAA)(charges.addon, "addon").join("\n\n"),
			count: charges.aap.length
		},
		transaction: {
			subtotal: (0, _misc.toDollars)(amounts.aap + amounts.addon),
			total: (0, _misc.toDollars)(amounts.aap + amounts.addon + amounts.tax + amounts.fee + amounts.coupon + amounts.discount),
			tax: (0, _misc.toDollars)(amounts.tax),
			fee: (0, _misc.toDollars)(amounts.fee),
			coupon: charges.coupon.length ? "Coupon: (" + (0, _misc.toDollars)(amounts.coupon) + ") " + charges.coupon[0].name + "\n" : ""
		}
	};
}

function prepareCustomer(customer) {
	return {
		customer: {
			name: customer.fullName,
			email: customer.email,
			phone: customer.phoneNumber,
			location: customer.location ? "[" + customer.location.streetAddress + "](https://www.google.com/maps/place/" + customer.location.streetAddress.replace(/\s/g, "+") + ")" : ""
		}
	};
}

function prepareHash(hash) {
	return {
		hash: {
			token: hash.token
		}
	};
}

function prepareOperator(operator) {
	return {
		operator: {
			customFields: JSON.parse(JSON.stringify(operator.preferences.customFields)), // TODO strange bug
			name: operator.fullName,
			email: operator.email,
			phoneNumber: operator.phoneNumber,
			companyName: operator.companyName,
			location: operator.location ? "[" + operator.location.streetAddress + "](https://www.google.com/maps/place/" + operator.location.streetAddress.replace(/\s/g, "+") + ")" : ""
		}
	};
}

function wrapper(operator) {
	return function (fn, model) {
		if (!model) {
			return {};
		}
		return fn(model, operator);
	};
}

function prepare(data) {
	var wrap = wrapper(data.operator);
	return (0, _lodash.merge)({ url: (0, _misc.formatUrl)(config.server) }, wrap(prepareActivity, data.activity || data.timeslot && data.timeslot.activity), wrap(prepareEvent, data.event || data.timeslot), wrap(prepareTimeSlot, data.timeslot), wrap(prepareBooking, data.booking), wrap(prepareTransaction, data.transaction || data.booking && data.booking.transaction), wrap(prepareCustomer, data.customer || data.booking && data.booking.customer), wrap(prepareHash, data.hash), wrap(prepareOperator, data.operator));
}