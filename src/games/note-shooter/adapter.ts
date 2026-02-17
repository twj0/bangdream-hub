import type { GameAdapter } from '../_types/game-adapter';

type Difficulty = 'easy' | 'normal' | 'hard';

type Note = {
  id: number;
  lane: number;
  y: number;
  hit: boolean;
};

export function createNoteShooterAdapter(): GameAdapter {
  const id = 'note-shooter';

  let root: HTMLDivElement | null = null;
  let cleanup: (() => void) | null = null;

  return {
    id,
    name: 'Note Shooter',
    mount(container: HTMLElement) {
      const localRoot = document.createElement('div');
      localRoot.className = 'bdhub-note-shooter';
      localRoot.innerHTML = `
        <div class="bdhub-game-topbar">
          <div class="bdhub-game-title">
            <h2>Note Shooter</h2>
            <p class="bdhub-game-subtitle">按 <kbd>F</kbd> / <kbd>J</kbd> 击中下落音符</p>
          </div>
          <div class="bdhub-game-actions">
            <label class="bdhub-inline">
              难度
              <select class="bdhub-select" data-role="difficulty">
                <option value="easy">Easy</option>
                <option value="normal" selected>Normal</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <button class="bdhub-btn" type="button" data-role="start">开始</button>
            <button class="bdhub-btn" type="button" data-role="restart" disabled>重开</button>
          </div>
        </div>

        <div class="bdhub-note-stage" tabindex="0" aria-label="Note Shooter Stage">
          <div class="bdhub-note-lanes">
            <div class="bdhub-note-lane" data-lane="0"></div>
            <div class="bdhub-note-lane" data-lane="1"></div>
          </div>
          <div class="bdhub-note-hitline">
            <div class="bdhub-note-hitbox" data-lane="0"><span>F</span></div>
            <div class="bdhub-note-hitbox" data-lane="1"><span>J</span></div>
          </div>
        </div>

        <div class="bdhub-game-hud">
          <div>分数：<span data-role="score">0</span></div>
          <div>连击：<span data-role="combo">0</span></div>
          <div>失误：<span data-role="miss">0</span></div>
          <div>剩余：<span data-role="time">30.0</span>s</div>
          <div class="bdhub-game-state" data-role="state">待机</div>
        </div>
      `;

      container.append(localRoot);
      root = localRoot;

      const stage = localRoot.querySelector<HTMLDivElement>('.bdhub-note-stage');
      const lanesEl = Array.from(localRoot.querySelectorAll<HTMLDivElement>('.bdhub-note-lane'));

      const scoreEl = localRoot.querySelector<HTMLElement>('[data-role="score"]');
      const comboEl = localRoot.querySelector<HTMLElement>('[data-role="combo"]');
      const missEl = localRoot.querySelector<HTMLElement>('[data-role="miss"]');
      const timeEl = localRoot.querySelector<HTMLElement>('[data-role="time"]');
      const stateEl = localRoot.querySelector<HTMLElement>('[data-role="state"]');

      const startBtn = localRoot.querySelector<HTMLButtonElement>('[data-role="start"]');
      const restartBtn = localRoot.querySelector<HTMLButtonElement>('[data-role="restart"]');
      const difficultySel = localRoot.querySelector<HTMLSelectElement>('[data-role="difficulty"]');

      if (
        !stage ||
        lanesEl.length !== 2 ||
        !scoreEl ||
        !comboEl ||
        !missEl ||
        !timeEl ||
        !stateEl ||
        !startBtn ||
        !restartBtn ||
        !difficultySel
      ) {
        throw new Error('Note Shooter: UI init failed');
      }

      // Narrow types for TS
      const stageEl = stage;
      const laneEls = lanesEl as [HTMLDivElement, HTMLDivElement];
      const scoreTextEl = scoreEl;
      const comboTextEl = comboEl;
      const missTextEl = missEl;
      const timeTextEl = timeEl;
      const stateTextEl = stateEl;
      const startButton = startBtn;
      const restartButton = restartBtn;
      const difficultySelect = difficultySel;

      let running = false;
      let raf = 0;
      let lastTs = 0;
      let spawnAcc = 0;
      let nextId = 1;

      let score = 0;
      let combo = 0;
      let miss = 0;
      let timeLeft = 30_000; // ms

      const notes: Note[] = [];
      const noteEls = new Map<number, HTMLDivElement>();

      function getParams(diff: Difficulty) {
        switch (diff) {
          case 'easy':
            return { speed: 220, spawnEvery: 700, hitWindow: 34 };
          case 'hard':
            return { speed: 360, spawnEvery: 380, hitWindow: 28 };
          default:
            return { speed: 290, spawnEvery: 520, hitWindow: 32 };
        }
      }

      function setHud() {
        scoreTextEl.textContent = String(score);
        comboTextEl.textContent = String(combo);
        missTextEl.textContent = String(miss);
        timeTextEl.textContent = (timeLeft / 1000).toFixed(1);
      }

      function setState(text: string) {
        stateTextEl.textContent = text;
      }

      function clearNotes() {
        for (const el of noteEls.values()) {
          el.remove();
        }
        noteEls.clear();
        notes.length = 0;
      }

      function stopGame(finalState: string) {
        running = false;
        cancelAnimationFrame(raf);
        setState(finalState);
        restartButton.disabled = false;
        startButton.disabled = false;
      }

      function resetGame() {
        score = 0;
        combo = 0;
        miss = 0;
        timeLeft = 30_000;
        nextId = 1;
        spawnAcc = 0;
        lastTs = 0;
        clearNotes();
        setHud();
        setState('待机');
      }

      function spawnNote() {
        const lane = Math.random() < 0.5 ? 0 : 1;
        const n: Note = { id: nextId++, lane, y: -18, hit: false };
        notes.push(n);

        const el = document.createElement('div');
        el.className = 'bdhub-note';
        el.dataset.noteId = String(n.id);
        lanesEl[lane].append(el);
        noteEls.set(n.id, el);
      }

      function update(dt: number) {
        if (!running) {
          return;
        }

        const diff = difficultySelect.value as Difficulty;
        const { speed, spawnEvery, hitWindow } = getParams(diff);

        timeLeft = Math.max(0, timeLeft - dt);
        spawnAcc += dt;

        while (spawnAcc >= spawnEvery) {
          spawnAcc -= spawnEvery;
          spawnNote();
        }

        // stage尺寸：命中线在底部附近
        const stageRect = stageEl.getBoundingClientRect();
        const laneRect = laneEls[0].getBoundingClientRect();
        const stageH = Math.max(200, stageRect.height);
        const laneH = Math.max(200, laneRect.height);

        // 命中线位置（相对 lanes 容器）
        const hitY = Math.min(laneH - 42, stageH - 42);

        for (let i = notes.length - 1; i >= 0; i--) {
          const n = notes[i];
          n.y += (speed * dt) / 1000;
          const el = noteEls.get(n.id);
          if (el) {
            el.style.transform = `translateY(${n.y}px)`;
            const delta = Math.abs(n.y - hitY);
            el.classList.toggle('is-near', delta <= hitWindow);
          }

          if (n.y > hitY + hitWindow + 40 && !n.hit) {
            // miss
            miss++;
            combo = 0;
            setHud();
            const remove = noteEls.get(n.id);
            remove?.remove();
            noteEls.delete(n.id);
            notes.splice(i, 1);
          } else if (n.y > laneH + 80) {
            const remove = noteEls.get(n.id);
            remove?.remove();
            noteEls.delete(n.id);
            notes.splice(i, 1);
          }
        }

        setHud();

        if (timeLeft <= 0) {
          stopGame(`结束：${score} 分`);
        }
      }

      function frame(ts: number) {
        if (!running) {
          return;
        }
        if (!lastTs) {
          lastTs = ts;
        }
        const dt = Math.min(50, ts - lastTs);
        lastTs = ts;
        update(dt);
        raf = requestAnimationFrame(frame);
      }

      function tryHit(lane: number) {
        if (!running) {
          return;
        }

        const diff = difficultySelect.value as Difficulty;
        const { hitWindow } = getParams(diff);

        const laneRect = lanesEl[lane].getBoundingClientRect();
        const laneH = Math.max(200, laneRect.height);
        const hitY = Math.min(laneH - 42, laneH - 42);

        // 找同 lane 最接近 hitY 的 note
        let bestIdx = -1;
        let bestDelta = Infinity;
        for (let i = 0; i < notes.length; i++) {
          const n = notes[i];
          if (n.lane !== lane || n.hit) {
            continue;
          }
          const d = Math.abs(n.y - hitY);
          if (d < bestDelta) {
            bestDelta = d;
            bestIdx = i;
          }
        }

        if (bestIdx >= 0 && bestDelta <= hitWindow) {
          const n = notes[bestIdx];
          n.hit = true;
          score += 100 + combo * 2;
          combo++;
          setHud();

          const el = noteEls.get(n.id);
          if (el) {
            el.classList.add('is-hit');
            el.addEventListener(
              'transitionend',
              () => {
                el.remove();
              },
              { once: true }
            );
          }
          noteEls.delete(n.id);
          notes.splice(bestIdx, 1);
        } else {
          miss++;
          combo = 0;
          setHud();
        }
      }

      function onKeyDown(ev: KeyboardEvent) {
        if (ev.key === 'f' || ev.key === 'F') {
          ev.preventDefault();
          tryHit(0);
        }
        if (ev.key === 'j' || ev.key === 'J') {
          ev.preventDefault();
          tryHit(1);
        }
        if (ev.key === 'r' || ev.key === 'R') {
          if (!restartButton.disabled) {
            restartButton.click();
          }
        }
      }

      function startGame() {
        resetGame();
        running = true;
        startButton.disabled = true;
        restartButton.disabled = true;
        setState('进行中');
        stageEl.focus();
        raf = requestAnimationFrame(frame);
      }

      function restartGame() {
        stopGame('重开中');
        startGame();
      }

      startButton.addEventListener('click', startGame);
      restartButton.addEventListener('click', restartGame);

      stageEl.addEventListener('pointerdown', (ev) => {
        // 点击左右半屏当作击打
        const rect = stageEl.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        tryHit(x < rect.width / 2 ? 0 : 1);
      });

      window.addEventListener('keydown', onKeyDown);

      resetGame();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('keydown', onKeyDown);
        startButton.removeEventListener('click', startGame);
        restartButton.removeEventListener('click', restartGame);
        clearNotes();
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
