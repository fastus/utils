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
