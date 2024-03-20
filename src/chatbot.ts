import tmi, { Client, Events } from 'tmi.js';
import { ChatbotOptions } from './types';

class Chatbot {
  private options: ChatbotOptions;
  private client: Client;

  constructor(username: string, token: string, channels: string[]) {
    this.options = {
      options: { debug: true },
      identity: {
        username,
        password: token
      },
      channels
    };

    this.client = new tmi.Client(this.options);
  }

  connect () {
    return this.client.connect();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on (event: keyof Events, callback: (...args: any[]) => void) {
    this.client.on(event, callback);
  }

  say (target: string, message: string) {
    return this.client.say(target, message);
  }
}

export default Chatbot;