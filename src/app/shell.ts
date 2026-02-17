import { createRouter, type RouteState } from './router';
import { getAllGames, getGameById } from '../hub/game-registry';
import type { GameAdapter } from '../games/_types/game-adapter';

export function createShellApp(mountPoint: HTMLElement) {
  const root = document.createElement('div');
  root.className = 'bdhub-shell';

  const header = document.createElement('header');
  header.className = 'bdhub-shell-header';

  const title = document.createElement('div');
  title.className = 'bdhub-shell-title';
  title.textContent = 'Bangdream Hub';

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'bdhub-back-button';
  backButton.textContent = '返回 Hub';
  backButton.hidden = true;

  header.append(title, backButton);

  const content = document.createElement('main');
  content.className = 'bdhub-shell-content';

  root.append(header, content);
  mountPoint.replaceChildren(root);

  const games = getAllGames();
  let runningAdapter: GameAdapter | null = null;

  const router = createRouter({
    contentRoot: content,
    games,
    onRouteChange: async (state) => {
      await handleRouteChange(state);
    },
  });

  backButton.addEventListener('click', () => {
    void router.goHub();
  });

  async function safeUnmountRunningGame() {
    if (!runningAdapter) {
      return;
    }

    const current = runningAdapter;
    runningAdapter = null;
    await Promise.resolve(current.unmount());
    content.replaceChildren();
  }

  async function handleRouteChange(state: RouteState) {
    if (state.type === 'hub') {
      backButton.hidden = true;
      await safeUnmountRunningGame();
      return;
    }

    backButton.hidden = false;
    await safeUnmountRunningGame();

    const game = getGameById(state.gameId);
    if (!game) {
      router.goHub();
      return;
    }

    try {
      runningAdapter = game.adapter;
      await Promise.resolve(runningAdapter.mount(content));
    } catch (error) {
      console.error('[bdhub] 游戏加载失败：', error);
      await safeUnmountRunningGame();
      router.goHub();
    }
  }

  return {
    start() {
      router.start();
    },
  };
}
