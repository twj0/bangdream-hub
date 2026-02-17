import type { GameAdapter } from './game-adapter';

export interface GameMeta {
  id: string;
  title: string;
  description: string;
  cover?: string;
  tags?: string[];

  /** Upstream/original repository attribution */
  sourceRepo?: {
    name: string;
    url: string;
  };

  adapter: GameAdapter;
}
