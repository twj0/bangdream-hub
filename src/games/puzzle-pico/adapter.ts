import type { GameAdapter } from '../_types/game-adapter';

function createEmbeddedGame(
  pageUrl: string,
  opts?: {
    title?: string;
    subtitle?: string;
  }
) {
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
            <a class="bdhub-btn" href="${pageUrl}" target="_blank" rel="noopener noreferrer">新窗口打开</a>
          </div>
        </div>
        <div class="bdhub-embed-frame-wrap">
          <iframe class="bdhub-embed-frame" title="${opts?.title ?? 'Game'}" src="${pageUrl}" loading="eager" referrerpolicy="no-referrer"></iframe>
        </div>
      `;

      const frame = root.querySelector<HTMLIFrameElement>('iframe.bdhub-embed-frame');
      if (!frame) {
        throw new Error('Embed Game: iframe init failed');
      }

      // eslint-disable-next-line no-console
      console.info(`[bdhub] embed mount: ${pageUrl}`);
      frame.addEventListener('load', () => {
        // eslint-disable-next-line no-console
        console.info(`[bdhub] embed loaded: ${pageUrl}`);
      });
      frame.addEventListener('error', () => {
        // eslint-disable-next-line no-console
        console.error(`[bdhub] embed error: ${pageUrl}`);
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

export function createPuzzlePicoAdapter(): GameAdapter {
  const id = 'puzzle-pico';
  // 参考仓库的源码 index.ts 依赖 bundler，直接 iframe 打开会报“import statement outside a module”。
  // 这里切换到仓库的线上 GitHub Pages 版本以保证 1:1 画风。
  const pageUrl = 'https://hamzaabamboo.github.io/pazuru-pico/';

  let root: HTMLDivElement | null = null;
  let cleanup: (() => void) | null = null;

  return {
    id,
    name: 'Puzzle Pico',
    mount(container: HTMLElement) {
      const embedded = createEmbeddedGame(pageUrl, {
        title: 'パズル⭐︎ピコ | Puzzle * Pico',
        subtitle: '参考仓库线上版（内嵌）｜移动端已适配壳层缩放',
      });

      const { unmount } = embedded.mount(container);
      root = null;
      cleanup = unmount;

      // eslint-disable-next-line no-console
      console.info('[bdhub] pazuru-pico embed url:', pageUrl);
    },
    unmount() {
      cleanup?.();
      cleanup = null;
      root?.remove();
      root = null;
    },
  };
}
