import { Message } from './types';
declare class TwitchSocket {
    private static _instance?;
    private static _listeners;
    static init(url: string): void;
    static addListener(event: string, callback: (data?: Message) => void): void;
    static removeListener(event: string): void;
    static trigger(event: string, data?: Message): void;
    static close(): void;
}
export default TwitchSocket;
