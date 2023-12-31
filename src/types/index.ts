export interface Pagination {
  cursor: string;
}

export interface Stream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  tags: string[];
  is_mature: boolean;
}

export interface StreamsResponse {
  data: Stream[];
  pagination?: Pagination;
}
export interface Clip {
  id: string;
  url: string;
  embed_url: string;
  broadcaster_id: string;
  broadcaster_name: string;
  creator_id: string;
  creator_name: string;
  video_id: string;
  game_id: string;
  language: string;
  title: string;
  view_count: number
  created_at: string;
  thumbnail_url: string;
  duration: number;
  vod_offset: number;
}



export interface ClipsResponse {
  data: Clip[];
  pagination?: Pagination;
}

export interface Category {
  id: string;
  name: string;
  box_art_url: string;
  igdb_id: string;
}

export interface CategoriesResponse {
  data: Category[];
  pagination?: Pagination;
}

export interface TokenResponse {
  access_token: string;
  expires_in: string;
  refresh_token: string;
  scope: string[];
  token_type: string;
}

export interface StreamOnlineEvent {
  id: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  type: string;
  started_at: string;
}

export interface StreamOfflineEvent {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
}

export interface ChannelUpdateEvent {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  title: string;
  language: string;
  category_id: string;
  category_name: string;
  content_classification_labels: string[];
}

export interface Message {
  metadata: {
    message_id: string;
    message_type: string;
    message_timestamp: string;
  };
  payload: object;
}

export interface WelcomeMessage extends Message {
  payload: {
    session: {
      id: string;
      status: string;
      keepalive_timeout_seconds: number;
      reconnect_url: string | null;
      connected_at: string;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface KeepAliveMessage extends Message {}

export interface ReconnectMessage extends Message {
  payload: {
    session: {
      id: string;
      status: string;
      keepalive_timeout_seconds: number;
      reconnect_url: string | null;
      connected_at: string;
    }
  }
}

export interface NotificationMessage extends Message {
  metadata: {
    message_id: string;
    message_type: string;
    message_timestamp: string;
    subscription_type: string;
    subscription_version: string;
  };
  payload: {
    subscription: {
      id: string;
      status: string;
      type: string;
      version: string;
      cost: string;
      condition: {
        broadcaster_user_id: string;
      };
      transport: {
        method: string;
        sessin_id: string;
      };
      created_at: string;
    },
    event?: StreamOnlineEvent |  StreamOfflineEvent | ChannelUpdateEvent;
  };
}

export interface Video {
  id: string;
  stream_id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  created_at: string;
  published_at: string;
  url: string;
  thumbnail_url: string;
  viewable: string;
  view_count: number;
  language: string;
  type: string;
  duration: string;
  muted_segments: null | {
    duration: number;
    offset: number;
  };
}

export interface VideosResponse {
  data: Video[];
  pagination?: Pagination;
}

export interface User {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  email?: string;
  created_at: string;
}

export interface UsersResponse {
  data: User[];
}

export interface Follow {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  followed_at: string;
}

export interface FollowsResponse {
  total: number;
  data: Follow[];
  pagination?: Pagination;
}

export interface Follower {
  user_id: string;
  broadcaster_id: string;
  user_login: string;
  followed_at: string;
}

export interface FollowersResponse {
  total: number;
  data: Follower[];
  pagination?: Pagination;
}

export interface ChatbotOptions {
  identity: {
    username: string;
    password: string;
  };
  channels: string[];
}