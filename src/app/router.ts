import type { GameMeta } from '../games/_types/game-meta';
import { getGameById } from '../hub/game-registry';
import { renderHubPage } from '../hub/hub-page';

export type RouteState =
  | { type: 'hub' }
  | { type: 'game'; gameId: string };

interface RouterOptions {
  contentRoot: HTMLElement;
  onRouteChange: (state: RouteState) => void;
  games: GameMeta[];
}

export function createRouter(options: RouterOptions) {
  let currentState: RouteState = { type: 'hub' };

  const goHub = () => {
    currentState = { type: 'hub' };
    options.contentRoot.replaceChildren(renderHubPage(options.games, goGame));
    options.onRouteChange(currentState);
  };

  const goGame = (gameId: string) => {
    const game = getGameById(gameId);
    if (!game) {
      goHub();
      return;
    }
    currentState = { type: 'game', gameId };
    options.contentRoot.replaceChildren();
    options.onRouteChange(currentState);
  };

  return {
    start() {
      goHub();
    },
    goHub,
    goGame,
    getState() {
      return currentState;
    },
  };
}
