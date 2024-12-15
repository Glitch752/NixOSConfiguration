import { bind, Binding, GObject, Variable } from "astal";
import { CalendarDayData, getCalendarLayout } from "./calendarLayout";
import { astalify, ConstructProps, Gdk, Gtk } from "astal/gtk3";

function formatMonth({ month, year }: { month: number, year: number }) {
  return new Date(year, month).toLocaleString(undefined, { month: "long", year: "numeric" });
}

function CalendarDay({ day, isToday, isDifferentMonth, tooltip }: CalendarDayData) {
  return <label
    label={day.toString()}
    tooltipText={tooltip}
    className={`${isToday ? "today" : ""} ${isDifferentMonth ? "differentMonth" : ""} calendarDay`}
  />;
}

const weekdays = [
  { name: "Mo", tooltip: "Monday" },
  { name: "Tu", tooltip: "Tuesday" },
  { name: "We", tooltip: "Wednesday" },
  { name: "Th", tooltip: "Thursday" },
  { name: "Fr", tooltip: "Friday" },
  { name: "Sa", tooltip: "Saturday" },
  { name: "Su", tooltip: "Sunday" }
];

function CalendarMonth({ date }: { date: { month: number, year: number } }) {
  const { month, year } = date;
  const layout = getCalendarLayout(new Date(year, month, new Date().getDate()), month === new Date().getMonth() && year === new Date().getFullYear());
  
  return <box vertical className="calendarMonth">
    <box className="calendarHeader" hexpand>
      <label hexpand label={formatMonth(date)} />
    </box>
    {/* It's annoying to lay it out this way, but we avoid Gtk.grid because is has some odd behavior with ags' JSX. */}
    <box vertical>
      <box>
        {weekdays.map(weekday => <CalendarDay day={weekday.name} isToday={false} tooltip={weekday.tooltip} isDifferentMonth={false} />)}
      </box>
      {
        layout.map((week, i) => <box>
          {week.map((day, j) => <CalendarDay {...day} />)}
        </box>)
      }
    </box>
  </box>;
}

function monthToIndex(month: number, year: number): number {
  return year * 12 + month;
}
function indexToMonth(index: number): { month: number, year: number } {
  return { month: index % 12, year: Math.floor(index / 12) };
}

class Layout extends astalify(Gtk.Layout) {
  static { GObject.registerClass(this) }

  constructor(props: ConstructProps<
    Layout,
    Gtk.Layout.ConstructorProps
  >) {
    super(props as any);
  }
}

function resolveVariable<T>(variable: Variable<T> | T): T {
  return variable instanceof Variable ? variable.get() : variable;
}

