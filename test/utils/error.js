import moment from "moment";
import {date} from "../../node_modules/abl-constants/build/date";
import {checkPast} from "../../source/error";
import assert from "power-assert";


describe("#checkPast", () => {
	const dashboard = {apiKeys: [{public: false}]};
	const widget = {apiKeys: [{public: true}]};
	const past = moment(date).add(-1, "d");
	const future = moment(date).add(1, "d");

	it("checkPast allowForAdmin=true isAdmin=true checkPast=true", () => {
		checkPast(true, "startTime")({startTime: past}, {user: dashboard});
	});

	it("checkPast allowForAdmin=true isAdmin=true checkPast=false", () => {
		checkPast(true, "startTime")({startTime: future}, {user: dashboard});
	});

	it("checkPast allowForAdmin=true isAdmin=false checkPast=true", () => {
		assert.throws(() => {
			checkPast(true, "startTime")({startTime: past}, {user: widget});
		});
	});

	it("checkPast allowForAdmin=true isAdmin=false checkPast=false", () => {
		checkPast(true, "startTime")({startTime: future}, {user: widget});
	});

	it("checkPast allowForAdmin=false isAdmin=true checkPast=true", () => {
		assert.throws(() => {
			checkPast(false, "startTime")({startTime: past}, {user: dashboard});
		});
	});

	it("checkPast allowForAdmin=false isAdmin=true checkPast=false", () => {
		checkPast(false, "startTime")({startTime: future}, {user: dashboard});
	});

	it("checkPast allowForAdmin=false isAdmin=false checkPast=true", () => {
		assert.throws(() => {
			checkPast(false, "startTime")({startTime: past}, {user: widget});
		});
	});

	it("checkPast allowForAdmin=false isAdmin=false checkPast=false", () => {
		checkPast(false, "startTime")({startTime: future}, {user: widget});
	});
});
