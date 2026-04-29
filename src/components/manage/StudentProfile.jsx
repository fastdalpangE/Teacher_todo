import { useState, useMemo } from 'react';
import { useAppStore, useToast } from '../../store/app-store';

const AVATAR_COLORS = ['#e8573f', '#2563eb', '#16a34a', '#d97706', '#8b5cf6', '#ec4899', '#0891b2', '#65a30d'];
function avatarColor(name) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function StudentProfile({ studentId }) {
  const { state, dispatch } = useAppStore();
  const showToast = useToast();
  const [tab, setTab] = useState('info'); // info | classes | report | comments
  const [commentInput, setCommentInput] = useState('');

  const student = state.students.find(s => s.id === studentId);
  if (!student) return null;

  const close = () => dispatch({ type: 'CLOSE_STUDENT_PROFILE' });

  // Editing basic info
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

  const startEdit = () => {
    setEditData({ ...student });
    setEditMode(true);
  };

  const saveEdit = () => {
    dispatch({ type: 'UPSERT_STUDENT', payload: editData });
    setEditMode(false);
    showToast?.('학생 정보가 저장되었습니다');
  };

  // Classes this student is in (weekly)
  const enrolledClasses = useMemo(() => {
    const result = [];
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    days.forEach(day => {
      (state.weeklyClasses[day] || []).forEach(cls => {
        if ((cls.studentIds || []).includes(studentId)) {
          result.push({ ...cls, _day: day });
        }
      });
    });
    return result;
  }, [state.weeklyClasses, studentId]);

  // History from scheduled classes
  const history = useMemo(() => {
    return state.scheduledClasses
      .filter(cls => (cls.studentIds || []).includes(studentId))
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(cls => ({
        ...cls,
        record: cls.studentRecords?.[studentId] || { attendance: '', vocabScore: '', comment: '', hwStatus: '', attitude: '' }
      }));
  }, [state.scheduledClasses, studentId]);

  // Vocab test history
  const vocabHistory = student.vocabTestHistory || [];

  // Comments (Global + Class-specific)
  const comments = useMemo(() => {
    const globalComments = (student.teacherComments || []).map((c, i) => ({
      ...c,
      isGlobal: true,
      originalIndex: i
    }));
    const classComments = history
      .filter(h => h.record.comment)
      .map(h => ({
        date: h.date,
        text: `[${h.name}] ${h.record.comment}`,
        isGlobal: false
      }));
    return [...globalComments, ...classComments].sort((a, b) => b.date.localeCompare(a.date));
  }, [student.teacherComments, history]);

  const handleAddComment = () => {
    const text = commentInput.trim();
    if (!text) return;
    dispatch({ type: 'ADD_TEACHER_COMMENT', payload: { studentId, text } });
    setCommentInput('');
    showToast?.('코멘트가 추가되었습니다');
  };

  return (
    <div className="sp-backdrop" onClick={close}>
      <div className="sp-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sp-header">
          <div className="sp-header-info">
            <div className="sp-avatar" style={{ background: avatarColor(student.name) }}>
              {student.name[0]}
            </div>
            <div>
              <div className="sp-name">{student.name}</div>
              <div className="sp-meta">{student.grade} · {student.schoolName || '학교 미지정'}</div>
            </div>
          </div>
          <button className="close-btn" onClick={close}>×</button>
        </div>

        {/* Tabs */}
        <div className="sp-tabs">
          <button className={tab === 'info' ? 'active' : ''} onClick={() => setTab('info')}>기본정보</button>
          <button className={tab === 'classes' ? 'active' : ''} onClick={() => setTab('classes')}>수업</button>
          <button className={tab === 'report' ? 'active' : ''} onClick={() => setTab('report')}>보고서</button>
          <button className={tab === 'comments' ? 'active' : ''} onClick={() => setTab('comments')}>코멘트</button>
        </div>

        {/* Tab content */}
        <div className="sp-body">
          {/* ── INFO TAB ── */}
          {tab === 'info' && (
            <div className="sp-info-tab fade-in">
              {!editMode ? (
                <>
                  <div className="sp-info-grid">
                    <div className="sp-info-item">
                      <label>학년</label>
                      <span>{student.grade}</span>
                    </div>
                    <div className="sp-info-item">
                      <label>학교</label>
                      <span>{student.schoolName || '미지정'}</span>
                    </div>
                  </div>
                  <div className="sp-info-item" style={{ marginTop: 12 }}>
                    <label>진도 메모</label>
                    <div className="sp-memo-box">{student.progressMemo || '기록된 메모가 없습니다.'}</div>
                  </div>
                  <div className="sp-info-item" style={{ marginTop: 12 }}>
                    <label>수업 수</label>
                    <span>주 {enrolledClasses.length}회</span>
                  </div>
                  <button className="btn-secondary" style={{ marginTop: 16 }} onClick={startEdit}>✏️ 정보 수정</button>
                </>
              ) : (
                <div className="form-stack">
                  <div className="form-row">
                    <div className="form-group">
                      <label>이름</label>
                      <input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>학년</label>
                      <input type="text" value={editData.grade} onChange={e => setEditData({ ...editData, grade: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>학교</label>
                    <select value={editData.schoolId} onChange={e => {
                      const sch = state.schools.find(s => s.id === e.target.value);
                      setEditData({ ...editData, schoolId: e.target.value, schoolName: sch?.name || '' });
                    }}>
                      <option value="">선택 안함</option>
                      {state.schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>진도 메모</label>
                    <textarea rows={3} value={editData.progressMemo} onChange={e => setEditData({ ...editData, progressMemo: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-secondary" onClick={() => setEditMode(false)}>취소</button>
                    <button className="btn-primary" onClick={saveEdit}>저장</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CLASSES TAB ── */}
          {tab === 'classes' && (
            <div className="sp-classes-tab fade-in">
              <h5 className="sp-section-title">수강 중인 수업 ({enrolledClasses.length})</h5>
              {enrolledClasses.length === 0 ? (
                <div className="sp-empty">등록된 수업이 없습니다</div>
              ) : (
                <div className="sp-class-list">
                  {enrolledClasses.map(cls => (
                    <div className="sp-class-item" key={cls.id + cls._day}>
                      <span className="sp-cl-day">{cls._day}</span>
                      <span className="sp-cl-time">{cls.time}</span>
                      <span className="sp-cl-name">{cls.name}</span>
                      <span className="sp-cl-type">{cls.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── REPORT TAB ── */}
          {tab === 'report' && (
            <div className="sp-report-tab fade-in">
              {/* Vocab history */}
              {vocabHistory.length > 0 && (
                <>
                  <h5 className="sp-section-title">단어 시험 기록</h5>
                  <div className="sp-vocab-list">
                    {vocabHistory.map((v, i) => (
                      <div className="sp-vocab-item" key={i}>
                        <span className="sp-v-date">{v.date}</span>
                        <span className="sp-v-class">{v.className}</span>
                        <span className={`sp-v-wrong ${v.wrong === 0 ? 'perfect' : ''}`}>
                          {v.wrong === 0 ? '✨ 만점' : `${v.wrong}개 오답`}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h5 className="sp-section-title" style={{ marginTop: 16 }}>수업 기록 타임라인</h5>
              {history.length === 0 ? (
                <div className="sp-empty">기록된 수업이 없습니다</div>
              ) : (
                <div className="sp-timeline">
                  {history.map(item => (
                    <div className="sp-tl-item" key={item.id}>
                      <div className="sp-tl-date">{item.date}</div>
                      <div className="sp-tl-body">
                        <div className="sp-tl-head">
                          <span className="sp-tl-name">{item.name}</span>
                          <span className={`badge-attend ${item.record.attendance}`}>
                            {item.record.attendance === 'present' ? '출석' :
                             item.record.attendance === 'late' ? '지각' :
                             item.record.attendance === 'absent' ? '결석' : '—'}
                          </span>
                        </div>
                        <div className="sp-tl-details">
                          {item.record.hwStatus && <span>숙제: {item.record.hwStatus === 'done' ? '✅' : item.record.hwStatus === 'partial' ? '📝' : '❌'}</span>}
                          {item.record.attitude && <span>태도: {item.record.attitude}</span>}
                          {item.record.vocabScore && <span>단어: {item.record.vocabScore}개</span>}
                        </div>
                        {item.record.comment && <div className="sp-tl-comment">{item.record.comment}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── COMMENTS TAB ── */}
          {tab === 'comments' && (
            <div className="sp-comments-tab fade-in">
              <div className="sp-comment-add">
                <textarea
                  className="sp-comment-input"
                  placeholder="코멘트 입력..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  rows={2}
                />
                <button className="btn-primary" onClick={handleAddComment}>추가</button>
              </div>
              {comments.length === 0 ? (
                <div className="sp-empty">기록된 코멘트가 없습니다</div>
              ) : (
                <div className="sp-comment-list">
                  {comments.map((c, i) => (
                    <div className="sp-comment-item" key={i}>
                      <div className="sp-c-header">
                        <span className="sp-c-date">{c.date}</span>
                        {c.isGlobal ? (
                          <button className="sp-c-del" onClick={() => {
                            dispatch({ type: 'DELETE_TEACHER_COMMENT', payload: { studentId, index: c.originalIndex } });
                            showToast?.('코멘트가 삭제되었습니다');
                          }}>×</button>
                        ) : (
                          <span style={{ fontSize: 10, color: 'var(--blue)', fontWeight: 700 }}>수업 연동</span>
                        )}
                      </div>
                      <div className="sp-c-text">{c.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
