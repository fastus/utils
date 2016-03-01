"use strict";

import assert from "power-assert";
import moment from "abl-constants/build/moment";
import {date, startDate, untilDate} from "abl-constants/build/date";
import {getEventInstanceId, getEventId, getEventDate, isOutOfNewRange} from "../../source/event";

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

	describe.only("#isOutOfNewRange", () => {
		it("startTime moved forward (|-*-| -> *|---|)", () => {
			const timeslot = {
				isStartTimeChanged: true,
				startTime: moment(startDate).add(2, "d"),
				originalStartTime: moment(startDate).add(0, "d"),

				isUntilTimeChanged: false,
				untilTime: untilDate,
				originalUntilTime: untilDate,

				isDaysRunningChanged: false,
				daysRunning: [0, 1, 2, 3, 4, 5, 6]
			};
			const event = {
				startTime: moment(startDate).add(1, "d")
			};
			assert.equal(isOutOfNewRange(timeslot, event), true);
		});

		it("startTime moved forward (|-*-| -> |*--|)", () => {
			const timeslot = {
				isStartTimeChanged: true,
				startTime: moment(startDate).add(1, "d"),
				originalStartTime: moment(startDate).add(0, "d"),

				isUntilTimeChanged: false,
				untilTime: untilDate,
				originalUntilTime: untilDate,

				isDaysRunningChanged: false,
				daysRunning: [0, 1, 2, 3, 4, 5, 6]
			};
			const event = {
				startTime: moment(startDate).add(2, "d")
			};
			assert.equal(isOutOfNewRange(timeslot, event), false);
		});

		it("startTime moved backward (|-*-| -> |--*|)", () => {
			const timeslot = {
				isStartTimeChanged: true,
				startTime: moment(startDate).add(1, "d"),
				originalStartTime: moment(startDate).add(2, "d"),

				isUntilTimeChanged: false,
				untilTime: untilDate,
				originalUntilTime: untilDate,

				isDaysRunningChanged: false,
				daysRunning: [0, 1, 2, 3, 4, 5, 6]
			};
			const event = {
				startTime: moment(startDate).add(3, "d")
			};
			assert.equal(isOutOfNewRange(timeslot, event), false);
		});

		it("untilTime moved forward (|-*-| -> |*--|)", () => {
			const timeslot = {
				isStartTimeChanged: false,
				startTime: startDate,
				originalStartTime: startDate,

				isUntilTimeChanged: true,
				untilTime: moment(untilDate).add(2, "d"),
				originalUntilTime: moment(untilDate).add(0, "d"),

				isDaysRunningChanged: false,
				daysRunning: [0, 1, 2, 3, 4, 5, 6]
			};
			const event = {
				startTime: moment(untilDate).add(-1, "d")
			};
			assert.equal(isOutOfNewRange(timeslot, event), false);
		});

		it("untilTime moved backward (|-*-| -> |--*|)", () => {
			const timeslot = {
				isStartTimeChanged: false,
				startTime: startDate,
				originalStartTime: startDate,

				isUntilTimeChanged: true,
				untilTime: moment(untilDate).add(-1, "d"),
				originalUntilTime: moment(untilDate).add(0, "d"),

				isDaysRunningChanged: false,
				daysRunning: [0, 1, 2, 3, 4, 5, 6]
			};
			const event = {
				startTime: moment(untilDate).add(-2, "d")
			};
			assert.equal(isOutOfNewRange(timeslot, event), false);
		});

		it("untilTime moved backward (|-*-| -> |---|*)", () => {
			const timeslot = {
				isStartTimeChanged: false,
				startTime: startDate,
				originalStartTime: startDate,

				isUntilTimeChanged: true,
				untilTime: moment(untilDate).add(-2, "d"),
				originalUntilTime: moment(untilDate).add(0, "d"),

				isDaysRunningChanged: false,
				daysRunning: [0, 1, 2, 3, 4, 5, 6]
			};
			const event = {
				startTime: moment(untilDate).add(-1, "d")
			};
			assert.equal(isOutOfNewRange(timeslot, event), true);
		});

		it("daysRunning changed ([0..6] -> [0..6])", () => {
			const timeslot = {
				isStartTimeChanged: false,
				startTime: startDate,
				originalStartTime: startDate,

				isUntilTimeChanged: false,
				untilTime: untilDate,
				originalUntilTime: untilDate,

				isDaysRunningChanged: true,
				daysRunning: [0, 1, 2, 3, 4, 5, 6]
			};
			const event = {
				startTime: startDate
			};
			assert.equal(isOutOfNewRange(timeslot, event), false);
		});

		it("daysRunning changed ([0..6] -> [])", () => {
			const timeslot = {
				isStartTimeChanged: false,
				startTime: startDate,
				originalStartTime: startDate,

				isUntilTimeChanged: false,
				untilTime: untilDate,
				originalUntilTime: untilDate,

				isDaysRunningChanged: true,
				daysRunning: []
			};
			const event = {
				startTime: startDate
			};
			assert.equal(isOutOfNewRange(timeslot, event), true);
		});
	});
});
