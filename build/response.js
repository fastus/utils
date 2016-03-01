"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.sendError = sendError;
exports.addPaginationHeaders = addPaginationHeaders;
exports.wrapJSON = wrapJSON;
exports.wrapFile = wrapFile;
exports.wrapStripe = wrapStripe;

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

var _querystring = require("querystring");

var _querystring2 = _interopRequireDefault(_querystring);

var _misc = require("./misc");

var _error = require("./error");

var _ablLang = require("abl-lang");

var _config = require("./configs/config");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = _config2.default[process.env.NODE_ENV];

var log = (0, _debug2.default)("utils:response");

function _send(request, response) {
	return function (error) {
		response.status(error.status).send({
			status: error.status,
			errors: [].concat(error.message)
		});
	};
}

function sendError(error, request, response, next) {
	log("sendError", error);
	void next; // eslint
	var send = _send(request, response);
	if (error.name === "ValidationError") {
		return send({
			status: 409,
			message: Object.keys(error.errors).map(function (key) {
				return error.errors[key].message;
			})
		});
	}
	if (error.name === "MongoError" && error.code === 11000) {
		var key = error.message.match(/\$(\S+)/)[1];
		return send({
			status: 400,
			message: (0, _ablLang.translate)("error.mongo." + key, request.user) || (0, _ablLang.translate)("error.mongo.E11000", request.user)
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
			return send((0, _error.makeError)("server-error", request.user, 500));
		} else {
			return send({
				status: 500,
				message: error.stack
			});
		}
	}
	return send(error);
}

function addPaginationHeaders(request, response, count) {
	var last = Math.ceil(count / request.query.pageSize);
	var url = "" + (0, _misc.formatUrl)(config.server) + request.route.path + "?";

	response.set("X-First-Page-Url", url + _querystring2.default.stringify({
		pageSize: request.query.pageSize,
		page: 0
	}));

	if (request.query.page !== 0) {
		response.set("X-Prev-Page-Url", url + _querystring2.default.stringify({
			pageSize: request.query.pageSize,
			page: request.query.page - 1
		}));
	}

	if (request.query.page !== last) {
		response.set("X-Next-Page-Url", url + _querystring2.default.stringify({
			pageSize: request.query.pageSize,
			page: request.query.page + 1
		}));
	}

	response.set("X-Last-Page-Url", url + _querystring2.default.stringify({
		pageSize: request.query.pageSize,
		page: last
	}));
}

function wrapJSON(method) {
	return function (request, response, next) {
		method(request, response, next).then(function (result) {
			if (result.success === false) {
				response.status(400);
			}
			response.json(result);
		}).catch(function (error) {
			log(error);
			return sendError(error, request, response);
		}).done();
	};
}

function wrapFile(method) {
	return function (request, response, next) {
		method(request, response, next).then(function (result) {
			log("result", result);
		}).catch(function (error) {
			log(error);
			return sendError(error, request, response);
		}).done();
	};
}

function wrapStripe(method) {
	return function (request, response, next) {
		method(request, response, next).then(response.json.bind(response)).catch(function (error) {
			log(error);
			switch (error.type) {
				case "StripeCardError":
				case "StripeInvalidRequestError":
					Object.assign(error, { status: 400 });
					return sendError(error, request, response);
				case "StripeAPIError":
				case "StripeConnectionError":
				case "StripeAuthenticationError":
				default:
					if (process.env.NODE_ENV === "production") {
						sendError((0, _error.makeError)("stripe-bad-request", request.user, 400), request, response);
					}
					return sendError(error, request, response);
			}
		}).done();
	};
}