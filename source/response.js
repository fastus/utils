"use strict";

import debug from "debug";
import querystring from "querystring";
import {formatUrl} from "./misc";
import {makeError} from "./error";
import {translate} from "abl-lang";
import configs from "./configs/config";

const config = configs[process.env.NODE_ENV];

const log = debug("utils:response");

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
	log("sendError", error);
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
	if (error.type === "StripeCardError" || error.type === "StripeInvalidRequest") {
		return send({
			status: 400,
			message: error.message
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

export function addPaginationHeaders(request, response, count) {
	const last = Math.ceil(count / request.query.pageSize);
	const url = `${formatUrl(config.server)}${request.route.path}?`;

	response.set("X-First-Page-Url", url + querystring.stringify({
			pageSize: request.query.pageSize,
			page: 0
		}));

	if (request.query.page !== 0) {
		response.set("X-Prev-Page-Url", url + querystring.stringify({
				pageSize: request.query.pageSize,
				page: request.query.page - 1
			}));
	}

	if (request.query.page !== last) {
		response.set("X-Next-Page-Url", url + querystring.stringify({
				pageSize: request.query.pageSize,
				page: request.query.page + 1
			}));
	}

	response.set("X-Last-Page-Url", url + querystring.stringify({
			pageSize: request.query.pageSize,
			page: last
		}));
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
			.catch(error => {
				log(error);
				return sendError(error, request, response);
			})
			.done();
	};
}

export function wrapFile(method) {
	return (request, response, next) => {
		method(request, response, next)
			.then(result => {
				log("result", result);
			})
			.catch(error => {
				log(error);
				return sendError(error, request, response);
			})
			.done();
	};
}

export function wrapStripe(method) {
	return (request, response, next) => {
		method(request, response, next)
			.then(response.json.bind(response))
			.catch(error => {
				log(error);
				switch (error.type) {
					case "StripeCardError":
					case "StripeInvalidRequestError":
						Object.assign(error, {status: 400});
						return sendError(error, request, response);
					case "StripeAPIError":
					case "StripeConnectionError":
					case "StripeAuthenticationError":
					default:
						if (process.env.NODE_ENV === "production") {
							sendError(makeError("stripe-bad-request", request.user, 400), request, response);
						}
						return sendError(error, request, response);
				}
			})
			.done();
	};
}
