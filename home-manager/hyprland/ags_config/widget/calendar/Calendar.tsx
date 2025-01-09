// import { bind, timeout, Variable } from "astal";
// import { CalendarDayData, getCalendarLayout } from "./calendarLayout";
// import { astalify, Gtk } from "astal/gtk4";

// const Fixed = astalify<Gtk.Fixed, Gtk.Fixed.ConstructorProps>(Gtk.Fixed, {
//   // if it is a container widget, define children setter and getter here
//   // TODO
//   getChildren(self) { return [] },
//   setChildren(self, children) { },
// });

// function formatMonth({ month, year }: { month: number, year: number }) {
//   return new Date(year, month).toLocaleString(undefined, { month: "long", year: "numeric" });
// }

// function CalendarDay({ day, isToday, isDifferentMonth, tooltip }: CalendarDayData) {
//   return <label
//     label={day.toString()}
//     tooltipText={tooltip}
//     cssClasses={[isToday ? "today" : "", isDifferentMonth ? "differentMonth" : "", "calendarDay"]}
//   />;
// }

// const weekdays = [
//   { name: "Mo", tooltip: "Monday" },
//   { name: "Tu", tooltip: "Tuesday" },
//   { name: "We", tooltip: "Wednesday" },
//   { name: "Th", tooltip: "Thursday" },
//   { name: "Fr", tooltip: "Friday" },
//   { name: "Sa", tooltip: "Saturday" },
//   { name: "Su", tooltip: "Sunday" }
// ];

// function CalendarMonth({ date }: { date: { month: number, year: number } }) {
//   const { month, year } = date;
//   const layout = getCalendarLayout(new Date(year, month, new Date().getDate()), month === new Date().getMonth() && year === new Date().getFullYear());

//   return <box vertical cssClasses={["calendarMonth"]}>
//     <box cssClasses={["calendarHeader"]} hexpand>
//       <label hexpand label={formatMonth(date)} />
//     </box>
//     {/* It's annoying to lay it out this way, but we avoid Gtk.grid because is has some odd behavior with ags' JSX. */}
//     <box vertical>
//       <box>
//         {weekdays.map(weekday => <CalendarDay day={weekday.name} isToday={false} tooltip={weekday.tooltip} isDifferentMonth={false} />)}
//       </box>
//       {
//         layout.map((week, i) => <box>
//           {week.map((day, j) => <CalendarDay {...day} />)}
//         </box>)
//       }
//     </box>
//   </box>;
// }

// function monthToIndex(month: number, year: number): number {
//   return year * 12 + month;
// }
// function indexToMonth(index: number): { month: number, year: number } {
//   return { month: index % 12, year: Math.floor(index / 12) };
// }

// function resolveVariable<T>(variable: Variable<T> | T): T {
//   return variable instanceof Variable ? variable.get() : variable;
// }

// function InfiniteScrollWindow({
//   getElement,
//   displayedElement,
//   buffer,
//   snapToElement,
//   elementHeight,
//   viewportHeight = elementHeight, viewportWidth,
//   hexpand, vexpand,
//   elementMarginTop = 0,
//   cssClasses
// }: {
//   getElement: (index: number) => Gtk.Widget,
//   displayedElement: Variable<number> | number,
//   buffer: number,
//   snapToElement: boolean,
//   elementHeight: number,
//   viewportHeight?: number,
//   viewportWidth?: number,
//   hexpand?: boolean,
//   vexpand?: boolean,
//   elementMarginTop?: number,
//   cssClasses?: string[]
// }) {
//   let layout = new Gtk.Fixed({ hexpand: hexpand ?? false, vexpand: vexpand ?? false });
//   let queueDraw = () => layout.queue_draw();

//   let displayedElements: Map<number, Gtk.Widget> = new Map();
//   let scrollPosition = elementHeight * resolveVariable(displayedElement);
//   let scrollTarget = scrollPosition;
//   let discardUpdate = false; // This is really hacky lol

//   let scrollTimeout: number | null = null;

//   layout.cssClasses = ["infiniteScrollWindow", ...cssClasses ?? []];
//   layout.heightRequest = viewportHeight;
//   if (viewportWidth) layout.widthRequest = viewportWidth;

//   // layout.connect("scroll", (self, dx, dy) => {
//   //   if (snapToElement) {
//   //     const time = Date.now();
//   //     if (scrollTimeout !== null && time - scrollTimeout < 100) {
//   //       scrollTimeout = time;
//   //       return;
//   //     }
//   //     scrollTimeout = time;
//   //     scrollTarget += Math.sign(dy) * elementHeight;
//   //   } else scrollTarget += dy * 10;
//   // });

//   layout.connect("realize", () => {
//     updateDisplayedElements();
//   });

//   if (displayedElement instanceof Variable) {
//     displayedElement.subscribe((newValue) => {
//       if (discardUpdate) {
//         discardUpdate = false;
//         return;
//       }
//       scrollTarget = elementHeight * newValue;
//     });
//   }

