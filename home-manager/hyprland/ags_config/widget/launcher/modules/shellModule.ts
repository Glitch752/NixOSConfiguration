import { Module, ModuleEntry } from "../module";
import { AbortSignal } from "../../../utils";
import { execAsync, GLib } from "astal";

function findTerminal(): string | null {
  const terminals = ["kitty", "alacritty", "terminator"];
  for(const term of terminals) {
    if(GLib.find_program_in_path(term)) return term;
  }
  return null;
}

export class ShellModule extends Module {
  static SHELL_QUERY_PREFIX = "$ ";
  static TERMINAL = findTerminal();

  constructor() {
    if(!ShellModule.TERMINAL) {
      console.warn("No terminal found for ShellModule");
    }
    super("Applications", "run-applications");
  }

  getActive(query: string): boolean {
    if(!ShellModule.TERMINAL) return false;
    return query.startsWith(ShellModule.SHELL_QUERY_PREFIX);
  }
  getEntries(query: string, abortSignal: AbortSignal): ModuleEntry[] {
    query = query.slice(ShellModule.SHELL_QUERY_PREFIX.length).trim();

    return [
      new ModuleEntry("Run shell command in terminal", query, null, () => {
        if(ShellModule.TERMINAL) execAsync([ShellModule.TERMINAL, "--", "sh", "-c", query]);
      })
    ];
  }
}