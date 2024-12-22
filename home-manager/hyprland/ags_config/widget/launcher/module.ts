export class ModuleEntry {
  constructor(
    public name: string,
    public description: string,
    public icon: string | null,
    public onClick: () => void
  ) {}
}

export abstract class Module {
  constructor(
    public name: string,
    public icon: string
  ) {}

  getActive(query: string): boolean {
    return true;
  }
  abstract getEntries(query: string): ModuleEntry[];
}