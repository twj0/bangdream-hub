import type { GameMeta } from '../games/_types/game-meta';

function escapeHtml(text: string) {
  // avoid String.prototype.replaceAll for lower TS lib targets
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderHubPage(games: GameMeta[], onSelect: (id: string) => void): HTMLElement {
  const page = document.createElement('section');
  page.className = 'bdhub-hub-page';

  const title = document.createElement('h1');
  title.className = 'bdhub-hub-title';
  title.textContent = 'Bangdream Hub';

  const grid = document.createElement('div');
  grid.className = 'bdhub-game-grid';

  games.forEach((game) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'bdhub-game-card';

    const source = game.sourceRepo
      ? `<a class="bdhub-game-source" href="${escapeHtml(game.sourceRepo.url)}" target="_blank" rel="noreferrer">源仓库：${escapeHtml(game.sourceRepo.name)}</a>`
      : '';

    card.innerHTML = `
      <h2>${escapeHtml(game.title)}</h2>
      <p>${escapeHtml(game.description)}</p>
      <small>${escapeHtml((game.tags ?? []).join(' · '))}</small>
      ${source}
    `;

    // allow clicking the source link without entering the game
    card.addEventListener('click', (ev) => {
      const target = ev.target as HTMLElement | null;
      if (target?.closest('a')) {
        return;
      }
      onSelect(game.id);
    });

    grid.append(card);
  });

  const footer = document.createElement('footer');
  footer.className = 'bdhub-hub-footer';
  footer.innerHTML = `
    <small>
      本站为前端聚合壳，小游戏版权/来源以各源仓库为准。
    </small>
  `;

  page.append(title, grid, footer);
  return page;
}
