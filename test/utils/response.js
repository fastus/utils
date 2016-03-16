"use strict";

import {sendError, addPaginationHeaders} from "../../source/response";
import assert from "power-assert";
import langMongo from "abl-lang/bundle/en/mongo";
import langServer from "abl-lang/bundle/en/server";

describe("#Response", () => {
	describe("#sendError", () => {
		const request = {
			user: {language: "en"}
		};

		function getResponse(expectedStatus, expectedErrors) {
			return {
				send({status, errors}) {
					assert.equal(status, expectedStatus);
					assert.deepEqual(errors, expectedErrors);
				},
				status() {
					return this;
				}
			};
		}

		function createError(args) {
			const error = new Error();
			return Object.assign(error, args);
		}

		it("sendError with ValidationError", () => {
			const args = {
				message: "test message body for ValidationError",
				name: "ValidationError",
				errors: {
					0: {message: "test0message"},
					1: {message: "test1message"},
					2: {message: "test2message"}
				}
			};
			const error = createError(args);
			sendError(error, request, getResponse(409, ["test0message", "test1message", "test2message"]));
		});

		it("sendError with MongoError duplicate-customer-email", () => {
			const args = {
				message: "$duplicate-customer-email test message body",
				name: "MongoError",
				code: 11000
			};
			const error = createError(args);
			sendError(error, request, getResponse(400, [langMongo["duplicate-guide-email"]]));
		});

		it("sendError with MongoError E11000", () => {
			const args = {
				message: "$no-key-to-translate",
				name: "MongoError",
				code: 11000
			};
			const error = createError(args);
			sendError(error, request, getResponse(400, [langMongo.E11000]));
		});

		it("sendError with StripeCardError", () => {
			const args = {
				type: "StripeCardError"
			};
			const error = createError(args);
			sendError(error, request, getResponse(400, [""]));
		});

		it("sendError with no error.status", () => {
			const error = createError();
			sendError(error, request, getResponse(500, [error.stack]));
		});

		it("sendError with CustomError 511", () => {
			const message = "test message body for CustomError";
			const args = {
				message,
				name: "CustomError",
				status: 511
			};
			const error = createError(args);
			sendError(error, request, getResponse(511, [message]));
		});

		it("sendError with undefined error", () => {
			const error = "";
			sendError(error, request, getResponse(500, [void 0]));
		});

		it("sendError with process.env.NODE_ENV = production", () => {
			process.env.NODE_ENV = "production";
			const error = new Error("test error with no status");
			sendError(error, request, getResponse(500, [langServer.error]));
		});
		after(() => {
			process.env.NODE_ENV = "test";
		});
	});

	describe("#addPaginationHeaders", () => {
		function setRequest(arg) {
			return Object.assign({
				route: {
					path: "/pages"
				},
				query: {
					pageSize: 5,
					page: 3
				}
			}, arg);
		}

		const response = {
			headers: {},
			set(header, url) {
				this.headers[header] = url;
			}
		};

		it("addPaginationHeaders page !== 0, page !== last", () => {
			response.headers = {};
			addPaginationHeaders(setRequest(), response, 30);
			assert.equal(response.headers["X-First-Page-Url"], "https://localhost:443/pages?pageSize=5&page=0");
			assert.equal(response.headers["X-Prev-Page-Url"], "https://localhost:443/pages?pageSize=5&page=2");
			assert.equal(response.headers["X-Next-Page-Url"], "https://localhost:443/pages?pageSize=5&page=4");
			assert.equal(response.headers["X-Last-Page-Url"], "https://localhost:443/pages?pageSize=5&page=6");
		});
		it("addPaginationHeaders page = 0, page !== last", () => {
			response.headers = {};
			addPaginationHeaders(setRequest({query: {pageSize: 5, page: 0}}), response, 30);
			assert.equal(response.headers["X-First-Page-Url"], "https://localhost:443/pages?pageSize=5&page=0");
			assert.equal(response.headers["X-Prev-Page-Url"], undefined);
			assert.equal(response.headers["X-Next-Page-Url"], "https://localhost:443/pages?pageSize=5&page=1");
			assert.equal(response.headers["X-Last-Page-Url"], "https://localhost:443/pages?pageSize=5&page=6");
		});
		it("addPaginationHeaders page !== 0, page = last", () => {
			response.headers = {};
			addPaginationHeaders(setRequest({query: {pageSize: 5, page: 6}}), response, 30);
			assert.equal(response.headers["X-First-Page-Url"], "https://localhost:443/pages?pageSize=5&page=0");
			assert.equal(response.headers["X-Prev-Page-Url"], "https://localhost:443/pages?pageSize=5&page=5");
			assert.equal(response.headers["X-Next-Page-Url"], undefined);
			assert.equal(response.headers["X-Last-Page-Url"], "https://localhost:443/pages?pageSize=5&page=6");
		});
	});
});
