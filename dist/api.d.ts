import { Clip, TokenResponse, Video, Stream, User, Follower } from './types';
declare class TwitchAPI {
    private clientId?;
    private clientSecret?;
    private applicationToken?;
    private userToken?;
    private refreshToken?;
    private onTokenRefresh?;
    constructor(clientId: string, clientSecret: string, applicationToken: string);
    credentials(userToken: string, refreshToken: string, onTokenRefresh?: (data: TokenResponse) => Promise<void>): void;
    stream(broadcasterId: string): Promise<Stream | null>;
    category(categoryId: string): Promise<import("./types").Category | null>;
    refresh(): Promise<void | TokenResponse>;
    subscribe(broadcasterId: string, type: string, session: string): Promise<void>;
    clips(n: number, broadcasterId: string): Promise<Clip[]>;
    videos(n: number, broadcasterId: string): Promise<Video[]>;
    user(id: string, identifier?: string): Promise<User | null>;
    follower(userId: string): Promise<Follower | null>;
}
export default TwitchAPI;
