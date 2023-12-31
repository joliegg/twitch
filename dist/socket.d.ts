import { Message } from './types';
declare class Socket {
    private socket?;
    private _listeners;
    constructor(url: string);
    on(event: string, callback: (data?: Message) => void): void;
    removeListener(event: string): void;
    trigger(event: string, data?: Message): void;
    close(): void;
}
export default Socket;
