import { bind, Variable } from "astal";
import { Gdk, Gtk } from "astal/gtk3";
import { closeOpenPopup } from "../../popups";
import { ApplicationsModule } from "./modules/applicationsModule";
import { RinkModule } from "./modules/rinkModule";
import { Module, ModuleEntry } from "./module";
import { AbortSignal } from "../../utils";
import { Scrollable } from "astal/gtk3/widget";

// An alternative to anyrun for my application launcher.

// TODO for anyrun parity:
// - [X] applications
// - [ ] dictionary
// - [ ] symbols
// - [ ] shell
// - [X] rink
// - [ ] websearch
// - [ ] kidex
// - [ ] stdin (possibly a separate, centered, popup?)

let modules: Module[] = [
  new ApplicationsModule(),
  new RinkModule()
];

type IndexedModuleEntry = ModuleEntry & { index: number };
type MaybePromise<T> = T | Promise<T>;
type ModuleResult = {
  module: Module,
  entries: IndexedModuleEntry[]
};

/**
 * Returns module results that are currently active.
 * If a module returns a promise, it will be resolved and added to the results.
 * All promises must not resolve after the abort signal is fired.
 * @param query 
 * @param abortSignal 
 * @returns 
 */
function getModuleResults(query: string, abortSignal: AbortSignal): MaybePromise<ModuleResult>[] {
  let results: MaybePromise<ModuleResult>[] = [];
  let i = 0;
  for(let module of modules) {
    if(module.getActive(query)) {
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
      if(!(entries instanceof Promise) && entries.length > 0) results.push(result(entries));
      else if(entries instanceof Promise) results.push(entries.then(result));
    }
  }
  return results;
}

export default function RunPopup() {
  let query = Variable("");
  let abortSignal = new AbortSignal();

  // TODO: Our handling of promises is really overcomplicated and hacky here

  let moduleResults = Variable<MaybePromise<ModuleResult>[]>(getModuleResults("", abortSignal));
  query.subscribe(q => {
    // If we're already fetching results, abort the previous fetch
    abortSignal.abort();

    abortSignal = new AbortSignal();
    moduleResults.set(getModuleResults(q, abortSignal));
  });
  let highlightedIndex = Variable(0);

  let skipUpdate = false; // This is a hack to prevent infinite loops
  moduleResults.subscribe((results) => {
    if(skipUpdate) {
      skipUpdate = false;
      return;
    }
    results.forEach((result) => {
      if(result instanceof Promise) {
        // This shouldn't return results from previous queries since we use AbortControllers
        result.then((finishedResult) => {
          if(!moduleResults.get().includes(result)) return;

          skipUpdate = true;
          moduleResults.set([...moduleResults.get(), finishedResult]);
        });
      }
    });
  });

  const getAllEntries = () => moduleResults.get()
    .flatMap(result => result instanceof Promise ? [] : result.entries);
  const previousHighlight = () => {
    let currentHighlightedIndex = highlightedIndex.get();
    currentHighlightedIndex--;
    if(currentHighlightedIndex < 0) currentHighlightedIndex = getAllEntries().length - 1;
    highlightedIndex.set(currentHighlightedIndex);
  };
  const nextHighlight = () => {
    let currentHighlightedIndex = highlightedIndex.get();
    currentHighlightedIndex++;
    if(currentHighlightedIndex >= getAllEntries().length) currentHighlightedIndex = 0;
    highlightedIndex.set(currentHighlightedIndex);
  };

  return <box vertical valign={Gtk.Align.START}>
    <entry
      placeholderText=""
      onChanged={self => {
        query.set(self.text);
        highlightedIndex.set(0);
      }}
      onRealize={self => {
        self.grab_focus();
      }}
      onKeyPressEvent={(self, event) => {
        const keyval = event.get_keyval()[1];
        if(keyval === Gdk.KEY_Tab) {
          if(event.get_state()[1] & Gdk.ModifierType.SHIFT_MASK) previousHighlight()
          else nextHighlight();
          return true;
        } else if(keyval === Gdk.KEY_Down) {
          nextHighlight();
          return true;
        } else if(keyval === Gdk.KEY_Up) {
          previousHighlight();
          return true;
        } else if(keyval === Gdk.KEY_Return) {
          const entry = getAllEntries()[highlightedIndex.get()];
          if(entry !== null) entry.onClick();
          closeOpenPopup();
          return true;
        }
      }}
      className="query"
    />
    <Scrollable
      vscroll={Gtk.PolicyType.AUTOMATIC}
      hscroll={Gtk.PolicyType.NEVER}
      propagateNaturalHeight
      setup={(self) => {
        // TODO: relayout on resize or something since
        // wrapped text causes scrolling even when it's not needed
        // query.subscribe(() => self.);
      }}
    >
      <box vertical className="results">
        {
          bind(moduleResults).as(results => (results
            .filter(result => !(result instanceof Promise)) as ModuleResult[])
            .map(({ module, entries }) =>
              // TODO: Allow collapsing modules
              <box vertical className="module">
              <box className="moduleHeader">
                <icon icon={module.icon} />
                <label label={module.name}></label>
              </box>
              <box vertical className="entries">
                {
                  entries.map(entry => <button
                    className={highlightedIndex().as(idx => `entry ${idx === entry.index ? "highlighted" : ""}`)}
                    onClicked={entry.onClick}
                  >
                    <box>
                      <icon visible={entry.icon !== null} icon={entry.icon ?? ""} />
                      <box vertical className="text">
                        <label halign={Gtk.Align.START} label={entry.name} className="name" wrap />
                        <label halign={Gtk.Align.START} label={entry.description} className="description" wrap />
                      </box>
                    </box>
                  </button>)
                }
              </box>
            </box>
            ).defaultIfEmpty(<label halign={Gtk.Align.START} className="noResults" label="No results" />))
        }
      </box>
    </Scrollable>
  </box>;
}