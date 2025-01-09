import { bind, timeout, Variable } from "astal";
import { astalify, ConstructProps, Gdk, Gtk } from "astal/gtk4";
import { closeOpenPopup, PopupData } from "../../popups";
import { ApplicationsModule } from "./modules/applicationsModule";
import { RinkModule } from "./modules/rinkModule";
import { Module, ModuleEntry } from "./module";
import { ShellModule } from "./modules/shellModule";
import { DictionaryModule } from "./modules/dictionaryModule";
import { WebSearchModule } from "./modules/webSearchModule";
import { SymbolsModule } from "./modules/symbolsModule";
import { InputListModule } from "./modules/inputListModule";
import { AbortSignal } from "../../processes";

// An alternative to anyrun for my application launcher.

type IndexedModuleEntry = ModuleEntry & { index: number };
type MaybePromise<T> = T | Promise<T>;
type ModuleResult = {
  module: Module,
  entries: IndexedModuleEntry[]
};

export const ScrolledWindow = astalify<Gtk.ScrolledWindow, Gtk.ScrolledWindow.ConstructorProps>(Gtk.ScrolledWindow, {
  // if it is a container widget, define children setter and getter here
  getChildren(self) {
    const child = self.get_child();
    if (child) return [child];
    else return [];
  },
  setChildren(self, children) {
    if (children.length === 0) self.set_child(null);
    if (children.length > 1) {
      console.error("ScrolledWindow can only have one child.");
      return;
    }
    self.set_child(children[0]);
  }
});

/**
 * Returns module results that are currently active.
 * If a module returns a promise, it will be resolved and added to the results.
 * All promises must not resolve after the abort signal is fired.
 * @param query 
 * @param abortSignal 
 * @returns 
 */
function getModuleResults(modules: Module[], query: string, abortSignal: AbortSignal): MaybePromise<ModuleResult>[] {
  let results: MaybePromise<ModuleResult>[] = [];
  let i = 0;
  for (let module of modules) {
    if (module.getActive(query)) {
      const entries = module.getEntries(query, abortSignal);
      const result = (entries: ModuleEntry[]): ModuleResult => ({
        module: module,
        entries: (entries as IndexedModuleEntry[]).map(entry => {
          entry.index = i;
          i++;
          return entry;
        })
      });

      // TODO: Use previous results until promises resolve so we avoid flickering
      if (!(entries instanceof Promise) && entries.length > 0) results.push(result(entries));
      else if (entries instanceof Promise) results.push(entries.then(result));
    }
  }
  return results;
}

export function CenteredRunPopup(data: PopupData) {
  return <box vertical valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER}>
    {RunPopup(data)}
  </box>;
}

