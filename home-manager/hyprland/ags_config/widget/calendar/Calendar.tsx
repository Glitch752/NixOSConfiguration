import { bind, Variable } from "astal";
import { CalendarDayData, getCalendarLayout } from "./calendarLayout";
import { Gdk } from "astal/gtk3";

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

export default function Calendar() {
  let displayedMonth = new Variable({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  let displayedMonthBinding = bind(displayedMonth);
  return <centerbox hexpand>
    {/* Super hacky solution for centering... please forgive me */}
    <box></box>
    <eventbox
      onScroll={(self, event) => {
        if(event.direction === Gdk.ScrollDirection.UP || event.direction === Gdk.ScrollDirection.SMOOTH && event.delta_y > 0) {
          const { month, year } = displayedMonth.get();
          if(month === 0) {
            displayedMonth.set({ month: 11, year: year - 1 });
          } else {
            displayedMonth.set({ month: month - 1, year });
          }
        } else {
          const { month, year } = displayedMonth.get();
          if(month === 11) {
            displayedMonth.set({ month: 0, year: year + 1 });
          } else {
            displayedMonth.set({ month: month + 1, year });
          }
        }
      }}
    >
      {/* TODO: Infinite scrolling? */}
      <box vertical className="calendar">
        <box className="calendarHeader" hexpand>
          <label hexpand label={displayedMonthBinding.as(month => formatMonth(month))} />
        </box>
        {/* It's annoying to lay it out this way, but we avoid Gtk.grid because is has some odd behavior with ags' JSX. */}
        <box vertical>
          <box>
            {weekdays.map(weekday => <CalendarDay day={weekday.name} isToday={false} tooltip={weekday.tooltip} isDifferentMonth={false} />)}
          </box>
          {
            displayedMonthBinding.as(({ month, year }) => {
              const layout = getCalendarLayout(new Date(year, month, new Date().getDate()), month === new Date().getMonth() && year === new Date().getFullYear());
              return layout.map((week, i) => <box>
                {week.map((day, j) => <CalendarDay {...day} />)}
              </box>);
            })
          }
        </box>
      </box>
    </eventbox>
    <box></box>
  </centerbox>;
}