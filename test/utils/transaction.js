"use strict";

import assert from "power-assert";
import {chargeNames} from "abl-constants/build/misc";
import {printAA} from "../../source/transaction";

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
				printAA(charges, type);
			}, e => e.message === "Wrong charge type");

		});
		it("printAA...", () => {
			const type = "aap";
			assert.deepEqual(printAA(charges, type), ["Adult x 1", "Youth x 2", "Child x 1"]);
		});
	});
});