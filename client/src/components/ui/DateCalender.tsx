import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, CaptionProps } from "react-day-picker";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function DateCalendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i); // 10 years back and 10 years ahead
  const months = Array.from({ length: 12 }, (_, i) =>
    format(new Date(2024, i, 1), "MMMM")
  );

  const [month, setMonth] = React.useState<Date | undefined>(new Date());

  function CustomCaption({ displayMonth }: CaptionProps) {
    const selectedMonth = displayMonth.getMonth();
    const selectedYear = displayMonth.getFullYear();

    return (
      <div className="flex justify-between items-center px-4">
        <select
          value={selectedMonth}
          onChange={(e) =>
            setMonth(new Date(selectedYear, Number(e.target.value)))
          }
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
        >
          {months.map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) =>
            setMonth(new Date(Number(e.target.value), selectedMonth))
          }
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <DayPicker
      month={month}
      onMonthChange={setMonth} // This ensures the dropdown selections update the calendar
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between items-center px-4",
        nav: "flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 p-0 opacity-50 hover:opacity-100 transition-all duration-200"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-600 dark:text-gray-400 rounded-md w-9 font-medium text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        ),
        day_selected:
          "bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-md",
        day_today: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold",
        day_outside: "text-gray-400 dark:text-gray-500 opacity-50",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Caption: CustomCaption, // Override the caption
      }}
      {...props}
    />
  );
}
DateCalendar.displayName = "Calendar";

export { DateCalendar };