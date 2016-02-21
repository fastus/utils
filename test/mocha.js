"use strict";

process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.HOST = process.env.HOST || "localhost";
process.env.PORT = process.env.PORT || "80";

Error.stackTraceLimit = Infinity;

const debug = require("debug");
debug.enable("utils:*");

process.on("uncaughtException", (exception) => {
	debug("log:mocha")(exception);
});
