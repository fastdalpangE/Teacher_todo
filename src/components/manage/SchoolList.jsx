import { useState } from 'react';
import { useAppStore } from '../../store/app-store';
import { createId } from '../../utils/ids';

export default function SchoolList() {
  const { state, dispatch } = useAppStore();
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editingSchool, setEditingSchool] = useState(null);

  const handleOpenAdd = () => {
    setEditingSchool({
      id: '',
      name: '',
      memo: '',
      examSchedules: []
    });
    setModalMode('add');
  };

  const handleOpenEdit = (school) => {
    setEditingSchool({ ...school });
    setModalMode('edit');
  };

  const handleSave = () => {
    if (!editingSchool.name) return alert('학교명을 입력해주세요.');
    dispatch({ type: 'UPSERT_SCHOOL', payload: editingSchool });
    setModalMode(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('정말 삭제하시겠습니까? 관련 된 모든 시험 일정이 사라집니다.')) {
      dispatch({ type: 'DELETE_SCHOOL', payload: id });
    }
  };

  const handleAddExam = () => {
    const newExam = {
      id: createId('exam'),
      grade: '',
      examType: '중간',
      examDate: '',
      examRange: '',
      memo: ''
    };
    setEditingSchool({
      ...editingSchool,
      examSchedules: [...editingSchool.examSchedules, newExam]
    });
  };

  const handleUpdateExam = (examId, field, value) => {
    setEditingSchool({
      ...editingSchool,
      examSchedules: editingSchool.examSchedules.map(ex => 
        ex.id === examId ? { ...ex, [field]: value } : ex
      )
    });
  };

  const handleDeleteExam = (examId) => {
    setEditingSchool({
      ...editingSchool,
      examSchedules: editingSchool.examSchedules.filter(ex => ex.id !== examId)
    });
  };

  return (
    <div className="school-page-container fade-in">
      <div className="school-list-grid">
        {state.schools.map((school) => (
          <article className="school-card card glass hover-lift" key={school.id}>
            <div className="school-header">
              <h3>{school.name}</h3>
              {school.memo && <p className="school-memo">{school.memo}</p>}
            </div>

            <div className="exam-section">
              <label>📅 시험 일정</label>
              <div className="exam-list">
                {school.examSchedules.length === 0 ? (
                  <div className="empty-inline">등록된 시험 일정이 없습니다.</div>
                ) : (
                  school.examSchedules.map((exam) => (
                    <div className="exam-item glass" key={exam.id}>
                      <div className="exam-info">
                        <span className="exam-title">{exam.grade} {exam.examType}고사</span>
                        <span className="exam-date">{exam.examDate}</span>
                      </div>
                      <p className="exam-range">{exam.examRange}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="profile-footer">
              <button className="btn-text" onClick={() => handleOpenEdit(school)}>수정</button>
              <button className="btn-text danger" onClick={() => handleDelete(school.id)}>삭제</button>
            </div>
          </article>
        ))}

        <button className="add-card glass dotted" onClick={handleOpenAdd}>
          <span>+ 신규 학교 등록</span>
        </button>
      </div>

      {modalMode && (
        <div className="modal-backdrop">
          <div className="modal-panel modal-panel--wide glass">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? '학교 등록' : '학교 및 시험 관리'}</h3>
              <button className="close-btn" onClick={() => setModalMode(null)}>×</button>
            </div>
            <div className="modal-body overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <div className="form-stack">
                <div className="form-group">
                  <label>학교명 *</label>
                  <input
                    type="text"
                    value={editingSchool.name}
                    onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })}
                  />
                </div>

                <div className="exam-management-section">
                  <div className="section-header-row">
                    <label>시험 일정 관리</label>
                    <button className="btn-small-primary" onClick={handleAddExam}>+ 시험 추가</button>
                  </div>

                  <div className="exam-edit-list">
                    {editingSchool.examSchedules.map((exam) => (
                      <div className="exam-edit-card glass" key={exam.id}>
                        <div className="exam-edit-row">
                          <input
                            type="text"
                            placeholder="학년 (예: 초5)"
                            value={exam.grade}
                            onChange={(e) => handleUpdateExam(exam.id, 'grade', e.target.value)}
                          />
                          <select
                            value={exam.examType}
                            onChange={(e) => handleUpdateExam(exam.id, 'examType', e.target.value)}
                          >
                            <option value="중간">중간</option>
                            <option value="기말">기말</option>
                            <option value="기타">기타</option>
                          </select>
                          <input
                            type="date"
                            value={exam.examDate}
                            onChange={(e) => handleUpdateExam(exam.id, 'examDate', e.target.value)}
                          />
                          <button className="btn-icon-danger" onClick={() => handleDeleteExam(exam.id)}>×</button>
                        </div>
                        <textarea
                          placeholder="시험 범위"
                          rows="2"
                          value={exam.examRange}
                          onChange={(e) => handleUpdateExam(exam.id, 'examRange', e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalMode(null)}>취소</button>
              <button className="btn-primary" onClick={handleSave}>저장하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
