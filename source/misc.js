"use strict";

import crypto from "crypto";
import {getObject} from "abl-lang/build/index";

export function getType(variable) {
	return Object.prototype.toString.call(variable);
}

export function isType(variable, type) {
	return getType(variable) === `[object ${type}]`;
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

export function getRandomElementFromArray(array = []) {
	return array[Math.floor(Math.random() * array.length)];
}

export function tpl(template, data) {
	return template.replace(/(\$\{([^\{\}]+)\})/g, ($0, $1, $2) => getObject($2, data));
}

export function toDollars(amount) {
	return `$${(amount && amount / 100 || 0).toFixed(2)}`;
}


export function formatUrl({protocol, hostname, port}) {
	// url.format puts port 80 which we dont need
	return `${protocol}://${hostname}${port === "80" ? "" : `:${port}`}`;
}
