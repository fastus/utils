"use strict";

import moment from "abl-constants/build/moment";
import {googleFormat, ISO_8601} from "abl-constants/build/date";
import {isType} from "./misc";


export function getEventInstanceId(eventId, time) {
	return `${eventId}_${moment.tz(time, "UTC").format(googleFormat)}`;
}

export function getEventId(eventInstanceId) {
	return eventInstanceId.split("_")[0];
}

export function getEventDate(eventInstanceId) {
	return moment.tz(eventInstanceId.split("_")[1], googleFormat, "UTC").toDate();
}

export function parseDate(date) {
	switch (true) {
		case isType(date, "Number"):
		case isType(date, "Date"):
			return moment(date);
		case isType(date, "String"):
			return moment.tz(date, ISO_8601, "UTC");
		case isType(date, "Object"):
			return date;
		default:
			return moment(null);
	}
}
