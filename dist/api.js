"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
const axios_1 = __importDefault(require("axios"));
class TwitchAPI {
    clientId;
    clientSecret;
    applicationToken;
    userToken;
    refreshToken;
    onTokenRefresh;
    constructor(clientId, clientSecret, applicationToken) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.applicationToken = applicationToken;
    }
    credentials(userToken, refreshToken, onTokenRefresh) {
        this.userToken = userToken;
        this.refreshToken = refreshToken;
        this.onTokenRefresh = onTokenRefresh;
    }
    async stream(broadcasterId) {
        try {
            const { data } = await axios_1.default.get(`https://api.twitch.tv/helix/streams?user_id=${broadcasterId}`, {
                headers: {
                    'Authorization': `Bearer ${this.userToken}`,
                    'Client-Id': this.clientId,
                }
            });
            if (Array.isArray(data.data)) {
                if (data.data.length > 0) {
                    return data.data[0];
                }
            }
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error?.response?.status === 401 || error?.response?.status === 502) {
                    await this.refresh();
                    return this.stream(broadcasterId);
                }
            }
            throw error;
        }
        return null;
    }
    async category(categoryId) {
        const { data } = await axios_1.default.get(`https://api.twitch.tv/helix/games?id=${categoryId}`, {
            headers: {
                'Authorization': `Bearer ${this.userToken}`,
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
            this.userToken = data.access_token;
            this.refreshToken = data.refresh_token;
            if (typeof this.onTokenRefresh === 'function') {
                return this.onTokenRefresh(data);
            }
            return data;
        }
        catch (error) {
            console.error(error);
            // Retry when twitch api fails
            if (axios_1.default.isAxiosError(error)) {
                if (error?.response?.status ?? 0 >= 500) {
                    // Wait a bit before retrying
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return this.refresh();
                }
            }
            throw error;
        }
    }
    async subscribe(broadcasterId, type, session) {
        try {
            await axios_1.default.post('https://api.twitch.tv/helix/eventsub/subscriptions', {
                type,
                condition: {
                    broadcaster_user_id: broadcasterId,
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
            if (axios_1.default.isAxiosError(error)) {
                if (error?.response?.status === 401 || error?.response?.status === 502) {
                    await this.refresh();
                    return this.subscribe(broadcasterId, type, session);
                }
            }
            throw error;
        }
    }
    async clips(n, broadcasterId) {
        const first = n < 100 ? n : 100;
        const max = first < 100 ? 1 : Math.ceil(n / 100);
        let clips = [];
        let pagination = null;
        try {
            for (let i = 0; i < max; i++) {
                const url = `https://api.twitch.tv/helix/clips?broadcaster_id=${broadcasterId}&first=${first}${pagination ? `&after=${pagination}` : ""}`;
                const { data } = await axios_1.default.get(url, {
                    headers: {
                        'Authorization': `Bearer ${this.userToken}`,
                        'Client-Id': this.clientId,
                    }
                });
                pagination = data.pagination?.cursor ?? null;
                if (Array.isArray(data.data)) {
                    clips = clips.concat(data.data);
                }
            }
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error?.response?.status === 401 || error?.response?.status === 502) {
                    await this.refresh();
                    return this.clips(n, broadcasterId);
                }
            }
            throw error;
        }
        return clips;
    }
    async videos(n, broadcasterId) {
        const first = n < 100 ? n : 100;
        const max = first < 100 ? 1 : Math.ceil(n / 100);
        let videos = [];
        let pagination = null;
        try {
            for (let i = 0; i < max; i++) {
                const url = `https://api.twitch.tv/helix/videos?user_id=${broadcasterId}&first=${first}${pagination ? `&after=${pagination}` : ""}`;
                const { data } = await axios_1.default.get(url, {
                    headers: {
                        'Authorization': `Bearer ${this.userToken}`,
                        'Client-Id': this.clientId,
                    }
                });
                pagination = data.pagination?.cursor ?? null;
                if (Array.isArray(data.data)) {
                    videos = videos.concat(data.data);
                }
            }
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error?.response?.status === 401 || error?.response?.status === 502) {
                    await this.refresh();
                    return this.videos(n, broadcasterId);
                }
            }
            throw error;
        }
        return videos;
    }
    async video(id) {
        const url = `https://api.twitch.tv/helix/videos?id=${id}`;
        try {
            const { data } = await axios_1.default.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.userToken}`,
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
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error?.response?.status === 401 || error?.response?.status === 502) {
                    await this.refresh();
                    return this.video(id);
                }
            }
            throw error;
        }
    }
    async user(id, identifier = 'login') {
        try {
            const { data } = await axios_1.default.get(`https://api.twitch.tv/helix/users?${identifier}=${id}`, {
                headers: {
                    'Authorization': `Bearer ${this.userToken}`,
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
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error?.response?.status === 401 || error?.response?.status === 502) {
                    await this.refresh();
                    return this.user(id, identifier);
                }
            }
            throw error;
        }
    }
    async follower(userId, broadcasterId) {
        try {
            const { data } = await axios_1.default.get(`https://api.twitch.tv/helix/channels/followers?user_id=${userId}&broadcaster_id=${broadcasterId}`, {
                headers: {
                    'Authorization': `Bearer ${this.userToken}`,
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
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error?.response?.status === 401 || error?.response?.status === 502) {
                    await this.refresh();
                    return this.follower(userId, broadcasterId);
                }
            }
            throw error;
        }
    }
}
exports.default = TwitchAPI;
