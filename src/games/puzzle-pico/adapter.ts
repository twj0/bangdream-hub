import type { GameAdapter } from '../_types/game-adapter';

type Cell = 0 | 1;

type State = {
  size: number;
  grid: Cell[];
  moves: number;
  startTs: number;
  solved: boolean;
};

function idxOf(x: number, y: number, size: number) {
  return y * size + x;
}

function cloneGrid(grid: Cell[]) {
  return grid.slice() as Cell[];
}

function toggleAt(grid: Cell[], x: number, y: number, size: number) {
  const i = idxOf(x, y, size);
  grid[i] = grid[i] === 1 ? 0 : 1;
}

function applyMove(grid: Cell[], x: number, y: number, size: number) {
  toggleAt(grid, x, y, size);
  if (x > 0) toggleAt(grid, x - 1, y, size);
  if (x < size - 1) toggleAt(grid, x + 1, y, size);
  if (y > 0) toggleAt(grid, x, y - 1, size);
  if (y < size - 1) toggleAt(grid, x, y + 1, size);
}

function isSolved(grid: Cell[]) {
  return grid.every((c) => c === 0);
}

function generatePuzzle(size: number, scrambleMoves: number) {
  const grid: Cell[] = Array.from({ length: size * size }, () => 0 as Cell);
  // 从全灭开始，做若干随机合法步，保证可解
  for (let i = 0; i < scrambleMoves; i++) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    applyMove(grid, x, y, size);
  }
  return grid;
}

