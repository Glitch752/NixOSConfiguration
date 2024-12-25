import { Module, ModuleEntry } from "../module";
import { AbortSignal, copyToClipboard } from "../../../utils";
import { exec, execAsync } from "astal";
import { Gtk } from "astal/gtk3";

type SearchEngine = {
  name: string,
  url: (query: string) => string
};

export class WebSearchModule extends Module {
  static WEB_SEARCH_PREFIX = "search ";
  static SEARCH_ENGINES: SearchEngine[] = [
    { name: "DuckDuckGo", url: q => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
    { name: "Google", url: q => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
    { name: "Brave Search", url: q => `https://search.brave.com/search?q=${encodeURIComponent(q)}` },
  ];

  constructor() {
    super("Web search", "run-search"); // TODO: Actually add this icon
  }

  getActive(query: string): boolean {
    return query.startsWith(WebSearchModule.WEB_SEARCH_PREFIX);
  }
  getEntries(query: string, abortSignal: AbortSignal): ModuleEntry[] {
    query = query.slice(WebSearchModule.WEB_SEARCH_PREFIX.length).trim();

    return WebSearchModule.SEARCH_ENGINES.map(engine => new ModuleEntry(`Search ${engine.name}`, `Search ${query} using ${engine.name}`, null, () => {
      // execAsync([
      //   "systemctl", "--user", "start", WebSearchModule.DEFAULT_BROWSER
      // ]);
      Gtk.show_uri(null, engine.url(query), Gtk.get_current_event_time());
    }));
  }
}