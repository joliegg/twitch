import { Clip, TokenResponse, Video } from './types';
declare class TwitchAPI {
    broadcasterId?: string;
    private clientId?;
    private clientSecret?;
    private applicationToken?;
    private userToken?;
    private refreshToken?;
    private onTokenRefresh?;
    constructor(broadcasterId: string, clientId: string, clientSecret: string, applicationToken: string);
    credentials(userToken: string, refreshToken: string, onTokenRefresh?: (newToken: string, newRefreshToken: string) => Promise<void>): void;
    stream(): Promise<import("./types").Stream | null>;
    category(categoryId: string): Promise<import("./types").Category | null>;
    refresh(): Promise<TokenResponse | undefined>;
    subscribe(type: string, session: string): Promise<void>;
    clips(n: number): Promise<Clip[]>;
    videos(n: number): Promise<Video[]>;
}
export default TwitchAPI;
