"use strict";

import assert from "power-assert";
import {sign, getUrl} from "../../source/api";

describe("#Api", () => {
	describe("#sign", () => {
		it("sign check with regexp", () => {
			const apiSecret = "supersecret000756447869";
			const urlString = "login/?a=7645789?b=654789?c=777";
			const timestamp = Date.now();
			const signTest = sign(apiSecret, urlString, timestamp);
			assert.equal(/[A-Za-z0-9+/]{43}=$/.test(signTest), true);
		});
	});

	describe("#getUrl", () => {
		const url = "login/";
		const body = {
			a: ["b", "c"],
			d: ["e", "f"]
		};

		it("getUrl return qs.stringify url", () => {
			assert.equal(getUrl(url, body), "login/?a%5B0%5D=b&a%5B1%5D=c&d%5B0%5D=e&d%5B1%5D=f");
		});
		it("getUrl with empty body", () => {
			assert.equal(getUrl(url, {}), "login/");
		});
		it("getUrl with empty url", () => {
			assert.equal(getUrl("", body), "?a%5B0%5D=b&a%5B1%5D=c&d%5B0%5D=e&d%5B1%5D=f");
		});
	});
});
