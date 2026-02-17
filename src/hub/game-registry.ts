import type { GameMeta } from '../games/_types/game-meta';
import { createNoteShooterAdapter } from '../games/note-shooter/adapter';
import { createPuzzlePicoAdapter } from '../games/puzzle-pico/adapter';

const gameMetas: GameMeta[] = [
  {
    id: 'note-shooter',
    title: 'Note Shooter',
    description: '按 F/J 击中下落音符，30 秒冲分。',
    tags: ['music', 'reaction'],
    sourceRepo: {
      name: 'zfkdiyi/bangdream',
      url: 'https://github.com/zfkdiyi/bangdream',
    },
    adapter: createNoteShooterAdapter(),
  },
  {
    id: 'puzzle-pico',
    title: 'Puzzle Pico',
    description: '点击翻转网格，把所有灯变成关闭。',
    tags: ['puzzle', 'logic'],
    sourceRepo: {
      name: 'hamzaabamboo/pazuru-pico',
      url: 'https://github.com/hamzaabamboo/pazuru-pico',
    },
    adapter: createPuzzlePicoAdapter(),
  },
];

export function getAllGames(): GameMeta[] {
  return gameMetas;
}

export function getGameById(gameId: string): GameMeta | undefined {
  return gameMetas.find((game) => game.id === gameId);
}