export default function RunPopup(data?: PopupData) {
  let query = Variable("");
  let abortSignal = new AbortSignal();

  let modules: Module[] = data ? [
    new InputListModule(data)
  ] : [
    new ApplicationsModule(),
    new RinkModule(),
    new ShellModule(),
    new DictionaryModule(),
    new WebSearchModule(),
    new SymbolsModule()
  ];

  // TODO: Our handling of promises is really overcomplicated and hacky here

  let moduleResults = Variable<MaybePromise<ModuleResult>[]>(getModuleResults(modules, "", abortSignal));
  query.subscribe(q => {
    // If we're already fetching results, abort the previous fetch
    abortSignal.abort();

    abortSignal = new AbortSignal();
    moduleResults.set(getModuleResults(modules, q, abortSignal));
  });
  let highlightedIndex = Variable(-1);

  let skipUpdate = false; // This is a hack to prevent infinite loops
  function updateResultPromises(results: MaybePromise<ModuleResult>[]) {
    if (skipUpdate) {
      skipUpdate = false;
      return;
    }
    results.forEach((result) => {
      if (result instanceof Promise) {
        // This shouldn't return results from previous queries since we use AbortControllers
        result.then((finishedResult) => {
          if (!moduleResults.get().includes(result)) return;
          if (finishedResult.entries.length === 0) return;

          skipUpdate = true;
          moduleResults.set([...moduleResults.get(), finishedResult]);

          if (highlightedIndex.get() === -1) nextHighlight();
        });
      }
    });
  }
  updateResultPromises(moduleResults.get());
  moduleResults.subscribe(updateResultPromises);

  const getAllEntries = () => moduleResults.get()
    .flatMap(result => result instanceof Promise ? [] : result.entries);

  /** If no highlightable entries are found, this will do nothing. */
  const previousHighlight = () => {
    const entries = getAllEntries();
    if (entries.length === 0) return;
    if (entries.all(entry => entry.onActivate === null)) return;

    let currentHighlightedIndex = highlightedIndex.get();
    currentHighlightedIndex--;
    if (currentHighlightedIndex < 0) currentHighlightedIndex = entries.length - 1;
    highlightedIndex.set(currentHighlightedIndex);

    if (entries[currentHighlightedIndex].onActivate === null) previousHighlight();
  };
  /** If no highlightable entries are found, this will do nothing. */
  const nextHighlight = () => {
    const entries = getAllEntries();
    if (entries.length === 0) return;
    if (entries.all(entry => entry.onActivate === null)) return;

    let currentHighlightedIndex = highlightedIndex.get();
    currentHighlightedIndex++;
    if (currentHighlightedIndex >= entries.length) currentHighlightedIndex = 0;
    highlightedIndex.set(currentHighlightedIndex);

    if (entries[currentHighlightedIndex].onActivate === null) nextHighlight();
  };

  return <box vertical valign={Gtk.Align.START}>
    <entry
      placeholderText=""
      onChanged={self => {
        query.set(self.text);
        highlightedIndex.set(-1);
        nextHighlight();
      }}
      setup={self => {
        // I have no idea why the timeout is needed, but it works consistently, so I'm not complaining
        timeout(0, () => self.grab_focus());
      }}
      onKeyPressed={(self, keyval, keycode, state) => {
        if (keyval === Gdk.KEY_Tab) {
          if (state & Gdk.ModifierType.SHIFT_MASK) previousHighlight()
          else nextHighlight();
          return true;
        } else if (keyval === Gdk.KEY_Down) {
          nextHighlight();
          return true;
        } else if (keyval === Gdk.KEY_Up) {
          previousHighlight();
          return true;
        } else if (keyval === Gdk.KEY_Return) {
          print("Activate");
          const entry = getAllEntries()[highlightedIndex.get()];
          if (entry !== null && entry.onActivate) entry.onActivate();
          closeOpenPopup();
          return true;
        }
      }}
      cssClasses={["query"]}
    />
    <ScrolledWindow
      vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
      hscrollbarPolicy={Gtk.PolicyType.NEVER}
      propagateNaturalHeight
    >
      <box vertical cssClasses={["results"]} vexpand>
        {
          bind(moduleResults).as(results => (results
            .filter(result => !(result instanceof Promise)) as ModuleResult[])
            .map(({ module, entries }) =>
              <box vertical cssClasses={["module"]}>
                <box cssClasses={["moduleHeader"]}>
                  <image iconName={module.icon} />
                  <label label={module.name}></label>
                </box>
                <box vertical cssClasses={["entries"]}>
                  {
                    entries.map(entry => <button
                      cssClasses={highlightedIndex().as(idx => ["entry", idx === entry.index ? "highlighted" : ""])}
                      onClicked={entry.onActivate ?? (() => { })}
                    >
                      <box>
                        <image visible={entry.icon !== null} iconName={entry.icon ?? ""} />
                        <box vertical cssClasses={["text"]}>
                          <label halign={Gtk.Align.START} label={entry.name} cssClasses={["name"]} wrap />
                          <label
                            maxWidthChars={80}
                            halign={Gtk.Align.START}
                            label={entry.description ?? ""}
                            visible={entry.description != null}
                            cssClasses={["description"]}
                            wrap
                          />
                        </box>
                      </box>
                    </button>)
                  }
                </box>
              </box>
            ).defaultIfEmpty(<label halign={Gtk.Align.START} cssClasses={["noResults"]} label="No results" />))
        }
      </box>
    </ScrolledWindow>
  </box>;
}