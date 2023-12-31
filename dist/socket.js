"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
class Socket {
    socket;
    _listeners = {};
    constructor(url) {
        // Setup Socket Connection
        this.socket = new ws_1.default(url);
        this.socket.on('open', () => {
            this.trigger('open');
        });
        this.socket.on('message', (message) => {
            const data = JSON.parse(message);
            this.trigger('message', data);
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.socket.on('close', (code, reason) => {
            this.trigger('close');
        });
    }
    on(event, callback) {
        this._listeners[event] = callback;
    }
    removeListener(event) {
        delete this._listeners[event];
    }
    trigger(event, data) {
        const callback = this._listeners[event];
        if (typeof callback === 'function') {
            callback.apply(null, [data]);
        }
    }
    close() {
        this.socket?.close();
    }
}
exports.default = Socket;
