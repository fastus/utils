"use strict";

import {makeError} from "./error";
import {date} from "abl-constants/build/date";


export function checkModel(user) {
	return function checkModelInner(model) {
		if (!model) {
			throw makeError(`not-found.${this.constructor.displayName.toLowerCase()}`, user, 404);
		} else {
			return model;
		}
	};
}

export function checkUser(user, condition = false) {
	return function checkUserInner(model) {
		if (user._id.toString() === model[this.constructor.realm]._id.toString() === condition) {
			throw makeError("server.access-denied", user, 403);
		} else {
			return model;
		}
	};
}

export function checkOwner(user, condition = false) {
	return function checkOwnerInner(model) {
		if (user._id.toString() === model.owner.toString() === condition) {
			throw makeError("server.access-denied", user, 403);
		} else {
			return model;
		}
	};
}

export function checkDefault(defaultContract) {
	return function checkDefaultInner(model, request) {
		const isDefault = request.params._id.toString() === defaultContract._id.toString();
		if (isDefault && !request.body.default) {
			throw makeError("controller.contract-must-have-default-contract", 400);
		} else {
			return model;
		}
	};
}

export function checkActive(isAllowed = false) {
	return function checkActiveInner(model, request) {
		const isAdmin = !request.user.apiKeys[0].public;
		const isActive = model.status === this.constructor.statuses.active;
		if (!isActive && !(isAllowed && isAdmin)) {
			throw makeError(`not-active.${this.constructor.displayName.toLowerCase()}`, request.user, 400);
		} else {
			return model;
		}
	};
}

export function checkPast(isAllowed = false, field = "startTime") {
	return function checkPastInner(model, request) {
		const isAdmin = !request.user.apiKeys[0].public;
		const isPast = model[field] <= date; // <= for tests
		if (isPast && !(isAllowed && isAdmin)) {
			throw makeError("controller.event-has-passed", request.user);
		}
	};
}
