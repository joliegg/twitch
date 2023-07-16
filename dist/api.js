"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
const axios_1 = __importDefault(require("axios"));
class TwitchAPI {
    broadcasterId;
    clientId;
    clientSecret;
    applicationToken;
    userToken;
    refreshToken;
    onTokenRefresh;
    constructor(broadcasterId, clientId, clientSecret, applicationToken) {
        this.broadcasterId = broadcasterId;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.applicationToken = applicationToken;
    }
    credentials(userToken, refreshToken, onTokenRefresh) {
        this.userToken = userToken;
        this.refreshToken = refreshToken;
        this.onTokenRefresh = onTokenRefresh;
    }
    async stream() {
        const { data } = await axios_1.default.get(`https://api.twitch.tv/helix/streams?user_id=${this.broadcasterId}`, {
            headers: {
                'Authorization': `Bearer ${this.applicationToken}`,
                'Client-Id': this.clientId,
            }
        });
        if (Array.isArray(data.data)) {
            if (data.data.length > 0) {
                return data.data[0];
            }
        }
        return null;
    }
    async category(categoryId) {
        const { data } = await axios_1.default.get(`https://api.twitch.tv/helix/games?id=${categoryId}`, {
            headers: {
                'Authorization': `Bearer ${this.applicationToken}`,
                'Client-Id': this.clientId,
            }
        });
        if (Array.isArray(data.data)) {
            if (data.data.length > 0) {
                return data.data[0];
            }
        }
        return null;
    }
    async refresh() {
        const params = new url_1.default.URLSearchParams({
            client_id: this.clientId ?? '',
            client_secret: this.clientSecret ?? '',
            grant_type: 'refresh_token',
            refresh_token: encodeURIComponent(this.refreshToken ?? '')
        });
        try {
            const { data } = await axios_1.default.post('https://id.twitch.tv/oauth2/token', params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            });
            return data;
        }
        catch (error) {
            console.error(error);
        }
    }
    async subscribe(type, session) {
        try {
            await axios_1.default.post('https://api.twitch.tv/helix/eventsub/subscriptions', {
                type,
                condition: {
                    broadcaster_user_id: this.broadcasterId,
                },
                version: 1,
                transport: {
                    method: 'websocket',
                    // callback: 'https://bot.reinocake.com/api/v1/twitch/events',
                    session_id: session,
                },
            }, {
                headers: {
                    'Authorization': `Bearer ${this.userToken}`,
                    'Client-Id': this.clientId,
                }
            });
        }
        catch (error) {
            if (error instanceof axios_1.default.AxiosError) {
                if (error.response && error.response.status === 401) {
                    const newToken = await this.refresh();
                    if (newToken) {
                        this.userToken = newToken.access_token;
                        this.refreshToken = newToken.refresh_token;
                        if (typeof this.onTokenRefresh === 'function') {
                            await this.onTokenRefresh(newToken.access_token, newToken.refresh_token);
                        }
                        return this.subscribe(type, session);
                    }
                }
            }
        }
    }
    async clips(n) {
        const first = n < 100 ? n : 100;
        const max = first < 100 ? 1 : Math.ceil(n / 100);
        let clips = [];
        let pagination = null;
        for (let i = 0; i < max; i++) {
            const url = `https://api.twitch.tv/helix/clips?broadcaster_id=${this.broadcasterId}&first=${first}${pagination ? `&after=${pagination}` : ""}`;
            const { data } = await axios_1.default.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.applicationToken}`,
                    'Client-Id': this.clientId,
                }
            });
            pagination = data.pagination?.cursor ?? null;
            if (Array.isArray(data.data)) {
                clips = clips.concat(data.data);
            }
        }
        return clips;
    }
    async videos(n) {
        const first = n < 100 ? n : 100;
        const max = first < 100 ? 1 : Math.ceil(n / 100);
        let videos = [];
        let pagination = null;
        for (let i = 0; i < max; i++) {
            const url = `https://api.twitch.tv/helix/videos?user_id=${this.broadcasterId}&first=${first}${pagination ? `&after=${pagination}` : ""}`;
            const { data } = await axios_1.default.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.applicationToken}`,
                    'Client-Id': this.clientId,
                }
            });
            pagination = data.pagination?.cursor ?? null;
            if (Array.isArray(data.data)) {
                videos = videos.concat(data.data);
            }
        }
        return videos;
    }
}
exports.default = TwitchAPI;
