"use strict";

import moment from "abl-constants/build/moment";
import {date} from "abl-constants/build/date";
import {checkPast, makeError, checkModel, checkUser, checkOwner, checkDefault, checkActive} from "../../source/error";
import {translate} from "abl-lang";
import assert from "power-assert";

describe("Error", () => {
    describe("#checkPast", () => {
        const dashboard = {apiKeys: [{public: false}]};
        const widget = {apiKeys: [{public: true}]};
        const past = moment(date).add(-1, "d");
        const future = moment(date).add(1, "d");
        it("checkPast allowForAdmin=true isAdmin=true checkPast=true", () => {
            assert.doesNotThrow(() => {
                checkPast(true, "startTime")({startTime: past}, {user: dashboard});
            });
        });
        it("checkPast allowForAdmin=true isAdmin=true checkPast=false", () => {
            assert.doesNotThrow(() => {
                checkPast(true, "startTime")({startTime: future}, {user: dashboard});
            });
        });
        it("checkPast allowForAdmin=true isAdmin=false checkPast=true", () => {
            assert.throws(() => {
                checkPast(true, "startTime")({startTime: past}, {user: widget});
            });
        });
        it("checkPast allowForAdmin=true isAdmin=false checkPast=false", () => {
            assert.doesNotThrow(() => {
                checkPast(true, "startTime")({startTime: future}, {user: widget});
            });
        });
        it("checkPast allowForAdmin=false isAdmin=true checkPast=true", () => {
            assert.throws(() => {
                checkPast(false, "startTime")({startTime: past}, {user: dashboard});
            });
        });
        it("checkPast allowForAdmin=false isAdmin=true checkPast=false", () => {
            assert.doesNotThrow(() => {
                checkPast(false, "startTime")({startTime: future}, {user: dashboard});
            });
        });
        it("checkPast allowForAdmin=false isAdmin=false checkPast=true", () => {
            assert.throws(() => {
                checkPast(false, "startTime")({startTime: past}, {user: widget});
            });
        });
        it("checkPast allowForAdmin=false isAdmin=false checkPast=false", () => {
            assert.doesNotThrow(() => {
                checkPast(false, "startTime")({startTime: future}, {user: widget});
            });
        });
        it("checkPast with defaults isAdmin=false checkPast=false", () => {
            assert.doesNotThrow(() => {
                checkPast()({startTime: future}, {user: widget});
            });
        });
    });

    describe("#makeError", () => {
        it("makeError page-not-found, user.language: 'en', 400", () => {
            const user = {language: "en"};
            const error = makeError("page-not-found", user, 400);
            assert.equal(error.message, "Page Not Found");
            assert.equal(error.status, 400);
        });

        it("makeError user = null", () => {
            const user = null;
            const error = makeError("page-not-found", user, 400);
            assert.equal(error.message, "Page Not Found");
            assert.equal(error.status, 400);
        });

        it("makeError fake-key", () => {
            const user = {language: "en"};
            const error = makeError("fake-key", user, 400);
            assert.equal(error.message, undefined);
            assert.equal(error.status, 400);
        });

        it("makeError empty code", () => {
            const user = {language: "en"};
            const error = makeError("page-not-found", user);
            assert.equal(error.message, "Page Not Found");
            assert.equal(error.status, 400);
        });
    });

    describe("#translate", () => {
        it("translate error.server.page-not-found, user.language: 'en'", () => {
            const path = "error.server.page-not-found";
            const user = {language: "en"};
            assert.equal(translate(path, user), "Page Not Found");
        });
        it("translate non existing language", () => {
            const path = "error.server.page-not-found";
            const user = {language: "no-lang"};
            assert.throws(() => {
                translate(path, user);
            });
        });
        it("translate non existing path", () => {
            const path = "error.server.no-path-for-translate-using-translate";
            const user = {language: "en"};
            assert.equal(translate(path, user), undefined);
        });
    });

    describe("#checkModel", () => {
        class TestController {
            static displayName = "displayname";

            constructor() {}
        }
        const testController = new TestController();
        const model = {a: true, b: false, c: {1: "3", 2: "4"}};
        const user = {language: "en"};

        it("checkModel with valid user and model", () => {
            assert.equal(checkModel(user)(model), model);
        });
        it("checkModel with no user", () => {
            assert.equal(checkModel()(model), model);
        });
        it("checkModel with no model", () => {
            assert.throws(() => {
                checkModel(user).bind(testController)();
            }, e => e.message === "displayname Not Found");
        });
    });

    describe("#checkUser", () => {
        class TestController {
            static realm = "user";

            constructor() {}
        }
        const testController = new TestController();
        it("checkUser with valid user and model", () => {
            const user = {_id: 4950006433255, language: "en"};
            const model = {
                user: {_id: 4950006433255, language: "en"}
            };
            assert.equal(checkUser(user).bind(testController)(model), model);
        });
        it("checkUser user._id doesn't match model.user._id", () => {
            const user = {_id: 4950006433255, language: "en"};
            const model = {
                user: {_id: 4950006433000, language: "en"}
            };
            assert.throws(() => {
                checkUser(user).bind(testController)(model);
            }, e => e.message === "Access denied");
        });
        it("checkUser with no user", () => {
            const model = {
                user: {_id: 4950006433000, language: "en"}
            };
            assert.throws(() => {
                checkUser().bind(testController)(model);
            });
        });
        it("checkUser with no model", () => {
            const user = {_id: 4950006433255, language: "en"};
            assert.throws(() => {
                checkUser(user).bind(testController)();
            });
        });
        it("checkUser user._id doesn't match model.user._id, condition = true", () => {
            const user = {_id: 4950006433255, language: "en"};
            const model = {
                user: {_id: 4950006433000, language: "en"}
            };
            assert.equal(checkUser(user, true).bind(testController)(model), model);
        });
    });

    describe("#checkOwner", () => {

        it("checkOwner user.id === model.owner, condition=false", () => {
            const user = {_id: 4950006433255};
            const model = {
                owner: 4950006433255
            };
            assert.equal(checkOwner(user)(model), model);
        });
        it("checkOwner user.id === model.owner, condition=true", () => {
            const user = {_id: 4950006433255};
            const model = {
                owner: 4950006433255
            };
            assert.throws(() => {
                checkOwner(user, true)(model);
            }, e => e.message === "Access denied");
        });
        it("checkOwner user.id != model.owner, condition=false", () => {
            const user = {_id: 4950006433255};
            const model = {
                owner: 1
            };
            assert.throws(() => {
                checkOwner(user)(model);
            }, e => e.message === "Access denied");
        });
    });

    describe("#checkDefault", () => {

        it("checkDefault isDefault, request.body.default", () => {
            assert.deepEqual(checkDefault({_id: 4950006433255})({show: true}, {
                params: {_id: 4950006433255},
                body: {default: true}
            }), {show: true});
        });
        it("checkDefault isDefault, !request.body.default", () => {
            assert.throws(() => {
                checkOwner(checkDefault({_id: 4950006433255})({show: true}, {
                    params: {_id: 4950006433255},
                    body: {default: false}
                }));
            }, e => e.message === "You must have a default contract");
        });
        it("checkDefault !isDefault", () => {
            assert.deepEqual(checkDefault({_id: 4950006433255})({show: true}, {
                params: {_id: 1},
                body: {default: true}
            }), {show: true});

        });
    });

    describe("#checkActive", () => {
        const admin = {apiKeys: [{public: false}]};
        const user = {apiKeys: [{public: true}]};
        class TestController {
            static statuses = {
                active: "active",
                inactive: "inactive"
            };
            static displayName = "Displayname";

            constructor() {}
        }
        const testController = new TestController();

        it("checkActive isAllowed=false isAdmin=false isActive=false", () => {
            const check = checkActive(false).bind(testController);
            assert.throws(() => {
                check({status: TestController.statuses.inactive}, {user});
            }, e => e.message === "Displayname Is Not Active");
        });
        it("checkActive isAllowed=true isAdmin=false isActive=false", () => {
            const check = checkActive(true).bind(testController);
            assert.throws(() => {
                check({status: TestController.statuses.inactive}, {user});
            }, e => e.message === "Displayname Is Not Active");
        });
        it("checkActive isAllowed=false isAdmin=true isActive=false", () => {
            const check = checkActive(false).bind(testController);
            assert.throws(() => {
                check({status: TestController.statuses.inactive}, {user: admin});
            }, e => e.message === "Displayname Is Not Active");
        });
        it("checkActive isAllowed=true isAdmin=false isActive=true", () => {
            const check = checkActive(false).bind(testController);
            assert.deepEqual(check({status: TestController.statuses.active}, {user}), {status: "active"});
        });
        it("checkActive isAllowed=true isAdmin=true isActive=false", () => {
            const check = checkActive(true).bind(testController);
            assert.deepEqual(check({status: TestController.statuses.inactive}, {user: admin}), {status: "inactive"});
        });
        it("checkActive isAllowed=true isAdmin=true isActive=true", () => {
            const check = checkActive(true).bind(testController);
            assert.deepEqual(check({status: TestController.statuses.active}, {user: admin}), {status: "active"});
        });
        it("checkActive isAllowed=false isAdmin=false isActive=true", () => {
            const check = checkActive(false).bind(testController);
            assert.deepEqual(check({status: TestController.statuses.active}, {user}), {status: "active"});
        });
        it("checkActive isAllowed=false isAdmin=true isActive=true", () => {
            const check = checkActive(false).bind(testController);
            assert.deepEqual(check({status: TestController.statuses.active}, {user: admin}), {status: "active"});
        });
        it("checkActive noParams", () => {
            const check = checkActive().bind(testController);
            assert.throws(() => {
                check();
            }, e => e.message === "Cannot read property 'user' of undefined");
        });
    });
});
