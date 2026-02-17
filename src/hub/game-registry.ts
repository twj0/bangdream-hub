import type { GameMeta } from '../games/_types/game-meta';
import { createNoteShooterAdapter } from '../games/note-shooter/adapter';
import { createPuzzlePicoAdapter } from '../games/puzzle-pico/adapter';
import { createBangKlotskiAdapter } from '../games/bang-klotski/adapter';

const gameMetas: GameMeta[] = [
  {
    id: 'note-shooter',
    title: 'Note Shooter',
    description: '别笑，你也过不了第二关。',
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
    description: '邦邦俄罗斯方块。',
    tags: ['puzzle', 'logic'],
    sourceRepo: {
      name: 'hamzaabamboo/pazuru-pico',
      url: 'https://github.com/hamzaabamboo/pazuru-pico',
    },
    adapter: createPuzzlePicoAdapter(),
  },
  {
    id: 'bang-klotski',
    title: 'BanG Klotski',
    description: '邦邦华容道，移动方块让角色逃出。',
    tags: ['puzzle', 'klotski'],
    sourceRepo: {
      name: 'BanGKlotski (local reference)',
      url: '',
    },
    adapter: createBangKlotskiAdapter(),
  },
];

export function getAllGames(): GameMeta[] {
  return gameMetas;
}

export function getGameById(gameId: string): GameMeta | undefined {
  return gameMetas.find((game) => game.id === gameId);
}
