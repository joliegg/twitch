import url from 'url';

import axios from 'axios';

import {
  CategoriesResponse,
  Clip,
  ClipsResponse,
  StreamsResponse,
  TokenResponse,
  Video,
  VideosResponse,
  Stream,
  User,
  UsersResponse,
  Follower,
  FollowersResponse,
  Category
} from './types';

class TwitchAPI {
  private clientId?: string;
  private clientSecret?: string;

  private applicationToken?: string;
  private userToken?: string;
  private refreshToken?: string;


  private onTokenRefresh?: (data: TokenResponse) => Promise<TokenResponse>;

  constructor (clientId: string, clientSecret: string, applicationToken: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.applicationToken = applicationToken;
  }

  credentials (userToken: string, refreshToken: string, onTokenRefresh?: (data: TokenResponse) => Promise<TokenResponse>) {
    this.userToken = userToken;
    this.refreshToken = refreshToken;
    this.onTokenRefresh = onTokenRefresh;

    return this.refresh();
  }


  async streams (n: number, broadcasterId: string): Promise<Stream[]> {
    const first = n < 100 ? n : 100;
    const max = first < 100 ? 1 : Math.ceil(n / 100);

    let streams: Stream[] = []

    let pagination: string | null = null;

    try {
      for (let i = 0; i < max; i++) {
        const url: string = `https://api.twitch.tv/helix/streams?user_id=${broadcasterId}&first=${first}${pagination ? `&after=${pagination}` : ""}`;

        const { data } = await axios.get<StreamsResponse>(url, {
          headers: {
            'Authorization': `Bearer ${this.userToken}`,
            'Client-Id': this.clientId,
          }
        });

        pagination = data.pagination?.cursor ?? null;

        if (Array.isArray(data.data)) {
          streams = streams.concat(data.data);
        }
      }

      return streams;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error?.response?.status === 401 || error?.response?.status === 502) {
          await this.refresh();
          return this.streams(n, broadcasterId);
        }
      }
      throw error;
    }
  }

  async stream (broadcasterId: string): Promise<Stream | null> {
    try {
      const { data } = await axios.get<StreamsResponse>(`https://api.twitch.tv/helix/streams?user_id=${broadcasterId}`, {
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
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error?.response?.status === 401 || error?.response?.status === 502) {
          await this.refresh();
          return this.stream(broadcasterId);
        }
      }
      throw error;
    }

    return null;
  }

  async category (categoryId: string): Promise<Category | null> {
    try {
      const { data } = await axios.get<CategoriesResponse>(`https://api.twitch.tv/helix/games?id=${categoryId}`, {
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
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error?.response?.status === 401 || error?.response?.status === 502) {
          await this.refresh();
          return this.category(categoryId);
        }
      }
      throw error;
    }

    return null;
  }

  async refresh (): Promise<TokenResponse> {
    const params = new url.URLSearchParams({
      client_id: this.clientId ?? '',
      client_secret: this.clientSecret ?? '',
      grant_type: 'refresh_token',
      refresh_token: encodeURIComponent(this.refreshToken ?? '')
    });


    try {
      const { data } = await axios.post<TokenResponse>('https://id.twitch.tv/oauth2/token', params.toString(),
      {
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
    } catch (error) {
      console.error(error);

      // Retry when twitch api fails
      if (axios.isAxiosError(error)) {
        if (error?.response?.status ?? 0 >= 500) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
          return this.refresh();
        }
      }

      throw error;
    }
  }


  async subscribe (broadcasterId: string, type: string, session: string, conditions: Record<string, string | number> = {}, version = 1): Promise<void> {
    try {
      await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', {
        type,
        condition: {
          broadcaster_user_id: broadcasterId,
          ...conditions,
        },
        version: version,
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
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error?.response?.status === 401 || error?.response?.status === 502) {
          await this.refresh();
          return this.subscribe(broadcasterId, type, session);
        }
      }

      throw error;
    }
  }

  async clips (n: number, broadcasterId: string): Promise<Clip[]>  {
    const first = n < 100 ? n : 100;
    const max = first < 100 ? 1 : Math.ceil(n / 100);

    let clips: Clip[] = []

    let pagination: string | null = null;

    try {
      for (let i = 0; i < max; i++) {
        const url: string = `https://api.twitch.tv/helix/clips?broadcaster_id=${broadcasterId}&first=${first}${pagination ? `&after=${pagination}` : ""}`;

        const { data } = await axios.get<ClipsResponse>(url, {
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

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error?.response?.status === 401 || error?.response?.status === 502) {
          await this.refresh();
          return this.clips(n, broadcasterId);
        }
      }
      throw error;
    }

    return clips;
  }

  async videos (n: number, broadcasterId: string): Promise<Video[]> {
    const first = n < 100 ? n : 100;
    const max = first < 100 ? 1 : Math.ceil(n / 100);

    let videos: Video[] = []

    let pagination: string | null = null;

    try {
      for (let i = 0; i < max; i++) {
        const url: string = `https://api.twitch.tv/helix/videos?user_id=${broadcasterId}&first=${first}${pagination ? `&after=${pagination}` : ""}`;

        const { data } = await axios.get<VideosResponse>(url, {
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
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error?.response?.status === 401 || error?.response?.status === 502) {
          await this.refresh();
          return this.videos(n, broadcasterId);
        }
      }
      throw error;
    }

    return videos;
  }

  async video (id: string): Promise<Video | null> {
    const url: string = `https://api.twitch.tv/helix/videos?id=${id}`;

    try {
      const { data } = await axios.get<VideosResponse>(url, {
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
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error?.response?.status === 401 || error?.response?.status === 502) {
          await this.refresh();
          return this.video(id);
        }
      }
      throw error;
    }
  }

  async user (id: string, identifier: string = 'login'): Promise<User | null> {
    try {
      const { data } = await axios.get<UsersResponse>(`https://api.twitch.tv/helix/users?${identifier}=${id}`, {
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
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error?.response?.status === 401 || error?.response?.status === 502) {
          await this.refresh();
          return this.user(id, identifier);
        }
      }
      throw error;
    }
  }

  async follower (userId: string, broadcasterId: string): Promise<Follower | null> {
    try {
      const { data } = await axios.get<FollowersResponse>(`https://api.twitch.tv/helix/channels/followers?user_id=${userId}&broadcaster_id=${broadcasterId}`, {
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
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error?.response?.status === 401 || error?.response?.status === 502) {
          await this.refresh();
          return this.follower(userId, broadcasterId);
        }
      }
      throw error;
    }
  }
}

export default TwitchAPI;