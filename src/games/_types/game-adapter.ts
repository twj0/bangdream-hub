export interface GameAdapter {
  id: string;
  name: string;
  mount(container: HTMLElement): Promise<void> | void;
  unmount(): Promise<void> | void;
  pause?(): void;
  resume?(): void;
}
