import WebSocket from 'ws';
import { Message } from './types';
declare class Socket {
    protected url: string;
    protected socket?: WebSocket;
    protected listeners: Record<string, (data?: Message) => void>;
    private _keepAlive;
    private _keepAliveInterval;
    constructor(url: string);
    connect(): void;
    on(event: string, callback: (data?: Message) => void): void;
    removeListener(event: string): void;
    trigger(event: string, data?: Message): void;
    close(): Promise<unknown>;
}
export default Socket;
