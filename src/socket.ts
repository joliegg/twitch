import WebSocket from 'ws';
import { Message } from './types';

class Socket {
  protected url: string;

  protected socket?: WebSocket;
  protected listeners: Record<string, (data?: Message) => void> = {};

  private _keepAlive: NodeJS.Timeout | null = null;
  private _keepAliveInterval = 10000;


	constructor (url: string, ) {
    this.url = url;
	}

  connect () {
    if (this._keepAlive) {
      clearTimeout(this._keepAlive);
    }

		// Setup Socket Connection
    this.socket = new WebSocket(this.url);

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
		this.listeners[event] = callback;
	}

	removeListener (event: string) {
		delete this.listeners[event];
	}

	trigger (event: string, data?: Message) {
		const callback = this.listeners[event];

		if (typeof callback === 'function') {
			callback.apply(null, [data]);
		}
	}

  async close () {
    if (this.socket instanceof WebSocket) {
      this.socket.close();

      return new Promise((resolve, reject) => setTimeout(resolve, 500));
    }
  }

}

export default Socket;