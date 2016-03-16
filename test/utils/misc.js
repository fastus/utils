"use strict";

import assert from "power-assert";
import {formatUrl, toDollars, tpl, getRandomString, isType} from "../../source/misc";

describe("#Misc", () => {
	describe("#formatUrl", () => {
		it("should format url", () => {
			assert.equal(formatUrl({protocol: "https", hostname: "localhost", port: "443"}), "https://localhost:443");
		});

		it("should omit port 80", () => {
			assert.equal(formatUrl({protocol: "http", hostname: "localhost", port: "80"}), "http://localhost");
		});
	});

	describe("#toDollars", () => {
		it("should format number", () => {
			assert.equal(toDollars(Math.PI * 100), "$3.14");
		});

		it("should format 0", () => {
			assert.equal(toDollars(), "$0.00");
		});
	});

	describe("#tpl", () => {
		it("should format string using flat object", () => {
			assert.equal(tpl("Hello ${world}!", {world: "World"}), "Hello World!");
		});

		it("should format string using nested object", () => {
			assert.equal(tpl("Hello ${obj.prop}!", {obj: {prop: "World"}}), "Hello World!");
		});
	});

	describe("#getRandomString", () => {
		const patterns = [/[0-9]/, /[A-Z]/, /[A-Z0-9]/, /[A-Z0-9]/i];
		patterns.forEach((pattern, i) => {
			it(`random string for a type ${i}`, () => {
				const length = Math.ceil((Math.random() * 100));
				const str = getRandomString(length, i);
				assert.equal(patterns[i].test(str), true);
				assert.equal(str.length, length);
			});
		});

		it("random string for default settings", () => {
			const pattern = /[A-Z0-9]/i;
			const str = getRandomString();
			assert.equal(pattern.test(str), true);
			assert.equal(str.length, 64);
		});
	});

	describe("#isType", () => {
		const variables = [new Object(), new Array, void 0, null, new Date(), "string", 1, new Error(), new RegExp()]; // eslint-disable-line no-new-object
		const types = ["Object", "Array", "Undefined", "Null", "Date", "String", "Number", "Error", "RegExp"];
		variables.forEach((variable, i) => {
			it(`check a type of ${variable}`, () => {
				const result = isType(variable, types[i]);
				assert.equal(result, true);
			});
		});
	});
});
