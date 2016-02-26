"use strict";

import crypto from "crypto";
import qs from "qs";


export function sign(apiSecret, urlString, timestamp) {
	return crypto.createHmac("sha256", apiSecret).update(new Buffer(timestamp + urlString, "UTF-8").toString("base64")).digest("base64");
}

export function getUrl(url, body) {
	return url + (!Object.getOwnPropertyNames(body).length ? "" : `?${qs.stringify(body, {arrayFormat: "indices"})}`);
}
