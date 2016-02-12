"use strict";

export function printAA(charges, type) {
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
	return Object.keys(obj).map(key => key + " x " + obj[key]);
}
