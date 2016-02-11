"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.sign = sign;
exports.getUrl = getUrl;

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _qs = require("qs");

var _qs2 = _interopRequireDefault(_qs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sign(apiSecret, urlString, timestamp) {
	return _crypto2.default.createHmac("sha256", apiSecret).update(new Buffer(timestamp + urlString, "UTF-8").toString("base64")).digest("base64");
}

function getUrl(url, body) {
	return url + (!Object.getOwnPropertyNames(body).length ? "" : "?" + _qs2.default.stringify(body, { arrayFormat: "indices" }));
}