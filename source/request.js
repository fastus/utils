"use strict";

import timezone from "moment-timezone"; // eslint-disable-line no-unused-vars
import escapeStringRegexp from "escape-string-regexp";
import {isType} from "./misc";


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

export function setStatus(clean, query, constructor) {
	const status = isType(query.status, "Object") ? query.status[constructor.displayName.toLowerCase()] : query.status;
	if (status !== "all") {
		Object.assign(clean, {status: constructor.statuses[status in constructor.statuses ? status : "active"]});
	}
}

export function setRegExp(clean, query, fields) {
	fields.forEach(name => {
		if (query[name]) {
			Object.assign(clean, {
				[name]: {
					$regex: escapeStringRegexp(query[name]),
					$options: "i"
				}
			});
		}
	});
}
