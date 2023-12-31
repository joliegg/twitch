import { Events } from 'tmi.js';
declare class Chatbot {
    private options?;
    private client;
    constructor(username: string, token: string, channels: string[]);
    connect(): Promise<[string, number]>;
    on(event: keyof Events, callback: (...args: any[]) => void): void;
    say(target: string, message: string): Promise<[string]>;
}
export default Chatbot;
