import { Module, ModuleEntry } from "../module";
import { AbortSignal, copyToClipboard } from "../../../utils";
import { symbolsQuery } from "../launcherUtilsInterface";

export class SymbolsModule extends Module {
  static SYMBOLS_PREFIX = "";
  static MAXIMUM_RESULTS = 3;

  constructor() {
    super("Symbols", "run-symbols");
  }

  getActive(query: string): boolean {
    return query.startsWith(SymbolsModule.SYMBOLS_PREFIX) && query.length > SymbolsModule.SYMBOLS_PREFIX.length;
  }
  async getEntries(query: string, abortSignal: AbortSignal): Promise<ModuleEntry[]> {
    query = query.slice(SymbolsModule.SYMBOLS_PREFIX.length).trim();

    const result = await symbolsQuery(query);
    if(result.error) return [];

    return result.output.slice(0, SymbolsModule.MAXIMUM_RESULTS).map(({ name, value }) => new ModuleEntry(value, name, null, () => {
      copyToClipboard(value);
    }));
  }
}