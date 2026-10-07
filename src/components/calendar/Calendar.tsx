"use client";
import { useState } from "react";
import { Task } from "@/lib/firebase/firestore";

interface CalendarProps {
  tasks: Task[];
  onSelectDate: (date: Date) => void;
  selectedDate: Date | null;
}

export default function Calendar({ tasks, onSelectDate, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  const monthNames = [
    "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"
  ];
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const getTasksForDay = (day: number) => {
    return tasks.filter((t) => {
      const d = t.startTime.toDate();
      return (
        d.getDate() === day &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(year, month - 1))}
          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          ◀
        </button>
        <h2 className="font-bold text-lg text-white">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={() => setCurrentMonth(new Date(year, month + 1))}
          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2 text-center text-xs font-semibold text-slate-400">
        {dayNames.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: adjustedFirstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayTasks = getTasksForDay(day);
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;
          const isSelected =
            selectedDate?.getDate() === day &&
            selectedDate?.getMonth() === month &&
            selectedDate?.getFullYear() === year;

          return (
            <button
              key={day}
              onClick={() => onSelectDate(new Date(year, month, day))}
              className={`min-h-[48px] p-1.5 rounded-xl text-sm font-medium flex flex-col items-center transition-all ${
                isToday
                  ? "bg-indigo-600 text-white font-bold"
                  : isSelected
                  ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/50"
                  : "hover:bg-slate-700 text-slate-300"
              }`}
            >
              <span>{day}</span>
              {dayTasks.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {dayTasks.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}