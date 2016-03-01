"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

exports.default = _defineProperty({}, process.env.NODE_ENV, {
	server: {
		protocol: process.env.ABL_SERVER_PROTOCOL,
		hostname: process.env.ABL_SERVER_HOSTNAME,
		port: process.env.ABL_SERVER_PORT
	}
});