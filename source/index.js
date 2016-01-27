"use strict";

import moment from "moment";
import timezone from "moment-timezone"; // eslint-disable-line no-unused-vars
import crypto from "crypto";
import escapeStringRegexp from "escape-string-regexp";
import {googleFormat} from "abl-constants/build/date";


export function isType(variable, type) {
	return Object.prototype.toString.call(variable) === "[object " + type + "]";
}

export function getEventInstanceId(eventId, time) {
	return eventId + "_" + moment.tz(time, "UTC").format(googleFormat);
}

export function getEventId(eventInstanceId) {
	return eventInstanceId.split("_")[0];
}

export function getEventDate(eventInstanceId) {
	return moment.tz(eventInstanceId.split("_")[1], googleFormat, "UTC").toDate();
}

export function countAttendees(attendees) {
	return Object.keys(attendees || {}).reduce((memo, key) => {
		return memo + attendees[key];
	}, 0);
}

export function getRandomString(length = 64, type = 3) {
	const chars = [
		"0123456789",
		"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	];
	const randomBytes = crypto.randomBytes(length);
	const result = new Array(length);
	let cursor = 0;
	for (let i = 0; i < length; i++) {
		cursor += randomBytes[i];
		result[i] = chars[type][cursor % chars[type].length];
	}
	return result.join("");
}

export function getIP(request) {
	return request.get("CF-Connecting-IP") || request.ip;
}

export function getCurrency(user) {
	if (user.payment) {
		return user.payment.currency;
	} else {
		return user.location && user.location.countryCode.toLowerCase() === "ca" ? "cad" : "usd";
	}
}

export function tpl(template, data) {
	return template.replace(/(\$\{([^\{\}]+)\})/g, ($0, $1, $2) => $2 in data ? data[$2] : "");
}

export function setStatus(clean, query, constructor) {
	const status = isType(query.status, "Object") ? query.status[constructor.name.slice(0, -10).toLowerCase()] : query.status;
	switch (status) {
		case "all":
			break;
		case "inactive":
			Object.assign(clean, {status: constructor.statuses.inactive});
			break;
		case "active":
		default:
			Object.assign(clean, {status: constructor.statuses.active});
			break;
	}
}

export function setRegExp(clean, query, fields) {
	fields.forEach(name => {
		if (query[name]) {
			Object.assign(clean, {
				name: {
					$regex: "^" + escapeStringRegexp(query[name]),
					$options: "i"
				}
			});
		}
	});
}

export function toDollars(amount) {
	return `$${(amount || 0).toFixed(2)}`;
}
