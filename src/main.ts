import './styles/base.css';
import './styles/hub.css';
import './styles/game-shell.css';
import { createShellApp } from './app/shell';

const mountPoint = document.querySelector<HTMLElement>('#app');

if (!mountPoint) {
  throw new Error('缺少 #app 挂载节点');
}

createShellApp(mountPoint).start();
