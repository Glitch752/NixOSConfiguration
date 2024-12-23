import { exec, execAsync, timeout } from "astal";
import { Module, ModuleEntry } from "../module";
import GLib from "gi://GLib";
import { abortableExecAsync, AbortSignal, StdIOSocketProcess } from "../../../utils";

// This is kind of sketchy, but whatever
const rustLauncherUtilsPath = GLib.getenv("RUST_LAUNCHER_UTILS_PATH") ?? "";
const rustLauncherUtils: StdIOSocketProcess = new StdIOSocketProcess([rustLauncherUtilsPath]);

export class RinkModule extends Module {
  constructor() {
    super("Rink", "run-calculator");
  }

  async getEntries(query: string, abortSignal: AbortSignal): Promise<ModuleEntry[]> {
    try {
      // Maybe this isn't the best solution, but it's the cleanest I could come up with.
      // I created a simple wrapper around Rink in Rust that returns the result as a JSON string
      // and whether there were any errors. The defualt Rink CLI does't return a non-zero exit
      // code or otherwise indicate an error, so this is the best solution I've come up with.
      // I opened an issue here: https://github.com/tiffany352/rink-rs/issues/194
      const { error, output }: { error: boolean, output: string } = JSON.parse(
        await rustLauncherUtils.sendAsync(`rink ${query}`) ?? "{ \"error\": true, \"output\": \"\" }"
      );
      // if(error) return [];

      const { title, description } = this.parseRinkOutput(output);
      
      return [new ModuleEntry(title, description, null, () => {
        // TODO: Copy the result to the clipboard
      })];
    } catch(e) {
      print(`Error running Rink: ${e}`);
      return [];
    }
  }

  private parseRinkOutput(output: string): { title: string, description: string } {
    // Remove newlines and extra spaces
    output = output.replace(/\s+/g, " ").trim();

    // If ": " is in the result, it's probably something like "Search result: ...", so we'll split on that
    if(output.includes(": ")) {
      const [title, description] = output.split(": ");
      return { title, description };
    }

    // Otherwise, if there's something in parentheses at the end, it's likely the units of the result
    const matches = output.match(/^(.*?)(?: \((.*?)\))?$/);
    if(!matches) return { title: output, description: "" };

    const [, title, description] = matches;
    return { title, description: description ?? "" };
  }
}