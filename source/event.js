"use strict";

import moment from "abl-constants/build/moment";
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
