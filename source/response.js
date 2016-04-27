"use strict";

import debug from "debug";
import {makeError} from "./error";
import {translate} from "abl-lang";


function _send(request, response) {
	return (error) => {
		response.status(error.status).send({
			status: error.status,
			errors: [].concat(error.message)
		});
	};
}

export function processValidationError(error) {
	return Object.keys(error.errors).map(key => error.errors[key].reason || error.errors[key].message);
}

export function sendError(error, request, response, next) {
	const log = debug("utils:response");
	log(error);
	void next; // eslint
	const send = _send(request, response);
	if (error.name === "ValidationError") {
		return send({
			status: 409,
			message: processValidationError(error)
		});
	}
	if (error.name === "MongoError" && error.code === 11000) {
		const key = error.message.match(/\$(\S+)/)[1];
		return send({
			status: 400,
			message: translate(`mongo.${key}`, request.user) || translate("mongo.E11000", request.user)
		});
	}
	if (!error.status) {
		if (process.env.NODE_ENV === "production") {
			return send(makeError("server.error", request.user, 500));
		} else {
			return send({
				status: 500,
				message: error.stack
			});
		}
	}
	return send(error);
}

export function wrapJSON(method) {
	return (request, response, next) => {
		method(request, response, next)
			.then(result => {
				if (result.success === false) {
					response.status(400);
				}
				response.json(result);
			})
			.catch(error => sendError(error, request, response))
			.done();
	};
}

export function wrapFile(method) {
	return (request, response, next) => {
		method(request, response, next)
			.catch(error => sendError(error, request, response))
			.done();
	};
}

export function wrapStripe(method) {
	return (request, response, next) => {
		method(request, response, next)
			.then(response.json.bind(response))
			.catch(error => {
				switch (error.type) {
					case "StripeCardError":
					case "StripeInvalidRequestError":
						Object.assign(error, {status: 400});
						return sendError(error, request, response);
					case "StripeAPIError":
					case "StripeConnectionError":
					case "StripeAuthenticationError":
					default:
						return sendError(process.env.NODE_ENV === "production" ? makeError("api.stripe-bad-request", request.user, 400) : error, request, response);
				}
			})
			.done();
	};
}
