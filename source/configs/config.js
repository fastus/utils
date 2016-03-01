"use strict";

export default {
	[process.env.NODE_ENV]: {
		server: {
			protocol: process.env.ABL_SERVER_PROTOCOL,
			hostname: process.env.ABL_SERVER_HOSTNAME,
			port: process.env.ABL_SERVER_PORT
		}
	}
};
