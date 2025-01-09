import { Module, ModuleEntry } from "../module";
import { copyToClipboard } from "../../../utils";
import { rinkQuery } from "../launcherUtilsInterface";
import { AbortSignal } from "../../../processes";

export class RinkModule extends Module {
  private static RINK_QUERY_PREFIX = "=";

  constructor() {
    super("Rink", "run-calculator");
  }

  getActive(query: string): boolean {
    return query.startsWith(RinkModule.RINK_QUERY_PREFIX);
  }
  async getEntries(query: string, abortSignal: AbortSignal): Promise<ModuleEntry[]> {
    query = query.slice(RinkModule.RINK_QUERY_PREFIX.length).trim();

    try {
      // Maybe this isn't the best solution, but it's the cleanest I could come up with.
      // I created a simple wrapper around Rink in Rust that returns the result as a JSON string
      // and whether there were any errors. The defualt Rink CLI does't return a non-zero exit
      // code or otherwise indicate an error, so this is the best solution I've come up with.
      // I opened an issue here: https://github.com/tiffany352/rink-rs/issues/194
      const { error, output } = await rinkQuery(query);
      // if(error) return [];

      const { title, description, textToCopy } = this.parseRinkOutput(output);

      return [new ModuleEntry(title, description, null, error ? null : () => copyToClipboard(textToCopy))];
    } catch (e) {
      return [new ModuleEntry(`Error running Rink: ${e}`, "", null, null)];
    }
  }

  private parseRinkOutput(output: string): { title: string, description: string, textToCopy: string } {
    // Remove newlines and extra spaces
    output = output.replace(/\s+/g, " ").trim();

    // If ": " is in the result, it's probably something like "Search result: ...", so we'll split on that
    if (output.includes(": ")) {
      const [title, description] = output.split(": ");
      return { title, description, textToCopy: output };
    }

    // Otherwise, if there's something in parentheses at the end, it's likely the units of the result
    const matches = output.match(/^(.*?)(?: \((.*?)\))?$/);
    if (!matches) return { title: output, description: "", textToCopy: output };

    const [, title, description] = matches;
    return { title, description: description ?? "", textToCopy: title };
  }
}