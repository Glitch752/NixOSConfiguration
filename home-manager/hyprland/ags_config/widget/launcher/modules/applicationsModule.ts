import Apps from "gi://AstalApps";
import { Module, ModuleEntry } from "../module";

export class ApplicationsModule extends Module {
  static MAX_RESULTS = 8;
  static apps = new Apps.Apps();

  constructor() {
    super("Applications", "run-applications");
  }

  getActive(query: string): boolean {
    return query.length > 0;
  }
  getEntries(query: string, _abortSignal: AbortSignal): ModuleEntry[] {
    // TODO: Custom implementation that supports app Desktop Actions defined in the desktop files, e.g. "New Window" from LibreWolf
    return ApplicationsModule.apps
      .fuzzy_query(query)
      .slice(0, ApplicationsModule.MAX_RESULTS)
      .map(app => new ModuleEntry(app.name, app.description, app.iconName, () => {
        app.launch();
      }));
  }
}