"use strict";

import assert from "power-assert";
import {chargeNames} from "abl-constants/build/misc";
import {getAA} from "../../source/transaction";

describe("#Transaction", () => {
	describe("#printAA", () => {
		const charges = [
			{type: "aap", name: chargeNames.aap.adult},
			{type: "aap", name: chargeNames.aap.youth},
			{type: "aap", name: chargeNames.aap.youth},
			{type: "aap", name: chargeNames.aap.child},
			{type: "fake_type", name: "pen"}
		];

		it("printAA with wrong type", () => {
			const type = "wrong_type";
			assert.throws(() => {
				getAA(charges, type);
			}, e => e.message === "Wrong charge type");
		});

		it("printAA...", () => {
			const type = "aap";
			assert.deepEqual(getAA(charges, type), {Adult: 1, Youth: 2, Child: 1});
		});
	});
});
