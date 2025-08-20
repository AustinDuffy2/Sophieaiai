export interface Caption {
  id: number;
  text: string;
  startTime: number;
  endTime: number;
}

export interface VideoInfo {
  id: string;
  title: string;
  url: string;
  captions: Caption[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  stats: {
    videosWatched: number;
    captionsGenerated: number;
    watchTime: string;
  };
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}
