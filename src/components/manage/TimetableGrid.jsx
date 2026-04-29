import { useMemo, useState } from 'react';
import { useAppStore, useToast } from '../../store/app-store';
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

const TYPE_OPTIONS = Object.keys(TYPE_COLORS);

const FREQ_OPTIONS = [
  { label: '주 1회', days: 1 },
  { label: '주 2회', days: 2 },
  { label: '주 3회', days: 3 },
  { label: '주 4회', days: 4 },
  { label: '주 5회', days: 5 },
  { label: '매일 (월~토)', days: 6 }
];

const AVATAR_COLORS = ['#e8573f', '#2563eb', '#16a34a', '#d97706', '#8b5cf6', '#ec4899', '#0891b2', '#65a30d'];
function avatarColor(name) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

const INITIAL_FORM = {
  name: '',
  type: '리딩',
  time: '14:00',
  freq: 1,
  selectedDays: [],
  book: '',
  hw: '',
  studentIds: []
};

export default function TimetableGrid() {
  const { state, dispatch } = useAppStore();
  const showToast = useToast();
  const [viewMode, setViewMode] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [editingDay, setEditingDay] = useState('월');
  const [form, setForm] = useState({ ...INITIAL_FORM });

  // Gather all unique time slots
  const timeSlots = useMemo(() => {
    const set = new Set(ALL_HOURS);
    WEEK_DAYS.forEach((day) => {
      (state.weeklyClasses[day] || []).forEach((item) => set.add(item.time));
    });
    return Array.from(set).sort();
  }, [state.weeklyClasses]);

  const getClassesForCell = (day, time) => {
    let classes = (state.weeklyClasses[day] || []).filter((item) => item.time === time);
    if (viewMode === 'student' && selectedStudentId) {
      classes = classes.filter((cls) => (cls.studentIds || []).includes(selectedStudentId));
    }
    return classes;
  };

  const hasAnyClass = (time) => {
    return WEEK_DAYS.some((day) => getClassesForCell(day, time).length > 0);
  };

  const displayTimeSlots = useMemo(() => {
    if (viewMode === 'student' && selectedStudentId) {
      return timeSlots.filter((time) => hasAnyClass(time) || ALL_HOURS.includes(time));
    }
    return timeSlots;
  }, [timeSlots, viewMode, selectedStudentId, state.weeklyClasses]);

  const selectedStudent = useMemo(() => {
    return state.students.find((s) => s.id === selectedStudentId) || null;
  }, [selectedStudentId, state.students]);

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

  // ── ADD CLASS (에브리타임 style) ──
  const openAddModal = () => {
    setForm({ ...INITIAL_FORM });
    setShowAddModal(true);
  };

  const handleToggleDay = (day) => {
    setForm(prev => {
      const days = [...prev.selectedDays];
      const idx = days.indexOf(day);
      if (idx >= 0) {
        days.splice(idx, 1);
      } else {
        if (days.length < prev.freq) {
          days.push(day);
        } else {
          // Replace the first one
          days.shift();
          days.push(day);
        }
      }
      return { ...prev, selectedDays: days };
    });
  };

  const handleToggleStudent = (studentId) => {
    setForm(prev => {
      const ids = [...prev.studentIds];
      const idx = ids.indexOf(studentId);
      if (idx >= 0) ids.splice(idx, 1);
      else ids.push(studentId);
      return { ...prev, studentIds: ids };
    });
  };

  const handleSubmitAdd = () => {
    if (!form.name.trim()) return alert('수업명을 입력해주세요');
    if (form.selectedDays.length === 0) return alert('요일을 선택해주세요');

    form.selectedDays.forEach(day => {
      const newClass = {
        id: createId('weekly'),
        dayOfWeek: day,
        time: form.time,
        name: form.name.trim(),
        type: form.type,
        book: form.book,
        hw: form.hw,
        classMemo: '',
        studentIds: [...form.studentIds]
      };
      dispatch({ type: 'UPSERT_WEEKLY_CLASS', payload: { day, cls: newClass } });
    });

    showToast?.(`${form.name} 수업이 ${form.selectedDays.join(', ')}요일에 추가되었습니다`);
    setShowAddModal(false);
  };

  // ── DELETE ──
  const handleDeleteWeekly = (day, id) => {
    if (confirm('이 반복 수업을 삭제하시겠습니까?')) {
      dispatch({ type: 'DELETE_WEEKLY_CLASS', payload: { day, id } });
      showToast?.('수업이 삭제되었습니다');
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
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-small-primary" onClick={openAddModal}>＋ 수업 추가</button>
            <button className="btn-small-outline" onClick={() => setShowManageModal(true)}>📋 관리</button>
          </div>
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
                  <th key={day} className={`tt-day-header ${isToday ? 'tt-today' : ''}`}>
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
                      <td key={`${day}-${time}`} className={`tt-cell ${isToday ? 'tt-cell-today' : ''}`}>
                        {classes.map((item) => {
                          const color = TYPE_COLORS[item.type] || TYPE_COLORS.기타;
                          const stuCount = viewMode === 'student' ? null : (item.studentIds || []).length;
                          return (
                            <div className="tt-block" key={item.id} style={{ background: color }}>
                              <div className="tt-block-name">{item.name}</div>
                              <div className="tt-block-meta">
                                {item.type}
                                {stuCount !== null && ` · ${stuCount}명`}
                              </div>
                              {item.book && <div className="tt-block-book">📖 {item.book}</div>}
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

      {viewMode === 'student' && selectedStudentId && studentClassCount === 0 && (
        <div className="tt-empty">등록된 수업이 없습니다.</div>
      )}

      {/* ═══════════════════════════════════════
          ADD CLASS MODAL (에브리타임 style)
         ═══════════════════════════════════════ */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-panel glass modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>수업 추가</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-stack">
                {/* Row 1: Name + Type */}
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>수업명 *</label>
                    <input
                      type="text"
                      placeholder="예: 초등리딩반, 중등문법반"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>종류</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 2: Time */}
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>수업 시간</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={e => setForm({ ...form, time: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>교재</label>
                    <input
                      type="text"
                      placeholder="교재명"
                      value={form.book}
                      onChange={e => setForm({ ...form, book: e.target.value })}
                    />
                  </div>
                </div>

                {/* Frequency selector */}
                <div className="form-group">
                  <label>수업 빈도</label>
                  <div className="freq-selector">
                    {FREQ_OPTIONS.map(opt => (
                      <button
                        key={opt.days}
                        className={`freq-btn ${form.freq === opt.days ? 'active' : ''}`}
                        onClick={() => setForm({ ...form, freq: opt.days, selectedDays: [] })}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Day selector (에브리타임 style) */}
                <div className="form-group">
                  <label>
                    요일 선택 <span className="form-hint">({form.selectedDays.length}/{form.freq}개 선택)</span>
                  </label>
                  <div className="day-picker">
                    {WEEK_DAYS.map(day => {
                      const isSelected = form.selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          className={`day-pick-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleToggleDay(day)}
                        >
                          <span className="day-pick-label">{day}</span>
                          <span className="day-pick-sub">요일</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Student selector */}
                <div className="form-group">
                  <label>수강 학생 ({form.studentIds.length}명 선택)</label>
                  <div className="student-picker">
                    {state.students.map(s => {
                      const isOn = form.studentIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          className={`stu-pick-btn ${isOn ? 'selected' : ''}`}
                          onClick={() => handleToggleStudent(s.id)}
                        >
                          <span className="stu-pick-avatar" style={{ background: isOn ? avatarColor(s.name) : '#ccc' }}>
                            {s.name[0]}
                          </span>
                          <span className="stu-pick-name">{s.name}</span>
                          <span className="stu-pick-grade">{s.grade}</span>
                          {isOn && <span className="stu-pick-check">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preview */}
                {form.selectedDays.length > 0 && form.name && (
                  <div className="add-preview">
                    <div className="add-preview-title">미리보기</div>
                    <div className="add-preview-items">
                      {form.selectedDays.map(day => (
                        <div className="add-preview-item" key={day}>
                          <span className="add-pv-dot" style={{ background: TYPE_COLORS[form.type] || TYPE_COLORS.기타 }} />
                          <span className="add-pv-day">{day}</span>
                          <span className="add-pv-time">{form.time}</span>
                          <span className="add-pv-name">{form.name}</span>
                          <span className="add-pv-type">{form.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>취소</button>
              <button className="btn-primary" onClick={handleSubmitAdd}>
                ✅ {form.selectedDays.length}개 요일에 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          MANAGE MODAL (기존 목록 관리)
         ═══════════════════════════════════════ */}
      {showManageModal && (
        <div className="modal-backdrop" onClick={() => setShowManageModal(false)}>
          <div className="modal-panel glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>시간표 관리</h3>
              <button className="close-btn" onClick={() => setShowManageModal(false)}>×</button>
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
                  <span className="list-count">{(state.weeklyClasses[editingDay] || []).length}개</span>
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
