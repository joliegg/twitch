import WebSocket from 'ws';
import { Message } from './types/types';

class TwitchSocket {

  private static _instance?: WebSocket;
  private static _listeners: Record<string, (data?: Message) => void>

	static init (url: string) {
    if (this._instance instanceof WebSocket) {
      this._instance.close();
    }


		// Setup Socket Connection
    this._instance = new WebSocket(url);

    this._instance.on('open', () => {
      this.trigger('open');
      console.log('Twitch WebSocket Open');
    });

    this._instance.on('message', (message: string) => {
      const data = JSON.parse(message) as Message;
      this.trigger('message', data);
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this._instance.on('close', (code: number, reason: Buffer) => {
      this.trigger('close');
    });
	}

	static addListener (event: string, callback: (data?: Message) => void) {
		this._listeners[event] = callback;
	}

	static removeListener (event: string) {
		delete this._listeners[event];
	}

	static trigger (event: string, data?: Message) {
		const callback = this._listeners[event];

		if (typeof callback === 'function') {
			callback.apply(null, [data]);
		}
	}

}

export default TwitchSocket;