import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/app-store';
import { getDayLabel, getDateKey } from '../../utils/date';

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function MonthlyView({ filter }) {
  const { state, dispatch } = useAppStore();
  const [dayPanelDate, setDayPanelDate] = useState(null);

  const base = new Date(state.selectedDate || new Date());
  const year = base.getFullYear();
  const month = base.getMonth();

  const calendarData = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      const d = new Date(year, month, 1 - (firstDayOfWeek - i));
      days.push({ key: getDateKey(d), date: d.getDate(), isOutside: true });
    }
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({ key: getDateKey(d), date: i, isOutside: false });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ key: getDateKey(d), date: d.getDate(), isOutside: true });
    }
    return days;
  }, [year, month]);

  const classesByDate = useMemo(() => {
    const map = {};
    state.scheduledClasses
      .filter(cls => {
        const matchesSchool = !filter.schoolId || cls.schoolId === filter.schoolId;
        const matchesType = !filter.type || cls.type === filter.type;
        let matchesGrade = !filter.grade;
        if (filter.grade) {
          const classStudents = (cls.studentIds || [])
            .map(id => state.students.find(s => s.id === id)).filter(Boolean);
          matchesGrade = classStudents.some(s => s.grade === filter.grade) || cls.grade === filter.grade;
        }
        return matchesSchool && matchesType && matchesGrade;
      })
      .forEach((item) => {
        if (!map[item.date]) map[item.date] = [];
        map[item.date].push(item);
      });

    // Also map weekly classes for dates without scheduled ones
    calendarData.forEach(day => {
      if (!day.isOutside && !map[day.key]) {
        const dayLabel = getDayLabel(day.key);
        let weekly = (state.weeklyClasses[dayLabel] || []).filter(cls => {
          const matchesSchool = !filter.schoolId || cls.schoolId === filter.schoolId;
          const matchesType = !filter.type || cls.type === filter.type;
          return matchesSchool && matchesType;
        });
        if (weekly.length) {
          map[day.key] = weekly.map(w => ({ ...w, renderDate: day.key, renderDay: dayLabel }));
        }
      }
    });

    return map;
  }, [state.scheduledClasses, state.weeklyClasses, filter, state.students, calendarData]);

  // Exam dates
  const examDates = useMemo(() => {
    const set = new Set();
    (state.schools || []).forEach(sch => {
      (sch.examSchedules || []).forEach(ex => set.add(ex.examDate));
    });
    (state.exams || []).forEach(e => set.add(e.date));
    return set;
  }, [state.schools, state.exams]);

  const handleCellClick = (dateKey) => {
    setDayPanelDate(dateKey === dayPanelDate ? null : dateKey);
  };

  const handleGoToDay = (dateKey) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: dateKey });
    dispatch({ type: 'SET_SCHEDULE_VIEW', payload: 'daily' });
  };

  const todayKey = getDateKey(new Date());
  const dayPanelItems = dayPanelDate ? (classesByDate[dayPanelDate] || []) : [];

  return (
    <div className="monthly-calendar-container fade-in">
      {/* Month navigation */}
      <div className="month-nav-bar">
        <button className="month-nav-btn" onClick={() => dispatch({ type: 'MOVE_MONTH', payload: -1 })}>◀</button>
        <div className="month-nav-center">
          <h3>{year}년 {month + 1}월</h3>
          <button className="week-today-btn" onClick={() => dispatch({ type: 'GO_TODAY' })}>오늘</button>
        </div>
        <button className="month-nav-btn" onClick={() => dispatch({ type: 'MOVE_MONTH', payload: 1 })}>▶</button>
      </div>

      <div className="calendar-grid-header">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="calendar-day-name">{day}</div>
        ))}
      </div>

      <div className="calendar-grid-body">
        {calendarData.map((day) => {
          const items = classesByDate[day.key] || [];
          const isToday = day.key === todayKey;
          const hasExam = examDates.has(day.key);
          const isSelected = day.key === dayPanelDate;

          return (
            <div
              key={day.key}
              className={`calendar-cell ${day.isOutside ? 'outside' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleCellClick(day.key)}
            >
              <div className="cell-header">
                <span className="cell-date">{day.date}</span>
                <div style={{ display: 'flex', gap: 3 }}>
                  {hasExam && <span className="cell-exam-dot">📝</span>}
                  {items.length > 0 && <span className="cell-count">{items.length}</span>}
                </div>
              </div>
              <div className="classes-dot-wrap">
                {items.slice(0, 3).map((item) => (
                  <div key={item.id} className="class-dot">
                    {item.time} {item.name}
                  </div>
                ))}
                {items.length > 3 && <div className="class-dot more">외 {items.length - 3}건</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Panel */}
      {dayPanelDate && (
        <div className="day-panel fade-in">
          <div className="day-panel-header">
            <h4>
              {new Date(dayPanelDate).getMonth() + 1}월 {new Date(dayPanelDate).getDate()}일 ({getDayLabel(dayPanelDate)})
            </h4>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-small-primary" onClick={() => handleGoToDay(dayPanelDate)}>일간 보기</button>
              <button className="close-btn" onClick={() => setDayPanelDate(null)} style={{ fontSize: 18 }}>×</button>
            </div>
          </div>
          {dayPanelItems.length === 0 ? (
            <div className="day-panel-empty">수업이 없습니다</div>
          ) : (
            <div className="day-panel-list">
              {dayPanelItems.map(item => (
                <div className="day-panel-item" key={item.id}>
                  <span className="dp-time">{item.time}</span>
                  <span className="dp-name">{item.name}</span>
                  <span className="dp-type">{item.type}</span>
                  <span className="dp-count">{(item.studentIds || []).length}명</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
