import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Popover } from "@base-ui/react/popover";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { localInterviewDate } from "@/lib/archiveDisplay";
import "./archive-date-picker.css";

interface ArchiveDatePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  describedBy?: string;
}

type CalendarView = "days" | "months" | "years";
const MIN_YEAR = 1900;
const MIN_DATE = new Date(MIN_YEAR, 0, 1);
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function parseDate(value: string) {
  const normalized = /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;
  const [year, month, day] = normalized.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return localInterviewDate(date) === normalized ? date : null;
}

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default function ArchiveDatePicker({ id, value, onChange, describedBy }: ArchiveDatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayValue = localInterviewDate(today);
  const selected = parseDate(value) ?? today;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => localInterviewDate(selected));
  const [focusedDate, setFocusedDate] = useState(draft);
  const [viewMonth, setViewMonth] = useState(() => monthStart(selected));
  const [view, setView] = useState<CalendarView>("days");
  const [yearStart, setYearStart] = useState(() => Math.floor(selected.getFullYear() / 12) * 12);
  const popup = useRef<HTMLDivElement>(null);
  const focusRequested = useRef(false);
  const captionId = useId();
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const lastYear = today.getFullYear();
  const currentMonthIndex = year * 12 + month;
  const lastMonthIndex = lastYear * 12 + today.getMonth();
  const previousDisabled = view === "years" ? yearStart <= MIN_YEAR
    : view === "months" ? year <= MIN_YEAR : currentMonthIndex <= MIN_YEAR * 12;
  const nextDisabled = view === "years" ? yearStart + 12 > lastYear
    : view === "months" ? year >= lastYear : currentMonthIndex >= lastMonthIndex;
  const caption = view === "years" ? `${Math.max(MIN_YEAR, yearStart)}–${Math.min(lastYear, yearStart + 11)}년`
    : view === "months" ? `${year}년 · 월 선택` : `${year}년 ${month + 1}월`;
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: 42 }, (_, index) => new Date(year, month, index - firstDay + 1));

  useLayoutEffect(() => {
    if (!focusRequested.current) return;
    focusRequested.current = false;
    popup.current?.querySelector<HTMLButtonElement>('[data-calendar-focus="true"]')?.focus();
  }, [focusedDate, viewMonth, view, yearStart]);

  const changeOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      const initial = parseDate(value) ?? today;
      const date = initial > today ? today : initial < MIN_DATE ? MIN_DATE : initial;
      const dateValue = localInterviewDate(date);
      setDraft(dateValue);
      setFocusedDate(dateValue);
      setViewMonth(monthStart(date));
      setYearStart(Math.floor(date.getFullYear() / 12) * 12);
      setView("days");
    }
    setOpen(nextOpen);
  };

  const showMonth = (date: Date, moveFocus = false) => {
    const bounded = date > today ? today : date < MIN_DATE ? MIN_DATE : date;
    focusRequested.current = moveFocus;
    setViewMonth(monthStart(bounded));
    setFocusedDate(localInterviewDate(bounded));
  };

  const navigate = (direction: number) => {
    if (view === "years") setYearStart((previous) => previous + direction * 12);
    else if (view === "months") showMonth(new Date(year + direction, month, 1));
    else showMonth(new Date(year, month + direction, 1));
  };

  const chooseDay = (date: Date) => {
    if (date < MIN_DATE || date > today) return;
    setDraft(localInterviewDate(date));
    showMonth(date, true);
  };

  const handleDayKey = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    let next: Date;
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (event.key in offsets) next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + offsets[event.key]);
    else if (event.key === "Home" || event.key === "End") next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + (event.key === "Home" ? -date.getDay() : 6 - date.getDay()));
    else if (event.key === "PageUp" || event.key === "PageDown") {
      const offset = (event.key === "PageUp" ? -1 : 1) * (event.shiftKey ? 12 : 1);
      const target = new Date(date.getFullYear(), date.getMonth() + offset, 1);
      const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
      next = new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
    } else return;
    event.preventDefault();
    if (next >= MIN_DATE && next <= today) showMonth(next, true);
  };

  return <Popover.Root open={open} onOpenChange={changeOpen} modal={false}>
    <Popover.Trigger type="button" id={id} className="archive-date-trigger" aria-describedby={describedBy}>
      <span>{value ? value.replaceAll("-", ".") : "YYYY.MM.DD"}</span>
      <CalendarDays size={18} aria-hidden="true" />
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner className="archive-date-positioner" side="bottom" align="start" sideOffset={10} collisionPadding={16} collisionAvoidance={{ side: "none", align: "shift", fallbackAxisSide: "none" }} positionMethod="fixed">
        <Popover.Popup ref={popup} className="archive-date-popup" initialFocus={() => popup.current?.querySelector<HTMLButtonElement>('[data-calendar-focus="true"]') ?? true}>
          <Popover.Title className="sr-only">면접 날짜 선택</Popover.Title>
          <Popover.Description className="sr-only">연도와 월을 이동하고 날짜를 고른 뒤 선택 버튼을 눌러 주세요. 오늘 이후 날짜는 선택할 수 없어요.</Popover.Description>
          <div className="archive-date-body">
            <div className="archive-date-navigation">
              <button type="button" className="archive-date-arrow" disabled={previousDisabled} aria-label={view === "years" ? "이전 12년" : view === "months" ? "이전 연도" : "이전 달"} onClick={() => navigate(-1)}><ChevronLeft size={16} aria-hidden="true" /></button>
              <div className="archive-date-heading">
                <button type="button" aria-label={`${year}년, 연도 선택`} aria-expanded={view === "years"} onClick={() => { focusRequested.current = true; setYearStart(Math.floor(year / 12) * 12); setView(view === "years" ? "days" : "years"); }}>{year}년<ChevronDown size={13} aria-hidden="true" /></button>
                <button type="button" aria-label={`${month + 1}월, 월 선택`} aria-expanded={view === "months"} onClick={() => { focusRequested.current = true; setView(view === "months" ? "days" : "months"); }}>{month + 1}월<ChevronDown size={13} aria-hidden="true" /></button>
              </div>
              <button type="button" className="archive-date-arrow" disabled={nextDisabled} aria-label={view === "years" ? "다음 12년" : view === "months" ? "다음 연도" : "다음 달"} onClick={() => navigate(1)}><ChevronRight size={16} aria-hidden="true" /></button>
            </div>
            <div className="archive-date-main">
              <p className="archive-date-caption" id={captionId} aria-live="polite">{caption}</p>
              {view === "days" ? <div role="grid" aria-labelledby={captionId} className="archive-date-grid">
                <div role="row" className="archive-date-week">{WEEKDAYS.map((day) => <span key={day} role="columnheader" aria-label={`${day}요일`}>{day}</span>)}</div>
                {Array.from({ length: 6 }, (_, row) => <div role="row" className="archive-date-week" key={row}>
                  {days.slice(row * 7, row * 7 + 7).map((date) => {
                    const dateValue = localInterviewDate(date);
                    const isSelected = dateValue === draft;
                    return <div key={dateValue} role="gridcell" aria-selected={isSelected}>
                      <button type="button" className="archive-date-day" data-outside={date.getMonth() !== month ? "true" : undefined} data-selected={isSelected ? "true" : undefined} data-calendar-focus={dateValue === focusedDate ? "true" : undefined} aria-label={`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`} aria-current={dateValue === todayValue ? "date" : undefined} disabled={date < MIN_DATE || date > today} tabIndex={dateValue === focusedDate ? 0 : -1} onClick={() => chooseDay(date)} onKeyDown={(event) => handleDayKey(event, date)}>{date.getDate()}</button>
                    </div>;
                  })}
                </div>)}
              </div> : <div className="archive-date-options" role="group" aria-labelledby={captionId}>
                {Array.from({ length: 12 }, (_, index) => {
                  const option = view === "years" ? yearStart + index : index;
                  const active = view === "years" ? option === year : option === month;
                  const disabled = view === "years" ? option < MIN_YEAR || option > lastYear : year === lastYear && option > today.getMonth();
                  return <button type="button" className="archive-date-option" key={`${view}-${option}`} disabled={disabled} aria-pressed={active} data-calendar-focus={active ? "true" : undefined} onClick={() => {
                    if (view === "years") { showMonth(new Date(option, month, 1), true); setView("months"); }
                    else { showMonth(new Date(year, option, 1), true); setView("days"); }
                  }}>{view === "years" ? `${option}년` : `${option + 1}월`}</button>;
                })}
              </div>}
            </div>
          </div>
          <div className="archive-date-footer">
            <button type="button" className="archive-date-today" onClick={() => { chooseDay(today); setView("days"); }}>오늘</button>
            <div className="archive-date-actions">
              <Popover.Close type="button" className="archive-date-cancel">취소</Popover.Close>
              <button type="button" className="archive-date-confirm" onClick={() => { onChange(draft); setOpen(false); }}>선택</button>
            </div>
          </div>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>;
}
