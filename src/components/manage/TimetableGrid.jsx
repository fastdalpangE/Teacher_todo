import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/app-store';
import { createId } from '../../utils/ids';

const WEEK_DAYS = ['월', '화', '수', '목', '금', '토'];
const ALL_HOURS = Array.from({ length: 10 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00`);

const TYPE_COLORS = {
  리딩: '#2563eb',
  문법: '#7c3aed',
  듣기: '#0891b2',
  파닉스: '#16a34a',
  쓰기: '#d97706',
  기타: '#6b7280'
};

const AVATAR_COLORS = ['#e8573f', '#2563eb', '#16a34a', '#d97706', '#8b5cf6', '#ec4899', '#0891b2', '#65a30d'];
function avatarColor(name) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function TimetableGrid() {
  const { state, dispatch } = useAppStore();
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'student'
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState('월');

  // Gather all unique time slots from classes + fixed 9-18 range
  const timeSlots = useMemo(() => {
    const set = new Set(ALL_HOURS);
    WEEK_DAYS.forEach((day) => {
      (state.weeklyClasses[day] || []).forEach((item) => set.add(item.time));
    });
    return Array.from(set).sort();
  }, [state.weeklyClasses]);

  // Filter classes for a specific student
  const getClassesForCell = (day, time) => {
    let classes = (state.weeklyClasses[day] || []).filter((item) => item.time === time);
    if (viewMode === 'student' && selectedStudentId) {
      classes = classes.filter((cls) =>
        (cls.studentIds || []).includes(selectedStudentId)
      );
    }
    return classes;
  };

  // Check if a time slot has any classes across all days (for hiding empty rows in student view)
  const hasAnyClass = (time) => {
    return WEEK_DAYS.some((day) => getClassesForCell(day, time).length > 0);
  };

  // In student mode, only show rows that have classes (plus the fixed hours for context)
  const displayTimeSlots = useMemo(() => {
    if (viewMode === 'student' && selectedStudentId) {
      return timeSlots.filter((time) => hasAnyClass(time) || ALL_HOURS.includes(time));
    }
    return timeSlots;
  }, [timeSlots, viewMode, selectedStudentId, state.weeklyClasses]);

  const selectedStudent = useMemo(() => {
    return state.students.find((s) => s.id === selectedStudentId) || null;
  }, [selectedStudentId, state.students]);

  // Count total classes for selected student
  const studentClassCount = useMemo(() => {
    if (!selectedStudentId) return 0;
    let count = 0;
    WEEK_DAYS.forEach((day) => {
      (state.weeklyClasses[day] || []).forEach((cls) => {
        if ((cls.studentIds || []).includes(selectedStudentId)) count++;
      });
    });
    return count;
  }, [selectedStudentId, state.weeklyClasses]);

  const handleAddWeekly = () => {
    const name = prompt('수업명을 입력하세요:');
    if (!name) return;
    const time = prompt('시간을 입력하세요 (예: 14:00):', '14:00');
    if (!time) return;
    const type = prompt('종류를 입력하세요 (리딩/문법/듣기/파닉스/쓰기/기타):', '기타');

    const newClass = {
      id: createId('weekly'),
      dayOfWeek: editingDay,
      time,
      name,
      type: type || '기타',
      book: '',
      hw: '',
      classMemo: '',
      studentIds: []
    };

    dispatch({
      type: 'UPSERT_WEEKLY_CLASS',
      payload: { day: editingDay, cls: newClass }
    });
  };

  const handleDeleteWeekly = (day, id) => {
    if (confirm('이 반복 수업을 삭제하시겠습니까?')) {
      dispatch({
        type: 'DELETE_WEEKLY_CLASS',
        payload: { day, id }
      });
    }
  };

  const todayDow = ['일', '월', '화', '수', '목', '금', '토'][new Date().getDay()];

  return (
    <div className="timetable-container card glass overflow-hidden fade-in">
      {/* View mode toggle */}
      <div className="tt-view-toggle">
        <button
          className={`tt-toggle-btn ${viewMode === 'all' ? 'active' : ''}`}
          onClick={() => { setViewMode('all'); setSelectedStudentId(''); }}
        >
          📋 전체 시간표
        </button>
        <button
          className={`tt-toggle-btn ${viewMode === 'student' ? 'active' : ''}`}
          onClick={() => setViewMode('student')}
        >
          👤 학생별 시간표
        </button>
      </div>

      {/* Student selector */}
      {viewMode === 'student' && (
        <div className="tt-student-selector">
          <div className="tt-student-select-row">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="tt-student-select"
            >
              <option value="">학생을 선택하세요</option>
              {state.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.grade} · {s.schoolName || '학교미지정'})
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="tt-student-info">
              <div className="tt-stu-avatar" style={{ background: avatarColor(selectedStudent.name) }}>
                {selectedStudent.name[0]}
              </div>
              <div className="tt-stu-detail">
                <div className="tt-stu-name">{selectedStudent.name}</div>
                <div className="tt-stu-meta">
                  {selectedStudent.grade} · {selectedStudent.schoolName || '학교미지정'} · 주 {studentClassCount}회 수업
                </div>
              </div>
            </div>
          )}

          {viewMode === 'student' && !selectedStudentId && (
            <div className="tt-student-chips">
              {state.students.map((s) => (
                <button
                  key={s.id}
                  className="tt-stu-chip"
                  onClick={() => setSelectedStudentId(s.id)}
                >
                  <span className="tt-chip-avatar" style={{ background: avatarColor(s.name) }}>
                    {s.name[0]}
                  </span>
                  {s.name}
                  <span className="tt-chip-grade">{s.grade}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timetable header */}
      <div className="card-header">
        <div className="title-row-simple">
          <h3>
            {viewMode === 'student' && selectedStudent
              ? `${selectedStudent.name} 시간표`
              : '주간 반복 시간표'}
          </h3>
          <button className="btn-small-primary" onClick={() => setIsModalOpen(true)}>시간표 관리</button>
        </div>
      </div>

      {/* Legend */}
      <div className="tt-legend">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <span key={type} className="tt-legend-item">
            <span className="tt-legend-dot" style={{ background: color }} />
            {type}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="table-scroll">
        <table className="timetable-grid tt-enhanced">
          <thead>
            <tr>
              <th className="sticky-col tt-time-header">시간</th>
              {WEEK_DAYS.map((day) => {
                const isToday = day === todayDow;
                const count = (state.weeklyClasses[day] || []).filter((cls) => {
                  if (viewMode === 'student' && selectedStudentId) {
                    return (cls.studentIds || []).includes(selectedStudentId);
                  }
                  return true;
                }).length;
                return (
                  <th
                    key={day}
                    className={`tt-day-header ${isToday ? 'tt-today' : ''}`}
                  >
                    <div className="tt-day-name">{day}</div>
                    <div className="tt-day-count">{count}수업</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayTimeSlots.map((time) => {
              const hasClasses = WEEK_DAYS.some((day) => getClassesForCell(day, time).length > 0);
              return (
                <tr key={time} className={hasClasses ? 'tt-row-active' : 'tt-row-empty'}>
                  <td className="sticky-col tt-time-cell">{time}</td>
                  {WEEK_DAYS.map((day) => {
                    const classes = getClassesForCell(day, time);
                    const isToday = day === todayDow;
                    return (
                      <td
                        key={`${day}-${time}`}
                        className={`tt-cell ${isToday ? 'tt-cell-today' : ''}`}
                      >
                        {classes.map((item) => {
                          const color = TYPE_COLORS[item.type] || TYPE_COLORS.기타;
                          const stuCount = viewMode === 'student'
                            ? null
                            : (item.studentIds || []).length;
                          return (
                            <div
                              className="tt-block"
                              key={item.id}
                              style={{ background: color }}
                            >
                              <div className="tt-block-name">{item.name}</div>
                              <div className="tt-block-meta">
                                {item.type}
                                {stuCount !== null && ` · ${stuCount}명`}
                              </div>
                              {item.book && (
                                <div className="tt-block-book">📖 {item.book}</div>
                              )}
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state for student mode */}
      {viewMode === 'student' && selectedStudentId && studentClassCount === 0 && (
        <div className="tt-empty">
          등록된 수업이 없습니다.
        </div>
      )}

      {/* Manage modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-panel glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>기본 시간표 설정</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="day-selector-tabs">
                {WEEK_DAYS.map((day) => (
                  <button
                    key={day}
                    className={editingDay === day ? 'active' : ''}
                    onClick={() => setEditingDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="weekly-edit-list">
                <div className="list-header">
                  <strong>{editingDay}요일 수업 목록</strong>
                  <button className="btn-small-primary" onClick={handleAddWeekly}>+ 수업 추가</button>
                </div>
                {(state.weeklyClasses[editingDay] || []).map((cls) => (
                  <div className="weekly-edit-item glass" key={cls.id}>
                    <div className="w-info">
                      <span
                        className="tt-edit-dot"
                        style={{ background: TYPE_COLORS[cls.type] || TYPE_COLORS.기타 }}
                      />
                      <span className="w-time">{cls.time}</span>
                      <span className="w-name">{cls.name}</span>
                      <span className="w-type-badge">{cls.type}</span>
                      <span className="w-stu-count">{(cls.studentIds || []).length}명</span>
                    </div>
                    <button className="btn-icon-danger" onClick={() => handleDeleteWeekly(editingDay, cls.id)}>×</button>
                  </div>
                ))}
                {(state.weeklyClasses[editingDay] || []).length === 0 && (
                  <div className="tt-edit-empty">등록된 수업이 없습니다</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
