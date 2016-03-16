"use strict";

import {getIP, getCurrency, setStatus, setRegExp} from "../../source/request";
import assert from "power-assert";
import langServer from "abl-lang/bundle/en/server";

describe("#Request", () => {
	describe("#getIP", () => {
		it("getIP with CF-Connecting-IP HTTP header", () => {
			const request = {
				headers: {
					"CF-Connecting-IP": "8.8.8.8"
				},
				get(status) {
					return this.headers[status];
				}
			};
			assert.equal(getIP(request), "8.8.8.8");
		});
		it("getIP without CF-Connecting-IP", () => {
			const request = {
				ip: "127.0.0.1",
				get() {
				}
			};
			assert.equal(getIP(request), "127.0.0.1");
		});
	});

	describe("#getCurrency", () => {
		it("getCurrency with user.payment", () => {
			const user = {
				payment: {currency: "uah"}
			};
			assert.equal(getCurrency(user), "uah");
		});
		it("getCurrency without user.payment known location", () => {
			const user = {
				location: {countryCode: "CA"}
			};
			assert.equal(getCurrency(user), "cad");
		});
		it("getCurrency without user.payment unknown", () => {
			const user = {
				location: {countryCode: "UA"}
			};
			assert.throws(() => {
				getCurrency(user);
			}, e => e.message === langServer["unrecognized-currency"]);
		});
		it("getCurrency without user.payment and user.location", () => {
			const user = {};
			assert.throws(() => {
				getCurrency(user);
			}, e => e.message === langServer["unrecognized-currency"]);
		});
	});

	describe("#setStatus", () => {
		class TestController {
			static displayName = "test2";
			static statuses = {
				active: "active"
			};
		}
		const query = {
			active: {status: "active"},
			fake: {status: "fakestatus"},
			all: {status: "all"},
			test1: {status: {}},
			test2: {status: {test: "active"}},
			test3: {status: {test: "fakestatus"}}
		};

		it("setStatus status type is String (actual)", () => {
			const clean = {};
			setStatus(clean, query.active, TestController);
			assert.deepEqual(clean, {status: "active"});
		});
		it("setStatus status type is String (default)", () => {
			const clean = {};
			setStatus(clean, query.fake, TestController);
			assert.deepEqual(clean, {status: "active"});
		});
		it("setStatus status type is String (skipped)", () => {
			const clean = {};
			setStatus(clean, query.all, TestController);
			assert.deepEqual(clean, {});
		});
		it("setStatus status type is Object (default)", () => {
			const clean = {};
			setStatus(clean, query.test1, TestController);
			assert.deepEqual(clean, {status: "active"});
		});
		it("setStatus status type is Object (actual)", () => {
			const clean = {};
			setStatus(clean, query.test2, TestController);
			assert.deepEqual(clean, {status: "active"});
		});
		it("setStatus status type is Object (fake)", () => {
			const clean = {};
			setStatus(clean, query.test3, TestController);
			assert.deepEqual(clean, {status: "active"});
		});
	});

	describe("#setRegExp", () => {
		it("setRegExp with an array of queries", () => {
			const clean = {};
			const query = {email: "trejgun@gmail.com", fakedata: "L(&*^%$#%hvutcy//\fty56ctz53@$!@#$%^&*", crap: "crap"};
			const fields = ["email", "fakedata"];
			setRegExp(clean, query, fields);
			assert.deepEqual(clean, {
				email: {$regex: "trejgun@gmail\\.com", $options: "i"},
				fakedata: {$regex: "L\\(&\\*\\^%\\$#%hvutcy//\fty56ctz53@\\$!@#\\$%\\^&\\*", $options: "i"}
			});
		});
		it("setRegExp with empty query and fields", () => {
			const clean = {};
			setRegExp(clean, {}, []);
			assert.deepEqual(clean, {});
		});
		it("setRegExp with non existing fields", () => {
			const clean = {};
			const query = {email: "trejgun@gmail.com"};
			const fields = ["name"];
			setRegExp(clean, query, fields);
			assert.deepEqual(clean, {});
		});
	});
});
