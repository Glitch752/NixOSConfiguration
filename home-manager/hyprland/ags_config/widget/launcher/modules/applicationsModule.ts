import Apps from "gi://AstalApps";
import { Module, ModuleEntry } from "../module";
import { AbortSignal, startApplication } from "../../../processes";

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
      .map(app => new ModuleEntry(app.name, app.description, app.iconName, async() => {
        // app.launch();
        let executable = app.get_executable().replace("%U", ""); // I'm not sure why %U is included in the executable path

        try {
          await startApplication(executable);
        } catch (e) {
          console.error("Error starting application", e);
        }
      }));
  }
}