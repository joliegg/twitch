import { Clip, TokenResponse, Video, Stream, User, Follower, Category } from './types';
declare class TwitchAPI {
    private clientId?;
    private clientSecret?;
    private applicationToken?;
    private userToken?;
    private refreshToken?;
    private onTokenRefresh?;
    constructor(clientId: string, clientSecret: string, applicationToken: string);
    credentials(userToken: string, refreshToken: string, onTokenRefresh?: (data: TokenResponse) => Promise<TokenResponse>): Promise<TokenResponse>;
    streams(n: number, broadcasterId: string): Promise<Stream[]>;
    stream(broadcasterId: string): Promise<Stream | null>;
    category(categoryId: string): Promise<Category | null>;
    refresh(): Promise<TokenResponse>;
    subscribe(broadcasterId: string, type: string, session: string, conditions?: Record<string, string | number>, version?: number): Promise<void>;
    clips(n: number, broadcasterId: string): Promise<Clip[]>;
    videos(n: number, broadcasterId: string): Promise<Video[]>;
    video(id: string): Promise<Video | null>;
    user(id: string, identifier?: string): Promise<User | null>;
    follower(userId: string, broadcasterId: string): Promise<Follower | null>;
}
export default TwitchAPI;
