import { Variable } from "astal";
import { Gdk, Gtk } from "astal/gtk3";
import { closeOpenPopup } from "../../popups";
import { ApplicationsModule } from "./modules/applicationsModule";
import { RinkModule } from "./modules/rinkModule";
import { Module, ModuleEntry } from "./module";

// An alternative to anyrun for my application launcher.

// TODO for anyrun parity:
// - [X] applications
// - [ ] dictionary
// - [ ] symbols
// - [ ] shell
// - [ ] rink
// - [ ] websearch
// - [ ] kidex
// - [ ] stdin (possibly a separate, centered, popup?)

let modules: Module[] = [
  new ApplicationsModule(),
  new RinkModule()
];

type IndexedModuleEntry = ModuleEntry & { index: number };
type ModuleResult = {
  module: Module,
  entries: IndexedModuleEntry[]
};

function getModuleResults(query: string): ModuleResult[] {
  let results: ModuleResult[] = [];
  let i = 0;
  for(let module of modules) {
    if(module.getActive(query)) {
      const entries = module.getEntries(query);
      if(entries.length > 0) results.push({
        module: module,
        entries: (entries as IndexedModuleEntry[]).map(entry => {
          entry.index = i;
          i++;
          return entry;
        })
      });
    }
  }
  return results;
}

export default function RunPopup() {
  let query = Variable("");
  let moduleResults = query(q => getModuleResults(q));
  let highlightedIndex = Variable(0);

  const getAllEntries = () => moduleResults.get().flatMap(result => result.entries);
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
        } else if(keyval === Gdk.KEY_Right) {
          nextHighlight();
          return true;
        } else if(keyval === Gdk.KEY_Left) {
          previousHighlight();
          return true;
        } else if(keyval === Gdk.KEY_Return) {
          const entry = getAllEntries()[highlightedIndex.get()];
          if(entry !== null) entry.onClick();
          closeOpenPopup();
          return true;
        }
      }}
    />
    <box vertical className="results">
      {
        moduleResults.as(results => results.map(({ module, entries }) => <box vertical className="module">
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
                    <label halign={Gtk.Align.START} label={entry.name} className="name" />
                    <label halign={Gtk.Align.START} label={entry.description} className="description" wrap />
                  </box>
                </box>
              </button>)
            }
          </box>
        </box>))
      }
    </box>
  </box>;
}