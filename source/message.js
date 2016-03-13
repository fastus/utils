"use strict";

import {merge} from "lodash";
import {dateFormat, timeFormat} from "abl-constants/build/date";
import {toDollars, formatUrl} from "./misc";
import {printAA} from "./transaction";
import moment from "moment-config-trejgun";
import {RRule} from "rrule";

import configs from "./configs/config";

const config = configs[process.env.NODE_ENV];
const dateTimeFormat = `${dateFormat} ${timeFormat}`;

function prepareActivity(activity) {
	return {
		activity: {
			title: activity.title,
			description: activity.description,
			requirements: (activity.requirements.length ? activity.requirements : ["N/A"]).map(item => `- ${item}`).join("\n"),
			whatToBring: (activity.whatToBring.length ? activity.whatToBring : ["N/A"]).map(item => `- ${item}`).join("\n"),
			included: (activity.whatIncluded.length ? activity.whatIncluded : ["N/A"]).map(item => `- ${item}`).join("\n"),
			location: activity.location ? `[${activity.location.streetAddress}](https://www.google.com/maps/place/${activity.location.streetAddress.replace(/\s/g, "+")})` : ""
		}
	};
}

function prepareEvent(event) {
	const startTime = moment(event.startTime).tz(event.timeZone);
	const endTime = moment(event.endTime).tz(event.timeZone);
	const originalStartTime = moment(event.originalStartTime).tz(event.timeZone);
	const originalEndTime = moment(event.originalEndTime).tz(event.timeZone);

	return {
		event: {
			title: event.title,
			eventInstanceId: event.eventInstanceId,
			startTime: startTime.format(timeFormat),
			startDate: startTime.format(dateFormat),
			startDateTime: startTime.format(dateTimeFormat),
			endTime: endTime.format(timeFormat),
			endDate: endTime.format(dateFormat),
			endDateTime: endTime.format(dateTimeFormat),
			endDateTimeOrTime: endTime.format(startTime.diff(endTime, "d") ? dateTimeFormat : timeFormat),
			originalStartDateTime: originalStartTime.format(dateTimeFormat),
			originalEndDateTime: originalEndTime.format(dateTimeFormat)
		}
	};
}

function prepareTimeSlot(timeslot) {
	return {
		event: {
			rrule: new RRule({
				freq: RRule.WEEKLY,
				byweekday: timeslot.daysRunning.map(day => ({getJsWeekday: () => day})),
				dtstart: moment.tz(timeslot.startTime, timeslot.timeZone).toDate(),
				until: moment.tz(timeslot.untilTime, timeslot.timeZone).toDate()
			}).toText()
		}
	};
}

function prepareBooking(booking, operator) {
	return {
		booking: {
			id: booking.bookingId,
			notes: booking.notes || "N/A",
			date: moment(booking.created).format(dateTimeFormat),
			answers: operator.preferences.features.questions ? booking.answers.map(answer => `**${answer.questionText}**\n ${answer.answerText}`).join("\n\n") : ""
		}
	};
}

function prepareTransaction(transaction) {
	const charges = {};
	const amounts = {};

	["aap", "addon", "coupon", "discount", "fee", "tax"].forEach(type => { // charge types
		charges[type] = transaction.charges.filter(payment => payment.type === type);
		amounts[type] = charges[type].reduce((memo, payment) => memo + payment.amount, 0);
	});

	return {
		booking: {
			attendees: printAA(charges.aap, "aap").join("\n\n"),
			addons: printAA(charges.addon, "addon").join("\n\n"),
			count: charges.aap.length
		},
		transaction: {
			subtotal: toDollars(amounts.aap + amounts.addon),
			total: toDollars(amounts.aap + amounts.addon + amounts.tax + amounts.fee + amounts.coupon + amounts.discount),
			tax: toDollars(amounts.tax),
			fee: toDollars(amounts.fee),
			coupon: charges.coupon.length ? `Coupon: (${toDollars(amounts.coupon)}) ${charges.coupon[0].name}\n` : ""
		}
	};
}

function prepareCustomer(customer) {
	return {
		customer: {
			name: customer.fullName,
			email: customer.email,
			phone: customer.phoneNumber,
			location: customer.location ? `[${customer.location.streetAddress}](https://www.google.com/maps/place/${customer.location.streetAddress.replace(/\s/g, "+")})` : ""
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
			location: operator.location ? `[${operator.location.streetAddress}](https://www.google.com/maps/place/${operator.location.streetAddress.replace(/\s/g, "+")})` : ""
		}
	};
}

function wrapper(operator) {
	return (fn, model) => {
		if (!model) {
			return {};
		}
		return fn(model, operator);
	};
}

export function prepare(data) {
	const wrap = wrapper(data.operator);
	return merge(
		{url: formatUrl(config.server)},
		wrap(prepareActivity, data.activity || data.timeslot && data.timeslot.activity),
		wrap(prepareEvent, data.event || data.timeslot),
		wrap(prepareTimeSlot, data.timeslot),
		wrap(prepareBooking, data.booking),
		wrap(prepareTransaction, data.transaction || data.booking && data.booking.transaction),
		wrap(prepareCustomer, data.customer || data.booking && data.booking.customer),
		wrap(prepareHash, data.hash),
		wrap(prepareOperator, data.operator)
	);
}
