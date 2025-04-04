"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
class Socket {
    url;
    socket;
    listeners = {};
    _keepAlive = null;
    _keepAliveInterval = 10000;
    constructor(url) {
        this.url = url;
    }
    connect() {
        if (this._keepAlive) {
            clearTimeout(this._keepAlive);
        }
        // Setup Socket Connection
        this.socket = new ws_1.default(this.url);
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
        this.listeners[event] = callback;
    }
    removeListener(event) {
        delete this.listeners[event];
    }
    trigger(event, data) {
        const callback = this.listeners[event];
        if (typeof callback === 'function') {
            callback.apply(null, [data]);
        }
    }
    async close() {
        if (this.socket instanceof ws_1.default) {
            this.socket.close();
            return new Promise((resolve, reject) => setTimeout(resolve, 500));
        }
    }
}
exports.default = Socket;
