"use strict";

import assert from "power-assert";
import moment from "abl-constants/build/moment";
import {date} from "abl-constants/build/date";
import {getEventInstanceId, getEventId, getEventDate, parseDate} from "../../source/event";

describe("#Event", () => {
	describe("#getEventInstanceId", () => {
		const eventId = "12345678901234567890123456";

		it("getEventInstanceId should return it with googleFormat data", () => {
			const time = "2016-02-14 23:55:35";
			assert.equal(getEventInstanceId(eventId, time), eventId + "_20160214T235535Z");
		});
		it("getEventInstanceId with fake time", () => {
			const time = "fake_time";
			assert.equal(getEventInstanceId(eventId, time), eventId + "_Invalid date");
		});
		it("getEventInstanceId with new Data object", () => {
			const time = moment.tz("2016-02-14 23:55:35", "UTC").toDate();
			assert.equal(getEventInstanceId(eventId, time), eventId + "_20160214T235535Z");
		});
	});

	describe("#getEventId", () => {
		it("getEventId returns eventId from eventInstanceId", () => {
			const eventInstanceId = "12345678901234567890123456_20160214T235535Z";
			assert.equal(getEventId(eventInstanceId), "12345678901234567890123456");
		});
	});

	describe("#getEventDate", () => {
		it("getEventDate returns new Date from eventInstanceId with milliseconds", () => {
			const eventInstanceId = "12345678901234567890123456_20160214T235535Z";
			const date = new Date("2016-02-14T23:55:35.000Z");
			assert.deepEqual(getEventDate(eventInstanceId), date);
		});
		it("getEventDate returns new Date from eventInstanceId", () => {
			const eventInstanceId = "12345678901234567890123456_20160214T235535Z";
			const date = new Date("2016-02-14T23:55:35Z");
			assert.deepEqual(getEventDate(eventInstanceId), date);
		});
	});

	describe("#parseDate", () => {
		it("parseDate date type Number", () => {
			const date = Date.parse("Mar 3, 2016");
			assert.deepEqual(parseDate(date), moment(1456934400000));
		});
		it("parseDate date type Date", () => {
			const date = new Date('Mar 3, 2016');
			assert.deepEqual(parseDate(date), moment(date));
		});
		it("parseDate date type String", () => {
			const date = "20160303T205500Z";
			const result = moment.tz(date, "YYYY-MM-DD\\THH:mm:ss\\Z", "UTC");
			assert.deepEqual(parseDate(date), result);
		});
		it("parseDate date type Object", () => {
			const date = {date: "20160303T205500Z"};
			assert.equal(parseDate(date), date);
		});
		it("parseDate date null", () => {
			const date = new Array();
			const result = parseDate(date);
			const check = moment(null);
			assert.equal(result._d.toString(), check._d.toString());
		});
	});
});
