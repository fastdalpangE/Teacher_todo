import { useMemo } from 'react';
import { useAppStore } from '../../store/app-store';
import { getWeekDates, getDayLabel, formatDisplayDate } from '../../utils/date';
import ClassCard from './ClassCard';

export default function WeeklyView({ filter }) {
  const { state, dispatch } = useAppStore();

  const weekDates = useMemo(() => getWeekDates(state.selectedDate || new Date()), [state.selectedDate]);

  const allWeeklyItems = useMemo(() => {
    let combined = [];
    weekDates.forEach((dateKey) => {
      const dayLabel = getDayLabel(dateKey);
      let items = state.scheduledClasses.filter((item) => item.date === dateKey);
      if (!items.length) {
        items = state.weeklyClasses[dayLabel] || [];
      }

      const itemsWithDate = items.map(item => ({
        ...item, renderDate: dateKey, renderDay: dayLabel
      }));
      combined = [...combined, ...itemsWithDate];
    });

    // Apply filters
    combined = combined.filter(cls => {
      const matchesSchool = !filter.schoolId || cls.schoolId === filter.schoolId;
      const matchesType = !filter.type || cls.type === filter.type;
      let matchesGrade = !filter.grade;
      if (filter.grade) {
        const classStudents = (cls.studentIds || [])
          .map(id => state.students.find(s => s.id === id)).filter(Boolean);
        matchesGrade = classStudents.some(s => s.grade === filter.grade) || cls.grade === filter.grade;
      }
      return matchesSchool && matchesType && matchesGrade;
    });

    combined.sort((a, b) => {
      if (a.renderDate !== b.renderDate) return a.renderDate.localeCompare(b.renderDate);
      return (a.time || '').localeCompare(b.time || '');
    });

    return combined;
  }, [state, filter, weekDates]);

  // Stats
  const stats = useMemo(() => {
    const totalClasses = allWeeklyItems.length;
    const uniqueStudents = new Set();
    allWeeklyItems.forEach(c => (c.studentIds || []).forEach(id => uniqueStudents.add(id)));
    const todoCount = (state.todos || []).filter(t => !t.done).length;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const upcomingExams = [
      ...(state.exams || []),
      ...(state.schools || []).flatMap(sch => (sch.examSchedules || []).map(ex => ({ date: ex.examDate })))
    ].filter(e => {
      const d = new Date(e.date); d.setHours(0, 0, 0, 0);
      return d >= today;
    }).length;

    return { totalClasses, studentCount: uniqueStudents.size, todoCount, upcomingExams };
  }, [allWeeklyItems, state.todos, state.exams, state.schools]);

  let lastRenderedDate = null;

  return (
    <div className="weekly-list-view fade-in">
      {/* Week navigation */}
      <div className="week-nav-bar glass">
        <button className="week-nav-btn" onClick={() => dispatch({ type: 'MOVE_WEEK', payload: -1 })}>◀</button>
        <div className="week-nav-center">
          <h3 className="week-nav-title">
            {formatDisplayDate(weekDates[0])} ({getDayLabel(weekDates[0])}) ~ {formatDisplayDate(weekDates[6])} ({getDayLabel(weekDates[6])})
          </h3>
          <button className="week-today-btn" onClick={() => dispatch({ type: 'GO_TODAY' })}>오늘</button>
        </div>
        <button className="week-nav-btn" onClick={() => dispatch({ type: 'MOVE_WEEK', payload: 1 })}>▶</button>
      </div>

      {/* Stats */}
      <div className="stat-row">
        <div className="sbox">
          <div className="snum" style={{ color: 'var(--blue)' }}>{stats.totalClasses}</div>
          <div className="slbl">수업</div>
        </div>
        <div className="sbox">
          <div className="snum" style={{ color: 'var(--green)' }}>{stats.studentCount}</div>
          <div className="slbl">학생</div>
        </div>
        <div className="sbox">
          <div className="snum" style={{ color: 'var(--yellow)' }}>{stats.todoCount}</div>
          <div className="slbl">할일</div>
        </div>
        <div className="sbox">
          <div className="snum" style={{ color: 'var(--red)' }}>{stats.upcomingExams}</div>
          <div className="slbl">D-Day</div>
        </div>
      </div>

      {/* Class list */}
      <div className="classes-stack">
        {!allWeeklyItems.length ? (
          <div className="empty-state-card">이번 주 일정이 없습니다.</div>
        ) : (
          allWeeklyItems.map((classItem, idx) => {
            const showDateHeader = classItem.renderDate !== lastRenderedDate;
            lastRenderedDate = classItem.renderDate;
            const isToday = classItem.renderDate === new Date().toISOString().slice(0, 10);

            return (
              <div key={`${classItem.id}-${classItem.renderDate}-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {showDateHeader && (
                  <div className="day-date-header" style={{ marginTop: idx === 0 ? 0 : 12 }}>
                    <span className="day-date-bar" style={{ background: isToday ? 'var(--red)' : 'var(--blue)' }} />
                    {formatDisplayDate(classItem.renderDate)} ({classItem.renderDay})
                    {isToday && <span className="day-today-badge">오늘</span>}
                  </div>
                )}
                <ClassCard classItem={classItem} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
