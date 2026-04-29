import { useMemo } from 'react';
import { useAppStore } from '../../store/app-store';
import { formatDisplayDate, getDayLabel } from '../../utils/date';
import ClassCard from './ClassCard';

export default function DailyView({ filter }) {
  const { state } = useAppStore();

  const dailyItems = useMemo(() => {
    let base = state.scheduledClasses.filter((item) => item.date === state.selectedDate);
    if (!base.length) {
      const dayLabel = getDayLabel(state.selectedDate);
      base = state.weeklyClasses[dayLabel] || [];
    }

    // Apply filters
    return base.filter(cls => {
      const matchesSchool = !filter.schoolId || cls.schoolId === filter.schoolId;
      const matchesType = !filter.type || cls.type === filter.type;
      
      let matchesGrade = !filter.grade;
      if (filter.grade) {
        const classStudents = (cls.studentIds || [])
          .map(id => state.students.find(s => s.id === id))
          .filter(Boolean);
        matchesGrade = classStudents.some(s => s.grade === filter.grade) || cls.grade === filter.grade;
      }

      return matchesSchool && matchesType && matchesGrade;
    });
  }, [state.selectedDate, state.scheduledClasses, state.weeklyClasses, filter, state.students]);

  return (
    <div className="daily-view-wrapper">
      <div className="daily-header glass">
        <div className="daily-title">
          <h3>{formatDisplayDate(state.selectedDate)} ({getDayLabel(state.selectedDate)})</h3>
          <p className="subtitle">필터링 된 수업 <strong>{dailyItems.length}</strong>건</p>
        </div>
      </div>

      {!dailyItems.length ? (
        <div className="empty-placeholder glass">
          <p>예정된 수업이 없습니다.</p>
        </div>
      ) : (
        <div className="daily-list">
          {dailyItems.map((item) => (
            <ClassCard key={item.id} classItem={item} />
          ))}
        </div>
      )}
    </div>
  );
}