function InfiniteScrollWindow({
  getElement,
  displayedElement,
  buffer,
  snapToElement,
  elementHeight,
  viewportHeight = elementHeight, viewportWidth,
  hexpand, vexpand,
  elementMarginTop = 0,
  className
}: {
  getElement: (index: number) => Gtk.Widget,
  displayedElement: Variable<number> | number,
  buffer: number,
  snapToElement: boolean,
  elementHeight: number,
  viewportHeight?: number,
  viewportWidth?: number,
  hexpand?: boolean,
  vexpand?: boolean,
  elementMarginTop?: number,
  className?: string
}) {
  let layout = new Layout({ hexpand, vexpand });
  
  let displayedElements: Map<number, Gtk.Widget> = new Map();
  let scrollPosition = elementHeight * resolveVariable(displayedElement);
  let scrollTarget = scrollPosition;
  let discardUpdate = false; // This is really hacky lol

  if(displayedElement instanceof Variable) {
    displayedElement.subscribe((newValue) => {
      if(discardUpdate) {
        discardUpdate = false;
        return;
      }
      scrollTarget = elementHeight * newValue;
    });
  }

  if(!hexpand || !vexpand) {
    layout.set_size_request(viewportWidth ?? 0, viewportHeight);
  }

  function getWidgetPosition(index: number) {
    return ((index + elementMarginTop) * elementHeight) - scrollPosition;
  }

  let lastUpdate = Date.now();
  function updateDisplayedElements() {
    const time = Date.now();
    const deltaTime = Math.min(time - lastUpdate, 100);
    lastUpdate = time;

    const lerpFactor = Math.min(deltaTime / 200, 1);
    scrollPosition = scrollPosition + (scrollTarget - scrollPosition) * lerpFactor;
    if(Math.abs(scrollPosition - scrollTarget) < 1) {
      scrollPosition = scrollTarget;
    }

    // TODO: Widgets don't show at really high scroll speeds.
    // Maybe we can either predict the scroll position or compensate
    // by adding more elements when scrolling fast?

    let displayedElementIndex = Math.round(scrollPosition / elementHeight);
    if(displayedElement instanceof Variable) {
      if(displayedElement.get() !== displayedElementIndex) {
        discardUpdate = true;
        displayedElement.set(displayedElementIndex);
      }
    }

    let newDisplayedElements = new Map<number, Gtk.Widget>();
    for(
      let i = displayedElementIndex - elementMarginTop - buffer;
      i <= displayedElementIndex - elementMarginTop + buffer + viewportHeight / elementHeight;
      i++
    ) {
      if(!displayedElements.has(i)) {
        let element = getElement(i);
        layout.put(element, 0, getWidgetPosition(i));
        newDisplayedElements.set(i, element);
      } else {
        newDisplayedElements.set(i, displayedElements.get(i)!);
      }
    }
    for(let [i, element] of displayedElements) {
      if(!newDisplayedElements.has(i)) {
        layout.remove(element);
        element.destroy();
      } else {
        // Update the element's position to be relative to the scroll position.
        layout.move(element, 0, getWidgetPosition(i));
      }
    }

    displayedElements = newDisplayedElements;
  }

  let scrollTimeout: number | null = null;
  return <box
    className={`infiniteScrollWindow ${className}`}
    css={`
      ${viewportHeight ? `min-height: ${viewportHeight}px;` : ""}
      ${viewportWidth ? `min-width: ${viewportWidth}px;` : ""}
    `}
  >
    <eventbox
      onScroll={(self, event) => {
        if(event.direction === Gdk.ScrollDirection.SMOOTH) {
          if(snapToElement) {
            const time = Date.now();
            if(scrollTimeout !== null && time - scrollTimeout < 100) {
              scrollTimeout = time;
              return;
            }
            scrollTimeout = time;
            scrollTarget += Math.sign(event.delta_y) * elementHeight;
          } else scrollTarget += event.delta_y * 10;
        } else if(event.direction === Gdk.ScrollDirection.UP) {
          scrollTarget -= elementHeight;
        } else if(event.direction === Gdk.ScrollDirection.DOWN) {
          scrollTarget += elementHeight;
        }
      }}
      setup={() => {
        updateDisplayedElements();
      }}
      onDraw={(self) => {
        updateDisplayedElements();
      }}
    >
      {layout}
    </eventbox>
  </box>
}

function derived<T, U>(variable: Variable<T>, fn: (value: T) => U): Variable<U> {
  let derivedVariable = new Variable(fn(variable.get()));
  variable.subscribe((newValue) => {
    derivedVariable.set(fn(newValue));
  });
  return derivedVariable;
}

export default function Calendar() {
  let displayedMonth = new Variable(monthToIndex(new Date().getMonth(), new Date().getFullYear()));
  let displayedMonthYear = bind(displayedMonth).as(month => Math.floor(month / 12));
  
  let displayedYear = derived(displayedMonth, (month) => Math.floor(month / 12));

  return <box className="calendar">
    {/* Years */}
    <InfiniteScrollWindow
      getElement={(index) => {
        return <button
          className={displayedMonthYear.as(year =>
            `calendarYear ${index === year ? "selected" : ""}`
          )}
          onClick={() => {
            displayedMonth.set(index * 12);
          }}
        >
          <label label={index.toString()} />
        </button>;
      }}
      displayedElement={displayedYear}
      snapToElement={false}
      buffer={2}
      elementMarginTop={2}
      elementHeight={30}
      viewportWidth={50}
      viewportHeight={350}
      className="yearSelector"
    />
    {/* Month */}
    <InfiniteScrollWindow
      getElement={(index) => {
        return <CalendarMonth date={indexToMonth(index)} />;
      }}
      displayedElement={displayedMonth}
      snapToElement={true}
      buffer={1}
      elementHeight={350}
      viewportWidth={320}
      className="monthSelector"
    />
    {/* Control buttons */}
    <box vertical className="calendarControls">
      <button onClicked={() => {
        displayedMonth.set(displayedMonth.get() - 1);
      }} tooltipText="Previous month">
        <icon icon="go-up-symbolic" />
      </button>
      <button onClicked={() => {
        displayedMonth.set(displayedMonth.get() + 1);
      }} tooltipText="Next month">
        <icon icon="go-down-symbolic" />
      </button>
      <button onClicked={() => {
        displayedMonth.set(monthToIndex(new Date().getMonth(), new Date().getFullYear()));
      }} tooltipText="Current month">
        <icon icon="go-home-symbolic" />
      </button>
    </box>
  </box>;
}