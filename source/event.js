"use strict";

import moment from "moment";
import timezone from "moment-timezone"; // eslint-disable-line no-unused-vars
import {googleFormat} from "abl-constants/build/date";


export function getEventInstanceId(eventId, time) {
	return eventId + "_" + moment.tz(time, "UTC").format(googleFormat);
}

export function getEventId(eventInstanceId) {
	return eventInstanceId.split("_")[0];
}

export function getEventDate(eventInstanceId) {
	return moment.tz(eventInstanceId.split("_")[1], googleFormat, "UTC").toDate();
}

export function countAttendees(attendees) {
	return Object.keys(attendees || {}).reduce((memo, key) => {
		return memo + attendees[key];
	}, 0);
}
