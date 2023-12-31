import WebSocket from 'ws';
import { Message } from './types';

class Socket {

  private socket?: WebSocket;
  private _listeners: Record<string, (data?: Message) => void> = {};

	constructor (url: string) {
		// Setup Socket Connection
    this.socket = new WebSocket(url);

    this.socket.on('open', () => {
      this.trigger('open');
    });

    this.socket.on('message', (message: string) => {
      const data = JSON.parse(message) as Message;
      this.trigger('message', data);
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.socket.on('close', (code: number, reason: Buffer) => {
      this.trigger('close');
    });
	}

	on (event: string, callback: (data?: Message) => void) {
		this._listeners[event] = callback;
	}

	removeListener (event: string) {
		delete this._listeners[event];
	}

	trigger (event: string, data?: Message) {
		const callback = this._listeners[event];

		if (typeof callback === 'function') {
			callback.apply(null, [data]);
		}
	}

  close () {
    this.socket?.close();
  }

}

export default Socket;