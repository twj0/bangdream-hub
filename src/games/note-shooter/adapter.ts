import type { GameAdapter } from '../_types/game-adapter';

function withBase(url: string) {
  // GitHub Pages 下常见 base 为 /<repo>/，这里自动前缀，避免 iframe 走错根路径
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

      // debug: 记录实际加载URL（便于排查GitHub Pages base路径等问题）
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

export function createNoteShooterAdapter(): GameAdapter {
  const id = 'note-shooter';
  const pageUrl = 'games/bangdream/index.html';

  let root: HTMLDivElement | null = null;
  let cleanup: (() => void) | null = null;

  return {
    id,
    name: 'Note Shooter',
    mount(container: HTMLElement) {
      // 直接内嵌参考实现，保证画风/资源1:1
      const embedded = createEmbeddedGame(pageUrl, {
        title: '音符射手 元祖BanG Dream',
        subtitle: '参考仓库复现版（内嵌）｜移动端已适配壳层缩放',
      });

      const { unmount } = embedded.mount(container);

      // 保持旧的adapter接口形态
      root = null;
      cleanup = unmount;

      // eslint-disable-next-line no-console
      console.info('[bdhub] bangdream assets root:', withBase('assets/bangdream/img/'));
    },
    unmount() {
      cleanup?.();
      cleanup = null;
      root?.remove();
      root = null;
    },
  };
}
