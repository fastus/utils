"use strict";

import assert from "power-assert";
import {chargeArray} from "abl-constants/build/objects";
import {getAA} from "../../source/transaction";

describe("#Transaction", () => {
	describe("#printAA", () => {
		const charges = Object.keys(chargeArray).map(key => chargeArray[key]);

		it("should throw `wrong_type`", () => {
			assert.throws(() => {
				getAA(charges, "wrong_type");
			}, e => e.message === "Wrong charge type");
		});

		it("should get object", () => {
			const type = "aap";
			assert.deepEqual(getAA(charges, type), {adult: 1, youth: 1, child: 1});
		});
	});
});
