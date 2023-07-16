import url from 'url';

import axios from 'axios';

import { CategoriesResponse, Clip, ClipsResponse, StreamsResponse, TokenResponse, Video, VideosResponse } from './types/types';

class TwitchAPI {
  broadcasterId?: string;


  private clientId?: string;
  private clientSecret?: string;

  private applicationToken?: string;
  private userToken?: string;
  private refreshToken?: string;


  private onTokenRefresh?: (newToken: string) => Promise<void>;

  constructor (broadcasterId: string, clientId: string, clientSecret: string, applicationToken: string) {
    this.broadcasterId = broadcasterId;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.applicationToken = applicationToken;
  }


  credentials (userToken: string, refreshToken: string, onTokenRefresh?: (newToken: string) => Promise<void>) {
    this.userToken = userToken;
    this.refreshToken = refreshToken;
    this.onTokenRefresh = onTokenRefresh;
  }


  async stream () {
    const { data } = await axios.get<StreamsResponse>(`https://api.twitch.tv/helix/streams?user_id=${this.broadcasterId}`, {
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

  async category (categoryId: string) {
    const { data } = await axios.get<CategoriesResponse>(`https://api.twitch.tv/helix/games?id=${categoryId}`, {
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

  async refresh () {

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

      return data;

    } catch (error) {
      console.error(error);
    }

  }


  async subscribe (type: string, session: string): Promise<void> {
    try {
      await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', {
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
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        if (error.response && error.response.status === 401) {

          const newToken = await this.refresh();

          if (newToken) {
            if (typeof this.onTokenRefresh === 'function') {
              await this.onTokenRefresh(newToken.access_token);
            }


            return this.subscribe(type, session);
          }

        }
      }

    }
  }

  async clips (n: number)  {
    const first = n < 100 ? n : 100;
    const max = first < 100 ? 1 : Math.ceil(n / 100);

    let clips: Clip[] = []

    let pagination: string | null = null;

    for (let i = 0; i < max; i++) {
      const url: string = `https://api.twitch.tv/helix/clips?broadcaster_id=${this.broadcasterId}&first=${first}${pagination ? `&after=${pagination}` : ""}`;

      const { data } = await axios.get<ClipsResponse>(url, {
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

  async videos (n: number) {
    const first = n < 100 ? n : 100;
    const max = first < 100 ? 1 : Math.ceil(n / 100);

    let videos: Video[] = []

    let pagination: string | null = null;

    for (let i = 0; i < max; i++) {
      const url: string = `https://api.twitch.tv/helix/videos?user_id=${this.broadcasterId}&first=${first}${pagination ? `&after=${pagination}` : ""}`;

      const { data } = await axios.get<VideosResponse>(url, {
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

export default TwitchAPI;