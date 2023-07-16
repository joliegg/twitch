"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
class TwitchSocket {
    static _instance;
    static _listeners;
    static init(url) {
        if (this._instance instanceof ws_1.default) {
            this._instance.close();
        }
        // Setup Socket Connection
        this._instance = new ws_1.default(url);
        this._instance.on('open', () => {
            this.trigger('open');
            console.log('Twitch WebSocket Open');
        });
        this._instance.on('message', (message) => {
            const data = JSON.parse(message);
            this.trigger('message', data);
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._instance.on('close', (code, reason) => {
            this.trigger('close');
        });
    }
    static addListener(event, callback) {
        this._listeners[event] = callback;
    }
    static removeListener(event) {
        delete this._listeners[event];
    }
    static trigger(event, data) {
        const callback = this._listeners[event];
        if (typeof callback === 'function') {
            callback.apply(null, [data]);
        }
    }
    static close() {
        this._instance?.close();
    }
}
exports.default = TwitchSocket;
