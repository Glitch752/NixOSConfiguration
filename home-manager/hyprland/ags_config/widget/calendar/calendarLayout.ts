// https://github.com/end-4/dots-hyprland/blob/main/.config/ags/modules/sideright/calendar_layout.js
function checkLeapYear(year: number) {
  return (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0));
}

function getMonthDays(month: number, year: number) {
  const leapYear = checkLeapYear(year);
  if((month <= 7 && month % 2 == 1) || (month >= 8 && month % 2 == 0)) return 31;
  if(month == 2 && leapYear) return 29;
  if(month == 2 && !leapYear) return 28;
  return 30;
}

function getNextMonthDays(month: number, year: number) {
  const leapYear = checkLeapYear(year);
  if(month == 1 && leapYear) return 29;
  if(month == 1 && !leapYear) return 28;
  if(month == 12) return 31;
  if((month <= 7 && month % 2 == 1) || (month >= 8 && month % 2 == 0)) return 30;
  return 31;
}

function getPrevMonthDays(month: number, year: number) {
  const leapYear = checkLeapYear(year);
  if(month == 3 && leapYear) return 29;
  if(month == 3 && !leapYear) return 28;
  if(month == 1) return 31;
  if((month <= 7 && month % 2 == 1) || (month >= 8 && month % 2 == 0)) return 30;
  return 31;
}

export type CalendarDayData = {
  day: string | number,
  isToday: boolean,
  isDifferentMonth: boolean,
  tooltip: string
};

export function getCalendarLayout(dateObject?: Date, highlight: boolean = true) {
  if(!dateObject) dateObject = new Date();

  // Monday is the first day of the week
  const weekday = (dateObject.getDay() + 6) % 7;
  
  const day = dateObject.getDate();
  const month = dateObject.getMonth() + 1;
  const year = dateObject.getFullYear();
  
  const weekdayOfMonthFirst = (weekday + 35 - (day - 1)) % 7;
  
  const daysInMonth = getMonthDays(month, year);
  const daysInNextMonth = getNextMonthDays(month, year);
  const daysInPrevMonth = getPrevMonthDays(month, year);

  // Fill
  let monthDiff = (weekdayOfMonthFirst == 0 ? 0 : -1);
  let currentDayNumber, dim;
  if(weekdayOfMonthFirst == 0) {
    currentDayNumber = 1;
    dim = daysInMonth;
  } else {
    currentDayNumber = (daysInPrevMonth - (weekdayOfMonthFirst - 1));
    dim = daysInPrevMonth;
  }
  
  let calendar: CalendarDayData[][] = [...Array(6)].map(() => Array(7).fill({ day: "", isToday: false, tooltip: "" }));

  let i = 0, j = 0;
  while(i < 6 && j < 7) {
    calendar[i][j] = {
      day: currentDayNumber,
      isToday: currentDayNumber == day && monthDiff == 0 && highlight,
      isDifferentMonth: (monthDiff != 0),
      tooltip: new Date(year, monthDiff, currentDayNumber).toLocaleDateString()
    };

    // Increment
    currentDayNumber++;
    if(currentDayNumber > dim) { // Next month?
      monthDiff++;
      if(monthDiff == 0) dim = daysInMonth;
      else if(monthDiff == 1) dim = daysInNextMonth;
      currentDayNumber = 1;
    }

    // Next tile
    j++;
    if(j == 7) {
      j = 0;
      i++;
    }
  }

  return calendar;
}