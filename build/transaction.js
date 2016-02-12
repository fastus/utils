"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.printAA = printAA;
function printAA(charges, type) {
	if (["aap", "addon"].indexOf(type) === -1) {
		// ChargeController.types
		throw new Error("Wrong charge type");
	}
	var obj = {};
	charges.filter(function (charge) {
		return charge.type === type;
	}).forEach(function (charge) {
		if (!(charge.name in obj)) {
			obj[charge.name] = 0;
		}
		obj[charge.name]++;
	});
	return Object.keys(obj).map(function (key) {
		return key + " x " + obj[key];
	});
}