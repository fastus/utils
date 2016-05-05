"use strict";

import assert from "power-assert";
import {formatUrl, isType} from "../../source/misc";

describe("#Misc", () => {
	describe("#formatUrl", () => {
		it("should format url", () => {
			assert.equal(formatUrl({protocol: "https", hostname: "localhost", port: "443"}), "https://localhost:443");
		});

		it("should omit port 80", () => {
			assert.equal(formatUrl({protocol: "http", hostname: "localhost", port: "80"}), "http://localhost");
		});
	});

	describe("#isType", () => {
		const variables = [new Object(), new Array(), void 0, null, new Date(), "string", 1, new Error(), new RegExp()]; // eslint-disable-line no-new-object, no-array-constructor
		const types = ["Object", "Array", "Undefined", "Null", "Date", "String", "Number", "Error", "RegExp"];
		variables.forEach((variable, i) => {
			it(`check a type of ${variable}`, () => {
				const result = isType(variable, types[i]);
				assert.equal(result, true);
			});
		});
	});
});
