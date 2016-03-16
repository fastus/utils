"use strict";

import escapeStringRegexp from "escape-string-regexp";
import {isType} from "./misc";
import {makeError} from "./error";


export function getIP(request) {
	return request.get("CF-Connecting-IP") || request.ip;
}

export function getCurrency(user) {
	if (user.payment) {
		return user.payment.currency;
	} else if (user.location && user.location && user.location.countryCode && ["ca", "us"].includes(user.location.countryCode.toLowerCase())) {
		return `${user.location.countryCode.toLowerCase()}d`;
	} else {
		throw makeError("server.unrecognized-currency", user);
	}
}

export function setStatus(clean, query, constructor) {
	const status = isType(query.status, "Object") ? query.status[constructor.name.slice(0, -10).toLowerCase()] : query.status;
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
