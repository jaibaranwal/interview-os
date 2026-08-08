"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateMachine = exports.InterviewState = void 0;
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
    currentState;
    constructor(initialState = InterviewState.GREETING) {
        this.currentState = initialState;
    }
    getState() {
        return this.currentState;
    }
    canTransitionTo(nextState) {
        switch (this.currentState) {
            case InterviewState.GREETING:
                return nextState === InterviewState.PLANNING;
            case InterviewState.PLANNING:
                return nextState === InterviewState.QUESTION;
            case InterviewState.QUESTION:
                return nextState === InterviewState.LISTENING;
            case InterviewState.LISTENING:
                return nextState === InterviewState.EVALUATING;
            case InterviewState.EVALUATING:
                return [
                    InterviewState.FOLLOW_UP,
                    InterviewState.HINT,
                    InterviewState.TOPIC_SWITCH,
                    InterviewState.FINAL_EVALUATION
                ].includes(nextState);
            case InterviewState.FOLLOW_UP:
                return nextState === InterviewState.QUESTION;
            case InterviewState.HINT:
                return nextState === InterviewState.QUESTION || nextState === InterviewState.TOPIC_SWITCH;
            case InterviewState.TOPIC_SWITCH:
                return nextState === InterviewState.PLANNING;
            case InterviewState.FINAL_EVALUATION:
                return nextState === InterviewState.COMPLETED;
            case InterviewState.COMPLETED:
                return false; // Terminal state
            default:
                return false;
        }
    }
    transitionTo(nextState) {
        if (!this.canTransitionTo(nextState)) {
            throw new Error(`Invalid state transition from '${this.currentState}' to '${nextState}'.`);
        }
        this.currentState = nextState;
        return this.currentState;
    }
    isComplete() {
        return this.currentState === InterviewState.COMPLETED;
    }
}
exports.StateMachine = StateMachine;