export function createPuzzlePicoAdapter(): GameAdapter {
  const id = 'puzzle-pico';

  let root: HTMLDivElement | null = null;
  let cleanup: (() => void) | null = null;

  return {
    id,
    name: 'Puzzle Pico',
    mount(container: HTMLElement) {
      const localRoot = document.createElement('div');
      localRoot.className = 'bdhub-puzzle-pico';
      localRoot.innerHTML = `
        <div class="bdhub-game-topbar">
          <div class="bdhub-game-title">
            <h2>Puzzle Pico</h2>
            <p class="bdhub-game-subtitle">点击翻转 + 十字相邻，目标：全部熄灭</p>
          </div>
          <div class="bdhub-game-actions">
            <label class="bdhub-inline">
              尺寸
              <select class="bdhub-select" data-role="size">
                <option value="3">3×3</option>
                <option value="4" selected>4×4</option>
                <option value="5">5×5</option>
              </select>
            </label>
            <button class="bdhub-btn" type="button" data-role="new">新局</button>
            <button class="bdhub-btn" type="button" data-role="reset">重置</button>
          </div>
        </div>

        <div class="bdhub-puzzle-board" data-role="board" aria-label="Puzzle Board"></div>

        <div class="bdhub-game-hud">
          <div>步数：<span data-role="moves">0</span></div>
          <div>用时：<span data-role="time">0.0</span>s</div>
          <div class="bdhub-game-state" data-role="state">进行中</div>
          <div class="bdhub-game-tip">提示：按 <kbd>N</kbd> 新局，按 <kbd>R</kbd> 重置</div>
        </div>
      `;

      container.append(localRoot);
      root = localRoot;

      const board = localRoot.querySelector<HTMLDivElement>('[data-role="board"]');
      const movesEl = localRoot.querySelector<HTMLElement>('[data-role="moves"]');
      const timeEl = localRoot.querySelector<HTMLElement>('[data-role="time"]');
      const stateEl = localRoot.querySelector<HTMLElement>('[data-role="state"]');
      const sizeSel = localRoot.querySelector<HTMLSelectElement>('[data-role="size"]');
      const newBtn = localRoot.querySelector<HTMLButtonElement>('[data-role="new"]');
      const resetBtn = localRoot.querySelector<HTMLButtonElement>('[data-role="reset"]');

      if (!board || !movesEl || !timeEl || !stateEl || !sizeSel || !newBtn || !resetBtn) {
        throw new Error('Puzzle Pico: UI init failed');
      }

      const boardEl = board;
      const movesTextEl = movesEl;
      const timeTextEl = timeEl;
      const stateTextEl = stateEl;
      const sizeSelect = sizeSel;
      const newButton = newBtn;
      const resetButton = resetBtn;

      let raf = 0;
      const state: State = {
        size: Number(sizeSelect.value),
        grid: [],
        moves: 0,
        startTs: performance.now(),
        solved: false,
      };

      let initialGrid: Cell[] = [];

      function setStateText(t: string) {
        stateTextEl.textContent = t;
      }

      function updateHud() {
        movesTextEl.textContent = String(state.moves);
      }

      function render() {
        boardEl.style.setProperty('--bdhub-grid-size', String(state.size));
        boardEl.replaceChildren();

        for (let y = 0; y < state.size; y++) {
          for (let x = 0; x < state.size; x++) {
            const i = idxOf(x, y, state.size);
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'bdhub-puzzle-cell';
            cell.dataset.x = String(x);
            cell.dataset.y = String(y);
            cell.setAttribute('aria-label', `Cell ${x + 1},${y + 1}`);
            const on = state.grid[i] === 1;
            cell.classList.toggle('is-on', on);
            cell.innerHTML = `<span>${on ? '●' : '○'}</span>`;
            boardEl.append(cell);
          }
        }
      }

      function tick(ts: number) {
        if (!state.solved) {
          const sec = (ts - state.startTs) / 1000;
          timeTextEl.textContent = sec.toFixed(1);
        }
        raf = requestAnimationFrame(tick);
      }

      function newGame() {
        state.size = Number(sizeSelect.value);
        state.moves = 0;
        state.solved = false;
        state.startTs = performance.now();
        // scramble moves：随尺寸增长
        const scramble = Math.max(8, state.size * state.size);
        state.grid = generatePuzzle(state.size, scramble) as Cell[];
        initialGrid = cloneGrid(state.grid) as Cell[];
        setStateText('进行中');
        updateHud();
        render();
      }

      function resetGame() {
        state.moves = 0;
        state.solved = false;
        state.startTs = performance.now();
        state.grid = cloneGrid(initialGrid) as Cell[];
        setStateText('进行中');
        updateHud();
        render();
      }

      function handleMove(x: number, y: number) {
        if (state.solved) {
          return;
        }
        applyMove(state.grid, x, y, state.size);
        state.moves++;
        updateHud();
        render();
        if (isSolved(state.grid)) {
          state.solved = true;
          setStateText('已解！');
        }
      }

      function onBoardClick(ev: MouseEvent) {
        const target = ev.target as HTMLElement | null;
        const btn = target?.closest<HTMLButtonElement>('.bdhub-puzzle-cell');
        if (!btn) {
          return;
        }
        const x = Number(btn.dataset.x);
        const y = Number(btn.dataset.y);
        handleMove(x, y);
      }

      function onKeyDown(ev: KeyboardEvent) {
        if (ev.key === 'n' || ev.key === 'N') {
          ev.preventDefault();
          newGame();
        }
        if (ev.key === 'r' || ev.key === 'R') {
          ev.preventDefault();
          resetGame();
        }
      }

      sizeSelect.addEventListener('change', () => newGame());
      newButton.addEventListener('click', () => newGame());
      resetButton.addEventListener('click', () => resetGame());
      boardEl.addEventListener('click', onBoardClick);
      window.addEventListener('keydown', onKeyDown);

      newGame();
      raf = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(raf);
        boardEl.removeEventListener('click', onBoardClick);
        window.removeEventListener('keydown', onKeyDown);
        newButton.replaceWith(newButton.cloneNode(true));
        resetButton.replaceWith(resetButton.cloneNode(true));
        sizeSelect.replaceWith(sizeSelect.cloneNode(true));
      };
    },
    unmount() {
      cleanup?.();
      cleanup = null;
      root?.remove();
      root = null;
    },
  };
}