//   if (!hexpand || !vexpand) {
//     layout.set_size_request(viewportWidth ?? 0, viewportHeight);
//   }

//   function getWidgetPosition(index: number) {
//     return ((index + elementMarginTop) * elementHeight) - scrollPosition;
//   }

//   let lastUpdate = Date.now();
//   function updateDisplayedElements() {
//     const time = Date.now();
//     const deltaTime = Math.min(time - lastUpdate, 100);
//     lastUpdate = time;

//     const lerpFactor = Math.min(deltaTime / 200, 1);
//     scrollPosition = scrollPosition + (scrollTarget - scrollPosition) * lerpFactor;
//     if (Math.abs(scrollPosition - scrollTarget) < 1) {
//       scrollPosition = scrollTarget;
//       // Stop updating if we're not scrolling.
//     } else {
//       queueDraw();
//     }

//     // TODO: Widgets don't show at really high scroll speeds.
//     // Maybe we can either predict the scroll position or compensate
//     // by adding more elements when scrolling fast?

//     let displayedElementIndex = Math.round(scrollPosition / elementHeight);
//     if (displayedElement instanceof Variable) {
//       if (displayedElement.get() !== displayedElementIndex) {
//         discardUpdate = true;
//         displayedElement.set(displayedElementIndex);
//       }
//     }

//     let newDisplayedElements = new Map<number, Gtk.Widget>();
//     for (
//       let i = displayedElementIndex - elementMarginTop - buffer;
//       i <= displayedElementIndex - elementMarginTop + buffer + viewportHeight / elementHeight;
//       i++
//     ) {
//       if (!displayedElements.has(i)) {
//         let element = getElement(i);
//         layout.put(element, 0, getWidgetPosition(i));
//         newDisplayedElements.set(i, element);
//       } else {
//         newDisplayedElements.set(i, displayedElements.get(i)!);
//       }
//     }
//     for (let [i, element] of displayedElements) {
//       if (!newDisplayedElements.has(i)) {
//         layout.remove(element);
//       } else {
//         // Update the element's position to be relative to the scroll position.
//         layout.move(element, 0, getWidgetPosition(i));
//       }
//     }

//     displayedElements = newDisplayedElements;
//   }

//   return layout;
// }

// function derived<T, U>(variable: Variable<T>, fn: (value: T) => U): Variable<U> {
//   let derivedVariable = new Variable(fn(variable.get()));
//   variable.subscribe((newValue) => {
//     derivedVariable.set(fn(newValue));
//   });
//   return derivedVariable;
// }

// export default function Calendar() {
//   let displayedMonth = new Variable(monthToIndex(new Date().getMonth(), new Date().getFullYear()));
//   let displayedMonthYear = bind(displayedMonth).as(month => Math.floor(month / 12));

//   let displayedYear = derived(displayedMonth, (month) => Math.floor(month / 12));

//   return <box cssClasses={["calendar"]}>
//     {/* Years */}
//     <InfiniteScrollWindow
//       getElement={(index) => {
//         return <button
//           cssClasses={displayedMonthYear.as(year =>
//             ["calendarYear", index === year ? "selected" : ""]
//           )}
//           onClicked={() => {
//             displayedMonth.set(index * 12);
//           }}
//         >
//           <label label={index.toString()} />
//         </button>;
//       }}
//       displayedElement={displayedYear}
//       snapToElement={false}
//       buffer={2}
//       elementMarginTop={2}
//       elementHeight={30}
//       viewportWidth={50}
//       viewportHeight={350}
//       cssClasses={["yearSelector"]}
//     />
//     {/* Month */}
//     <InfiniteScrollWindow
//       getElement={(index) => {
//         return <CalendarMonth date={indexToMonth(index)} />;
//       }}
//       displayedElement={displayedMonth}
//       snapToElement={true}
//       buffer={1}
//       elementHeight={350}
//       viewportWidth={320}
//       cssClasses={["monthSelector"]}
//     />
//     {/* Control buttons */}
//     <box vertical cssClasses={["calendarControls"]}>
//       <button onClicked={() => {
//         displayedMonth.set(displayedMonth.get() - 1);
//       }} tooltipText="Previous month">
//         <image iconName="go-up-symbolic" />
//       </button>
//       <button onClicked={() => {
//         displayedMonth.set(displayedMonth.get() + 1);
//       }} tooltipText="Next month">
//         <image iconName="go-down-symbolic" />
//       </button>
//       <button onClicked={() => {
//         displayedMonth.set(monthToIndex(new Date().getMonth(), new Date().getFullYear()));
//       }} tooltipText="Current month">
//         <image iconName="go-home-symbolic" />
//       </button>
//     </box>
//   </box>;
// }

// TODO: update that all to work with GTK4; for now, we use the built-in calendar widget
import { Gtk } from "astal/gtk4";
import { astalify } from "astal/gtk4";

export const Calendar = astalify<Gtk.Calendar, Gtk.Calendar.ConstructorProps>(Gtk.Calendar, {});