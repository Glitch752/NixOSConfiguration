// import init, * as Rink from "../rink_wrapper/rink_js";
import { exec, timeout } from "astal";
import { Module, ModuleEntry } from "../module";
import GLib from "gi://GLib";

// This is kind of sketchy, but whatever lol
// Get the rink wrapper from $RINK_WRAPPER_PATH
const rinkWrapperPath = GLib.getenv("RINK_WRAPPER_PATH") ?? "";

export class RinkModule extends Module {
  constructor() {
    super("Rink", "run-calculator");
  }

  getEntries(query: string): ModuleEntry[] {
    try {
      const result: {
        title: string;
        description: string;
      } = JSON.parse(exec([rinkWrapperPath, query]));
      return [
        new ModuleEntry(result.title, result.description, null, () => {
          // TODO: Copy the result to the clipboard
        })
      ];
    } catch {
      return [];
    }
  }
}