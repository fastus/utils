"use strict";

export function getAA(charges, type) {
	if (["aap", "addon"].indexOf(type) === -1) { // ChargeController.types
		throw new Error("Wrong charge type");
	}
	const obj = {};
	charges.filter(charge => charge.type === type)
		.forEach(charge => {
			if (!(charge.name in obj)) {
				obj[charge.name] = 0;
			}
			obj[charge.name]++;
		});
	return obj;
}
