"use strict";

import assert from "power-assert";
import {formatUrl} from "../../source/misc";

describe("#Misc", () => {
	describe("#formatUrl", () => {
		it("should skip omit port 80", () => {
			assert.equal(formatUrl({protocol: "https", hostname: "localhost", port: "443"}), "https://localhost:443/");
		});
		it("should skip omit port 80", () => {
			assert.equal(formatUrl({protocol: "http", hostname: "localhost", port: "80"}), "http://localhost/");
		});
	});
});
