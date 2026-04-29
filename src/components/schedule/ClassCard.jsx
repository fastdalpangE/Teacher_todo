import { useState } from 'react';
import { useAppStore, useToast } from '../../store/app-store';

const HW_OPTIONS = [
  { val: '', label: '—' },
  { val: 'done', label: '✅ 완료' },
  { val: 'partial', label: '📝 미완' },
  { val: 'none', label: '❌ 미제출' }
];

const ATT_OPTIONS = [
  { val: '', label: '—' },
  { val: 'great', label: '😊 매우좋음' },
  { val: 'good', label: '🙂 좋음' },
  { val: 'normal', label: '😐 보통' },
  { val: 'restless', label: '😕 산만' },
  { val: 'bad', label: '😞 불량' }
];

export default function ClassCard({ classItem }) {
  const { state, dispatch } = useAppStore();
  const showToast = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const students = (classItem.studentIds || [])
    .map((studentId) => state.students.find((student) => student.id === studentId))
    .filter(Boolean);

  const handleUpdateRecord = (studentId, field, value) => {
    dispatch({
      type: 'UPDATE_STUDENT_RECORD',
      payload: { 
        classId: classItem.id, 
        studentId, 
        field, 
        value,
        renderDate: classItem.renderDate,
        renderDay: classItem.renderDay
      }
    });
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    const payload = { ...classItem };
    if (payload.renderDate && !payload.date) {
      payload.date = payload.renderDate;
      payload.id = '';
    }
    dispatch({ type: 'OPEN_CLASS_MODAL', payload });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm('이 수업을 삭제하시겠습니까?')) {
      if (classItem.renderDay && !classItem.date) {
        dispatch({ type: 'DELETE_WEEKLY_CLASS', payload: { day: classItem.renderDay, id: classItem.id } });
      } else {
        dispatch({ type: 'DELETE_SCHEDULED_CLASS', payload: classItem.id });
      }
      showToast?.('수업이 삭제되었습니다');
    }
  };

  const handleOpenProfile = (e, studentId) => {
    e.stopPropagation();
    dispatch({ type: 'OPEN_STUDENT_PROFILE', payload: studentId });
  };

  return (
    <article className={`class-card glass hover-lift ${isExpanded ? 'is-expanded' : ''}`}>
      <div className="class-card__top">
        <div className="class-card__side">
          <span className="class-time">{classItem.time}</span>
          <span className="class-type badge">{classItem.type}</span>
        </div>

        <div className="class-card__main">
          <div className="class-info">
            <h4 className="class-name">{classItem.name}</h4>
            <span className="class-school">{classItem.schoolName || '학교 미지정'} {classItem.grade}</span>
          </div>

          <div className="class-details">
            <div className="detail-item">
              <span className="label">📖 교재</span>
              <span className="value">{classItem.book || '—'}</span>
            </div>
            <div className="detail-item">
              <span className="label">📝 숙제</span>
              <span className="value">{classItem.hw || '—'}</span>
            </div>
          </div>

          <div className="student-tags">
            {students.map((student) => (
              <span
                className="student-tag clickable"
                key={student.id}
                onClick={(e) => handleOpenProfile(e, student.id)}
              >
                {student.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="class-card__footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn-text" onClick={handleEdit}>✏️ 수정</button>
          <button className="btn-text danger" onClick={handleDelete}>🗑️ 삭제</button>
        </div>
        <button className="btn-manage-session" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? '접기 ▲' : '기록 관리 ▼'}
        </button>
      </div>

      {isExpanded && (
        <div className="session-management fade-in">
          <h5 className="session-title">학생별 수업 관리</h5>
          <div className="student-records-stack">
            {students.map((student) => {
              const record = classItem.studentRecords?.[student.id] || {
                attendance: '', vocabScore: '', comment: '', hwStatus: '', attitude: ''
              };

              return (
                <div className="student-record-row glass" key={student.id}>
                  <div className="student-name-col">
                    <strong>{student.name}</strong>
                    <span>{student.grade}</span>
                    <button
                      className="btn-text"
                      style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 6px' }}
                      onClick={() => dispatch({ type: 'OPEN_STUDENT_PROFILE', payload: student.id })}
                    >
                      👤 프로필
                    </button>
                  </div>

                  <div className="record-controls">
                    {/* Attendance */}
                    <div className="attendance-group">
                      <button
                        className={`btn-attend ${record.attendance === 'present' ? 'active' : ''}`}
                        onClick={() => handleUpdateRecord(student.id, 'attendance', 'present')}
                      >출석</button>
                      <button
                        className={`btn-attend ${record.attendance === 'late' ? 'active' : ''}`}
                        onClick={() => handleUpdateRecord(student.id, 'attendance', 'late')}
                      >지각</button>
                      <button
                        className={`btn-attend ${record.attendance === 'absent' ? 'active' : ''}`}
                        onClick={() => handleUpdateRecord(student.id, 'attendance', 'absent')}
                      >결석</button>
                    </div>

                    {/* Homework Status */}
                    <div className="hw-select">
                      <label>숙제</label>
                      <select
                        value={record.hwStatus || ''}
                        onChange={(e) => handleUpdateRecord(student.id, 'hwStatus', e.target.value)}
                      >
                        {HW_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                      </select>
                    </div>

                    {/* Attitude */}
                    <div className="att-select">
                      <label>태도</label>
                      <select
                        value={record.attitude || ''}
                        onChange={(e) => handleUpdateRecord(student.id, 'attitude', e.target.value)}
                      >
                        {ATT_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                      </select>
                    </div>

                    {/* Vocab */}
                    <div className="vocab-input">
                      <label>단어 오답</label>
                      <input
                        type="text"
                        placeholder="개수"
                        value={record.vocabScore || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                          handleUpdateRecord(student.id, 'vocabScore', val);
                        }}
                      />
                    </div>

                    {/* Comment */}
                    <div className="comment-input">
                      <label>강사 코멘트</label>
                      <textarea
                        placeholder="전달사항 혹은 특이사항"
                        value={record.comment}
                        onChange={(e) => handleUpdateRecord(student.id, 'comment', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}
