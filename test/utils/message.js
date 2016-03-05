"use strict";

import assert from "power-assert";
import {prepare} from "../../source/message";
import {activityObject, eventObject, timeslotObject, bookingObject, transactionObject, customerObject, operatorObject} from "abl-constants/build/objects";
import {daysRunning, timeFormat, dateFormat, startDate} from "abl-constants/build/date";
import moment from "abl-constants/build/moment";

describe("Message", () => {

    const rand = () => {
        return Math.random().toString(36).substr(2);
    };


    describe("#prepare", () => {

        function getData(arg) {
            return Object.assign({
                activity: activityObject(),
                event: eventObject(),
                timeslot: timeslotObject({daysRunning: daysRunning}),
                booking: bookingObject(),
                transaction: transactionObject(),
                customer: customerObject(),
                hash: {token: rand()},
                operator: operatorObject()
            }, arg);
        }

        it("prepare with loaded data from constants/objects", () => {
            const data = getData();
            const res = prepare(data);
            assert.equal(res.activity.location, "[very long street 123](https://www.google.com/maps/place/very+long+street+123)");
            assert.equal(res.event.startTime, moment(data.event.startTime).tz(data.event.timeZone).format(timeFormat));
            assert.ok(res.event.rrule);
            assert.equal(res.booking.answers, "**question 1?**\n answer 1!\n\n**question 2?**\n answer 2!");
            assert.equal(res.booking.count, 2);
            assert.deepEqual(res.transaction, { subtotal: '$415.00', total: '$435.00', tax: '$10.00', fee: '$10.00', coupon: '' });
            assert.equal(res.customer.location, "[very long street 123](https://www.google.com/maps/place/very+long+street+123)");
            assert.equal(res.hash.token, data.hash.token);
            assert.equal(res.operator.location, "[very long street 123](https://www.google.com/maps/place/very+long+street+123)");
        });
        it("prepare with changed objects (if statements)", () => {
            const data = getData();
            const dateTimeFormat = `${dateFormat} ${timeFormat}`;
            const endTime = moment(data.event.endTime).tz(data.event.timeZone).format(dateTimeFormat);
            data.activity.requirements = "";
            data.activity.whatToBring = "";
            data.activity.whatIncluded = "";
            data.activity.location = null;
            data.event.startTime = moment(startDate).day(-2);
            data.booking.notes = null;
            data.operator.preferences.features.questions = null;
            data.customer.location = null;
            data.operator.location = null;
            const res = prepare(data);
            assert.equal(res.activity.requirements, "- N/A");
            assert.equal(res.activity.whatToBring, "- N/A");
            assert.equal(res.activity.included, "- N/A");
            assert.equal(res.activity.location, "");
            assert.equal(res.event.endDateTimeOrTime, endTime);
            assert.equal(res.booking.notes, "N/A");
            assert.equal(res.booking.answers, "");
            assert.equal(res.customer.location, "");
            assert.equal(res.operator.location, "");
        });
        it("prepare with empty objects", () => {
            const data = {};
            data.operator = operatorObject();
            const res = prepare(data);
            assert.equal(res.activity, undefined);
        });
        it("prepare - wrap OR cases", () => {
            const data = {};
            data.operator = operatorObject();
            data.timeslot = timeslotObject({daysRunning: daysRunning});
            data.timeslot.activity = activityObject();
            data.booking = bookingObject();
            data.booking.transaction = transactionObject();
            data.booking.customer = customerObject();
            const res = prepare(data);
            assert.ok(res.activity);
            assert.ok(res.event);
            assert.ok(res.transaction);
            assert.ok(res.customer);
        });
    });
});
