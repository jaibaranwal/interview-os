"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateMachine = exports.InterviewState = void 0;
// Future responsibility: Finite State Machine managing 10 interview states and state transitions
var InterviewState;
(function (InterviewState) {
    InterviewState["GREETING"] = "GREETING";
    InterviewState["PLANNING"] = "PLANNING";
    InterviewState["QUESTION"] = "QUESTION";
    InterviewState["LISTENING"] = "LISTENING";
    InterviewState["EVALUATING"] = "EVALUATING";
    InterviewState["FOLLOW_UP"] = "FOLLOW_UP";
    InterviewState["HINT"] = "HINT";
    InterviewState["TOPIC_SWITCH"] = "TOPIC_SWITCH";
    InterviewState["FINAL_EVALUATION"] = "FINAL_EVALUATION";
    InterviewState["COMPLETED"] = "COMPLETED";
})(InterviewState || (exports.InterviewState = InterviewState = {}));
class StateMachine {
    currentState = InterviewState.GREETING;
    getState() {
        return this.currentState;
    }
}
exports.StateMachine = StateMachine;
