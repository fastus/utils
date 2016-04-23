"use strict";

import configs from "./configs/config";


export function getType(variable) {
	return Object.prototype.toString.call(variable);
}

export function isType(variable, type) {
	return getType(variable) === `[object ${type}]`;
}

export function formatUrl({protocol, hostname, port}) {
	// url.format puts port 80 which we don't need
	return `${protocol}://${hostname}${port === "80" ? "" : `:${port}`}`;
}

export function getServerUrl(env = process.env.NODE_ENV) {
	return formatUrl(configs[env].server);
}

export function getIP(request) {
	return request.get("CF-Connecting-IP") || request.ip;
}
