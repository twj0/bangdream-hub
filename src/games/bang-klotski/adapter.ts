import type { GameAdapter } from '../_types/game-adapter';

function withBase(url: string) {
  const base = import.meta.env.BASE_URL || '/';
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  if (url.startsWith('/')) {
    return base.replace(/\/$/, '') + url;
  }
  return base + url;
}

function createEmbeddedGame(
  pageUrl: string,
  opts?: {
    title?: string;
    subtitle?: string;
  }
) {
  const resolvedUrl = withBase(pageUrl);

  return {
    mount(container: HTMLElement) {
      const root = document.createElement('div');
      root.className = 'bdhub-embed-game';
      root.innerHTML = `
        <div class="bdhub-game-topbar">
          <div class="bdhub-game-title">
            <h2>${opts?.title ?? 'Game'}</h2>
            ${opts?.subtitle ? `<p class="bdhub-game-subtitle">${opts.subtitle}</p>` : ''}
          </div>
          <div class="bdhub-game-actions">
            <a class="bdhub-btn" href="${resolvedUrl}" target="_blank" rel="noopener noreferrer">新窗口打开</a>
          </div>
        </div>
        <div class="bdhub-embed-frame-wrap">
          <iframe class="bdhub-embed-frame" title="${opts?.title ?? 'Game'}" src="${resolvedUrl}" loading="eager" referrerpolicy="no-referrer"></iframe>
        </div>
      `;

      const frame = root.querySelector<HTMLIFrameElement>('iframe.bdhub-embed-frame');
      if (!frame) {
        throw new Error('Embed Game: iframe init failed');
      }

      // eslint-disable-next-line no-console
      console.info(`[bdhub] embed mount: ${resolvedUrl}`);
      frame.addEventListener('load', () => {
        // eslint-disable-next-line no-console
        console.info(`[bdhub] embed loaded: ${resolvedUrl}`);
      });
      frame.addEventListener('error', () => {
        // eslint-disable-next-line no-console
        console.error(`[bdhub] embed error: ${resolvedUrl}`);
      });

      container.append(root);

      return {
        unmount() {
          root.remove();
        },
      };
    },
  };
}

export function createBangKlotskiAdapter(): GameAdapter {
  const id = 'bang-klotski';
  const pageUrl = 'games/bang-klotski/index.html';

  let cleanup: (() => void) | null = null;

  return {
    id,
    name: 'BanG Klotski',
    mount(container: HTMLElement) {
      const embedded = createEmbeddedGame(pageUrl, {
        title: 'BanG Klotski',
        subtitle: '参考仓库复现版（内嵌）｜支持 GitHub Pages ｜移动端适配壳层缩放',
      });

      const { unmount } = embedded.mount(container);
      cleanup = unmount;

      // eslint-disable-next-line no-console
      console.info('[bdhub] bang-klotski assets root:', withBase('games/bang-klotski/'));
    },
    unmount() {
      cleanup?.();
      cleanup = null;
    },
  };
}
