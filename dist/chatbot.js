"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tmi_js_1 = __importDefault(require("tmi.js"));
class Chatbot {
    options;
    client;
    constructor(username, token, channels) {
        this.options = {
            options: { debug: true },
            identity: {
                username,
                password: token
            },
            channels
        };
        this.client = new tmi_js_1.default.Client(this.options);
    }
    connect() {
        return this.client.connect();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event, callback) {
        this.client.on(event, callback);
    }
    say(target, message) {
        return this.client.say(target, message);
    }
}
exports.default = Chatbot;
