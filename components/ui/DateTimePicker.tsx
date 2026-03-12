"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  date: Date | null | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({
  date,
  setDate,
  placeholder = "Pick a date and time",
  className,
}: DateTimePickerProps) {
  const [selectedHour, setSelectedHour] = React.useState<number>(12);
  const [selectedMinute, setSelectedMinute] = React.useState<string>("00");
  const [isPM, setIsPM] = React.useState<boolean>(false);

  const hours12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = ["00", "15", "30", "45"];

  React.useEffect(() => {
    if (date) {
      const hours24 = date.getHours();
      setIsPM(hours24 >= 12);
      setSelectedHour(hours24 % 12 || 12);
      setSelectedMinute(date.getMinutes().toString().padStart(2, "0"));
    }
  }, [date]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const hour24 = isPM
        ? selectedHour === 12
          ? 12
          : selectedHour + 12
        : selectedHour === 12
          ? 0
          : selectedHour;
      selectedDate.setHours(hour24, parseInt(selectedMinute), 0, 0);
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    const hour24 = isPM
      ? type === "hour"
        ? value === "12"
          ? 12
          : parseInt(value) + 12
        : selectedHour === 12
          ? 12
          : selectedHour + 12
      : type === "hour"
        ? value === "12"
          ? 0
          : parseInt(value)
        : selectedHour === 12
          ? 0
          : selectedHour;

    const newMinute = type === "minute" ? value : selectedMinute;

    if (date) {
      const newDate = new Date(date);
      newDate.setHours(hour24, parseInt(newMinute), 0, 0);
      setDate(newDate);
    }

    if (type === "hour") {
      setSelectedHour(parseInt(value));
    } else {
      setSelectedMinute(value);
    }
  };

  const toggleAMPM = () => {
    const newIsPM = !isPM;
    setIsPM(newIsPM);
    if (date) {
      const hour24 = newIsPM
        ? selectedHour === 12
          ? 12
          : selectedHour + 12
        : selectedHour === 12
          ? 0
          : selectedHour;
      const newDate = new Date(date);
      newDate.setHours(hour24, parseInt(selectedMinute), 0, 0);
      setDate(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-[#0d0d0d] border-white/10 hover:bg-white/5 hover:border-white/20",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {date ? (
            <span>
              {format(date, "PPP")} at {format(date, "h:mm a")}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-[#1a1a1a] border-white/10"
        align="start"
      >
        <div className="flex flex-col">
          <CalendarComponent
            mode="single"
            selected={date || undefined}
            onSelect={handleDateSelect}
            initialFocus
            className="bg-[#1a1a1a]"
          />
          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-white/60" />
              <span className="text-sm text-white/60">Time</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="flex flex-col items-center">
                <span className="text-xs text-white/40 mb-1">Hour</span>
                <div className="flex flex-col max-h-28 overflow-y-auto bg-[#0d0d0d] border border-white/10 rounded-lg py-1">
                  {hours12.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => handleTimeChange("hour", hour)}
                      className={`px-4 py-1.5 text-sm transition-all hover:bg-white/10 ${
                        selectedHour === parseInt(hour)
                          ? "bg-white/20 text-white font-medium"
                          : "text-white/70"
                      }`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-white text-lg mt-4">:</span>
              <div className="flex flex-col items-center">
                <span className="text-xs text-white/40 mb-1">Min</span>
                <div className="flex flex-col max-h-28 overflow-y-auto bg-[#0d0d0d] border border-white/10 rounded-lg py-1">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => handleTimeChange("minute", minute)}
                      className={`px-4 py-1.5 text-sm transition-all hover:bg-white/10 ${
                        selectedMinute === minute
                          ? "bg-white/20 text-white font-medium"
                          : "text-white/70"
                      }`}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center ml-2">
                <span className="text-xs text-white/40 mb-1">AM/PM</span>
                <div className="flex flex-col bg-[#0d0d0d] border border-white/10 rounded-lg py-1">
                  <button
                    type="button"
                    onClick={toggleAMPM}
                    className={`px-3 py-1.5 text-sm transition-all hover:bg-white/10 ${
                      !isPM
                        ? "bg-white/20 text-white font-medium"
                        : "text-white/70"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={toggleAMPM}
                    className={`px-3 py-1.5 text-sm transition-all hover:bg-white/10 ${
                      isPM
                        ? "bg-white/20 text-white font-medium"
                        : "text-white/70"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
