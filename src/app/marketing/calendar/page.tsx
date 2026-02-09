"use client";

import { useState, useEffect } from "react";
import { brandStore, contentStore, type ContentPiece } from "@/lib/store";
import { getPlatformByName } from "@/lib/platforms";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function isToday(year: number, month: number, day: number): boolean {
  const today = new Date();
  return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
}

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeBrand, setActiveBrand] = useState(brandStore.getActive());
  const [allContent, setAllContent] = useState<ContentPiece[]>([]);

  useEffect(() => {
    const brand = brandStore.getActive();
    setActiveBrand(brand);
    if (brand) {
      const brandContent = contentStore.getByBrand(brand.id);
      setAllContent(brandContent);
    }
  }, []);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const getEventsForDay = (day: number): ContentPiece[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return allContent.filter(
      (c) => c.status === "scheduled" && c.scheduledDate === dateStr
    );
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const readyContent = allContent.filter((c) => c.status === "ready");

  const handleScheduleContent = (contentId: string, scheduleDate: string, scheduleTime: string) => {
    contentStore.update(contentId, {
      status: "scheduled",
      scheduledDate: scheduleDate,
      scheduledTime: scheduleTime,
    });
    const updated = contentStore.getByBrand(activeBrand?.id || "");
    setAllContent(updated);
    setShowScheduleModal(false);
  };

  return (
    <div className="p-8 space-y-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Calendar</h1>
          <p className="text-gray-400 mt-1">Plan and schedule your content</p>
          {activeBrand && <p className="text-violet-400 text-sm mt-1">{activeBrand.name}</p>}
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="bg-violet-600 text-white font-medium py-2.5 px-5 rounded-lg hover:bg-violet-500 transition-colors text-sm"
        >
          + Schedule Content
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl p-4">
        <button
          onClick={prevMonth}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          ← Prev
        </button>
        <h2 className="text-xl font-semibold text-white">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-800 bg-gray-800/50">
          {DAYS.map((day) => (
            <div key={day} className="p-3 text-center text-xs font-medium text-gray-500 uppercase">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {paddingDays.map((i) => (
            <div key={`pad-${i}`} className="min-h-[120px] border-b border-r border-gray-800 bg-gray-950" />
          ))}
          {days.map((day) => {
            const events = getEventsForDay(day);
            const isTodayDate = isToday(year, month, day);
            return (
              <div
                key={day}
                onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                className={`min-h-[120px] border-b border-r border-gray-800 p-2 cursor-pointer transition-colors ${
                  isTodayDate ? "bg-violet-600/20" : "hover:bg-gray-800/30"
                } ${selectedDay === day ? "bg-violet-600/30" : ""}`}
              >
                <p
                  className={`text-xs mb-1 font-semibold ${
                    isTodayDate ? "text-violet-400" : "text-gray-500"
                  }`}
                >
                  {day}
                  {isTodayDate && " (Today)"}
                </p>
                <div className="space-y-1">
                  {events.map((event) => {
                    const platform = getPlatformByName(event.platform);
                    return (
                      <div
                        key={event.id}
                        className={`${
                          platform?.bgColor || "bg-gray-600"
                        } text-white text-xs px-1.5 py-1 rounded truncate font-medium`}
                      >
                        {event.scheduledTime && (
                          <span className="mr-1">{event.scheduledTime}</span>
                        )}
                        <span className="truncate">{event.headline}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail Panel */}
      {selectedDay !== null && (
        <div className="bg-gray-900 border border-violet-500/30 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">
              {MONTHS[month]} {selectedDay}, {year}
            </h2>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-gray-500 hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <p className="text-gray-400 text-sm">No content scheduled for this day</p>
          ) : (
            <div className="space-y-3">
              {selectedDayEvents.map((event) => {
                const platform = getPlatformByName(event.platform);
                return (
                  <div
                    key={event.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{event.headline}</h3>
                        <p className="text-sm text-gray-400 mt-1">{event.body.substring(0, 100)}...</p>
                      </div>
                      <span
                        className={`inline-block w-3 h-3 rounded-full mt-1 ${
                          platform?.bgColor || "bg-gray-600"
                        }`}
                      ></span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>{event.platform}</span>
                      <span>{event.contentType}</span>
                      {event.scheduledTime && <span>{event.scheduledTime}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Schedule Content Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Schedule Content</h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-500 hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {readyContent.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No ready content to schedule. Create content in the Creative Room first.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase font-semibold">Select content to schedule:</p>
                {readyContent.map((content) => {
                  const platform = getPlatformByName(content.platform);
                  return (
                    <div
                      key={content.id}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-pointer hover:border-violet-500 transition-colors"
                      onClick={() => {
                        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
                          selectedDay || 1
                        ).padStart(2, "0")}`;
                        const time = prompt("Enter time (HH:MM):", "09:00");
                        if (time) {
                          handleScheduleContent(content.id, dateStr, time);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`inline-block w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                            platform?.bgColor || "bg-gray-600"
                          }`}
                        ></span>
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate">
                            {content.headline}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{content.platform}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setShowScheduleModal(false)}
              className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
