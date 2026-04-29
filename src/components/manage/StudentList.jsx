import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/app-store';
import { createId } from '../../utils/ids';

export default function StudentList() {
  const { state, dispatch } = useAppStore();
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | 'history' | null
  const [editingStudent, setEditingStudent] = useState(null);

  const handleOpenAdd = () => {
    setEditingStudent({
      id: '',
      name: '',
      schoolId: '',
      schoolName: '',
      grade: '',
      enrolledClassIds: [],
      teacherComments: [],
      vocabTestHistory: [],
      attendanceHistory: [],
      progressMemo: ''
    });
    setModalMode('add');
  };

  const handleOpenEdit = (student) => {
    setEditingStudent({ ...student });
    setModalMode('edit');
  };

  const handleOpenHistory = (student) => {
    setEditingStudent(student);
    setModalMode('history');
  };

  const handleSave = () => {
    if (!editingStudent.name) return alert('이름을 입력해주세요.');
    const school = state.schools.find(s => s.id === editingStudent.schoolId);
    const studentToSave = {
      ...editingStudent,
      schoolName: school ? school.name : editingStudent.schoolName
    };
    dispatch({ type: 'UPSERT_STUDENT', payload: studentToSave });
    setModalMode(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      dispatch({ type: 'DELETE_STUDENT', payload: id });
    }
  };

  const studentHistory = useMemo(() => {
    if (!editingStudent || modalMode !== 'history') return [];
    return state.scheduledClasses
      .filter(cls => cls.studentIds.includes(editingStudent.id))
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(cls => ({
        ...cls,
        record: cls.studentRecords?.[editingStudent.id] || { attendance: '', vocabScore: '', comment: '' }
      }));
  }, [editingStudent, modalMode, state.scheduledClasses]);

  return (
    <div className="student-page-container fade-in">
      <div className="student-list-grid">
        {state.students.map((student) => (
          <article className="student-profile-card card glass hover-lift" key={student.id}>
            <div className="profile-header">
              <div className="avatar">{student.name[0]}</div>
              <div className="info">
                <h3>{student.name}</h3>
                <p>{student.schoolName} · {student.grade}</p>
              </div>
            </div>

            <div className="profile-body">
              <div className="memo-section">
                <label>진도 메모</label>
                <p>{student.progressMemo || '기록된 메모가 없습니다.'}</p>
              </div>
            </div>
            
            <div className="profile-footer">
              <button className="btn-text" onClick={() => handleOpenHistory(student)}>히스토리</button>
              <button className="btn-text" onClick={() => handleOpenEdit(student)}>수정</button>
              <button className="btn-text danger" onClick={() => handleDelete(student.id)}>삭제</button>
            </div>
          </article>
        ))}
        
        <button className="add-card glass dotted" onClick={handleOpenAdd}>
          <span>+ 신규 학생 등록</span>
        </button>
      </div>

      {modalMode && (
        <div className="modal-backdrop">
          <div className="modal-panel modal-panel--wide glass">
            <div className="modal-header">
              <div className="modal-title-tabs">
                <button 
                  className={modalMode !== 'history' ? 'active' : ''} 
                  onClick={() => setModalMode('edit')}
                >
                  기본 정보
                </button>
                <button 
                  className={modalMode === 'history' ? 'active' : ''} 
                  onClick={() => setModalMode('history')}
                >
                  기록 히스토리
                </button>
              </div>
              <button className="close-btn" onClick={() => setModalMode(null)}>×</button>
            </div>

            <div className="modal-body overflow-y-auto" style={{ maxHeight: '70vh' }}>
              {modalMode === 'history' ? (
                <div className="history-list">
                  {studentHistory.length === 0 ? (
                    <div className="empty-placeholder">기록된 수업이 없습니다.</div>
                  ) : (
                    studentHistory.map(item => (
                      <div className="history-item glass" key={item.id}>
                        <div className="history-header">
                          <span className="h-date">{item.date}</span>
                          <span className="h-name">{item.name}</span>
                          <span className={`badge-attend ${item.record.attendance}`}>
                            {item.record.attendance === 'present' ? '출석' : 
                             item.record.attendance === 'late' ? '지각' : 
                             item.record.attendance === 'absent' ? '결석' : '미표기'}
                          </span>
                        </div>
                        <div className="history-details">
                          <div className="h-vocab">단어: <strong>{item.record.vocabScore || '—'}</strong></div>
                          <div className="h-comment">{item.record.comment || '기록된 코멘트가 없습니다.'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="form-stack">
                  <div className="form-group">
                    <label>이름 *</label>
                    <input
                      type="text"
                      value={editingStudent.name}
                      onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>학교</label>
                    <select
                      value={editingStudent.schoolId}
                      onChange={(e) => setEditingStudent({ ...editingStudent, schoolId: e.target.value })}
                    >
                      <option value="">학교 선택 안함</option>
                      {state.schools.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>학년</label>
                    <input
                      type="text"
                      placeholder="예: 초4, 중1"
                      value={editingStudent.grade}
                      onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>진도 메모</label>
                    <textarea
                      rows="3"
                      value={editingStudent.progressMemo}
                      onChange={(e) => setEditingStudent({ ...editingStudent, progressMemo: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalMode(null)}>취소</button>
              {modalMode !== 'history' && (
                <button className="btn-primary" onClick={handleSave}>저장하기</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
