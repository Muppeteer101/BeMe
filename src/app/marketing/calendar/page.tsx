"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface CalendarEvent {
  id: string;
  title: string;
  channel: string;
  time: string;
  color: string;
}

const MOCK_EVENTS: Record<string, CalendarEvent[]> = {
  "2025-02-03": [{ id: "1", title: "Kitchen Tips Post", channel: "Instagram", time: "9:00 AM", color: "bg-pink-500" }],
  "2025-02-05": [{ id: "2", title: "Industry Newsletter", channel: "Email", time: "10:00 AM", color: "bg-blue-500" }],
  "2025-02-07": [
    { id: "3", title: "Before/After Reel", channel: "TikTok", time: "12:00 PM", color: "bg-cyan-500" },
    { id: "4", title: "Weekly Roundup", channel: "LinkedIn", time: "3:00 PM", color: "bg-indigo-500" },
  ],
  "2025-02-10": [{ id: "5", title: "Product Demo Video", channel: "YouTube", time: "2:00 PM", color: "bg-red-500" }],
  "2025-02-12": [{ id: "6", title: "Customer Story Thread", channel: "X (Twitter)", time: "11:00 AM", color: "bg-gray-500" }],
  "2025-02-14": [{ id: "7", title: "Valentine's Special", channel: "Instagram", time: "9:00 AM", color: "bg-pink-500" }],
  "2025-02-18": [{ id: "8", title: "How-To Tutorial", channel: "YouTube", time: "4:00 PM", color: "bg-red-500" }],
  "2025-02-21": [{ id: "9", title: "Flash Sale Ad", channel: "Facebook", time: "8:00 AM", color: "bg-blue-600" }],
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export default function CalendarPage() {
  const router = useRouter();
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(1); // February

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Calendar</h1>
          <p className="text-gray-400 mt-1">Plan and schedule your content</p>
        </div>
        <button
          onClick={() => router.push("/marketing/content/create")}
          className="bg-violet-600 text-white font-medium py-2.5 px-5 rounded-lg hover:bg-violet-500 transition-colors text-sm"
        >
          + Schedule Content
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl p-4">
        <button onClick={prevMonth} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
          ← Prev
        </button>
        <h2 className="text-xl font-semibold">{MONTHS[month]} {year}</h2>
        <button onClick={nextMonth} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-800">
          {DAYS.map((day) => (
            <div key={day} className="p-3 text-center text-xs font-medium text-gray-500 uppercase">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {paddingDays.map((i) => (
            <div key={`pad-${i}`} className="min-h-[100px] border-b border-r border-gray-800 bg-gray-900/50" />
          ))}
          {days.map((day) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const events = MOCK_EVENTS[dateStr] || [];
            return (
              <div key={day} className="min-h-[100px] border-b border-r border-gray-800 p-2 hover:bg-gray-800/30 transition-colors">
                <p className="text-xs text-gray-500 mb-1">{day}</p>
                <div className="space-y-1">
                  {events.map((event) => (
                    <div key={event.id} className={`${event.color} text-white text-xs px-1.5 py-1 rounded truncate`}>
                      {event.time} {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
