"use strict";

import {translate} from "abl-lang";


function _makeError(text, code = 500) {
	const error = new Error();
	error.message = text;
	error.status = code;
	return error;
}

export function makeError(key, user, code = 400) {
	return _makeError(translate(key, user), code);
}
