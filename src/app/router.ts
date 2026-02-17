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

function getRouteFromLocation(): RouteState {
  const raw = window.location.pathname.replace(/\/+$/, '');
  const seg = raw.split('/').filter(Boolean).pop() ?? '';

  if (!seg) {
    return { type: 'hub' };
  }

  // 允许直接用 /shoot /pazuru 这类短路径
  const alias: Record<string, string> = {
    shoot: 'note-shooter',
    pazuru: 'puzzle-pico',
  };

  const mapped = alias[seg] ?? seg;
  if (getGameById(mapped)) {
    return { type: 'game', gameId: mapped };
  }

  return { type: 'hub' };
}

export function createRouter(options: RouterOptions) {
  let currentState: RouteState = { type: 'hub' };

  const goHub = () => {
    currentState = { type: 'hub' };
    window.history.pushState({}, '', './');
    options.contentRoot.replaceChildren(renderHubPage(options.games, goGame));
    options.onRouteChange(currentState);
  };

  const goGame = (gameId: string) => {
    const game = getGameById(gameId);
    if (!game) {
      goHub();
      return;
    }

    // 统一把 url 变成短路径（方便分享/扩展更多小游戏）
    const aliasById: Record<string, string> = {
      'note-shooter': 'shoot',
      'puzzle-pico': 'pazuru',
    };
    const path = aliasById[gameId] ?? gameId;

    currentState = { type: 'game', gameId };
    window.history.pushState({}, '', `./${path}`);
    options.contentRoot.replaceChildren();
    options.onRouteChange(currentState);
  };

  window.addEventListener('popstate', () => {
    currentState = getRouteFromLocation();
    if (currentState.type === 'hub') {
      options.contentRoot.replaceChildren(renderHubPage(options.games, goGame));
    } else {
      options.contentRoot.replaceChildren();
    }
    options.onRouteChange(currentState);
  });

  return {
    start() {
      currentState = getRouteFromLocation();
      if (currentState.type === 'hub') {
        goHub();
        return;
      }
      // 进入某个游戏页
      options.contentRoot.replaceChildren();
      options.onRouteChange(currentState);
    },
    goHub,
    goGame,
    getState() {
      return currentState;
    },
  };
}
