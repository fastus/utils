"use strict";

import assert from "power-assert";
import {formatUrl, toDollars, tpl} from "../../source/misc";

describe("#Misc", () => {
	describe("#formatUrl", () => {
		it("should skip omit port 80", () => {
			assert.equal(formatUrl({protocol: "https", hostname: "localhost", port: "443"}), "https://localhost:443/");
		});
		it("should skip omit port 80", () => {
			assert.equal(formatUrl({protocol: "http", hostname: "localhost", port: "80"}), "http://localhost/");
		});
	});
	describe("#toDollars", () => {
		it("should format number", () => {
			assert.equal(toDollars(Math.PI * 100), "$3.14");
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
});
