"use strict";

import assert from "power-assert";
import moment from "moment-config-trejgun";
import {getEventInstanceId, getEventId, getEventDate, parseDate} from "../../source/event";

describe("#Event", () => {
	describe("#getEventInstanceId", () => {
		const eventId = "12345678901234567890123456";

		it("getEventInstanceId should return it with googleFormat data", () => {
			const time = "2016-02-14 23:55:35";
			assert.equal(getEventInstanceId(eventId, time), `${eventId}_20160214T235535Z`);
		});
		it("getEventInstanceId with fake time", () => {
			const time = "fake_time";
			assert.equal(getEventInstanceId(eventId, time), `${eventId}_Invalid date`);
		});
		it("getEventInstanceId with new Data object", () => {
			const time = moment.tz("2016-02-14 23:55:35", "UTC").toDate();
			assert.equal(getEventInstanceId(eventId, time), `${eventId}_20160214T235535Z`);
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
			const date = new Date().getTime();
			assert.ok(parseDate(date).isValid());
			assert.ok(moment(parseDate(date)).isSame(date));
		});
		it("parseDate date type Date", () => {
			const date = new Date();
			assert.ok(parseDate(date).isValid());
			assert.ok(moment(parseDate(date)).isSame(date));
		});
		it("parseDate date type String", () => {
			const date = "20160303T205500Z";
			assert.ok(parseDate(date).isValid());
			assert.ok(moment(parseDate(date)).isSame(date));
		});
		it("parseDate date type Object", () => {
			const date = moment();
			assert.ok(parseDate(date).isValid());
			assert.ok(moment(parseDate(date)).isSame(date));
		});
		it("parseDate date null", () => {
			const date = [];
			assert.ok(!parseDate(date).isValid());
		});
	});
});
