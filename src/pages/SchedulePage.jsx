import { useState, useMemo, useEffect } from 'react';
import { useAppStore, useToast } from '../store/app-store';
import WeeklyView from '../components/schedule/WeeklyView';
import MonthlyView from '../components/schedule/MonthlyView';
import DailyView from '../components/schedule/DailyView';
import CsvPreviewModal from '../components/import/CsvPreviewModal';
import { createId } from '../utils/ids';
import { getDateKey, getDayLabel } from '../utils/date';

export default function SchedulePage() {
  const { state, dispatch } = useAppStore();
  const showToast = useToast();
  const [filter, setFilter] = useState({ schoolId: '', grade: '', type: '' });

  // Use global modal state
  const modalData = state.ui.classModalData;
  const isClassModalOpen = !!modalData;
  const [editingClass, setEditingClass] = useState(null);

  // Sync global modal data to local form state
  useEffect(() => {
    if (modalData && (!editingClass || modalData.id !== editingClass.id)) {
      setEditingClass({ ...modalData });
    }
  }, [modalData]);

  // When adding new, we also dispatch but with no id
  useEffect(() => {
    if (!modalData) {
      setEditingClass(null);
    }
  }, [modalData]);

  const uniqueGrades = useMemo(() => [...new Set(state.students.map(s => s.grade))].filter(Boolean), [state.students]);
  const uniqueTypes = useMemo(() => [...new Set(state.scheduledClasses.map(c => c.type))].filter(Boolean), [state.scheduledClasses]);

  const handleOpenAdd = () => {
    dispatch({
      type: 'OPEN_CLASS_MODAL',
      payload: {
        id: '',
        date: state.selectedDate || getDateKey(new Date()),
        time: '14:00',
        name: '',
        type: '리딩',
        schoolId: '',
        grade: '',
        book: '',
        hw: '',
        classMemo: '',
        studentIds: []
      }
    });
  };

  const handleCloseModal = () => {
    dispatch({ type: 'CLOSE_CLASS_MODAL' });
  };

  const handleSaveClass = () => {
    if (!editingClass.name || !editingClass.date) return alert('날짜와 수업명을 입력해주세요.');
    const school = state.schools.find(s => s.id === editingClass.schoolId);
    const toSave = {
      ...editingClass,
      dayOfWeek: getDayLabel(editingClass.date),
      schoolName: school ? school.name : ''
    };
    dispatch({ type: 'UPSERT_SCHEDULED_CLASS', payload: toSave });
    handleCloseModal();
    showToast?.(editingClass.id ? '수업이 수정되었습니다' : '수업이 추가되었습니다');
  };

  return (
    <section className="fade-in">
      <div className="sub-tabs" style={{ marginBottom: 8 }}>
        <button
          className={state.scheduleView === 'weekly' ? 'is-active' : ''}
          onClick={() => dispatch({ type: 'SET_SCHEDULE_VIEW', payload: 'weekly' })}
        >주간</button>
        <button
          className={state.scheduleView === 'monthly' ? 'is-active' : ''}
          onClick={() => dispatch({ type: 'SET_SCHEDULE_VIEW', payload: 'monthly' })}
        >월간</button>
        <button
          className={state.scheduleView === 'daily' ? 'is-active' : ''}
          onClick={() => dispatch({ type: 'SET_SCHEDULE_VIEW', payload: 'daily' })}
        >일간</button>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <label>학교</label>
          <select value={filter.schoolId} onChange={(e) => setFilter({ ...filter, schoolId: e.target.value })}>
            <option value="">전체</option>
            {state.schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>학년</label>
          <select value={filter.grade} onChange={(e) => setFilter({ ...filter, grade: e.target.value })}>
            <option value="">전체</option>
            {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>과목</label>
          <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
            <option value="">전체</option>
            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button className="btn-small-primary" onClick={handleOpenAdd}>+ 수업</button>
      </div>

      <div className="view-container">
        {state.scheduleView === 'weekly' && <WeeklyView filter={filter} />}
        {state.scheduleView === 'monthly' && <MonthlyView filter={filter} />}
        {state.scheduleView === 'daily' && <DailyView filter={filter} />}
      </div>

      <CsvPreviewModal />

      {isClassModalOpen && editingClass && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <div className="modal-header">
              <h3>{editingClass.id ? '수업 일정 수정' : '수업 일정 등록'}</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-stack">
                <div className="form-row">
                  <div className="form-group">
                    <label>날짜 *</label>
                    <input type="date" value={editingClass.date} onChange={(e) => setEditingClass({...editingClass, date: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>시간 *</label>
                    <input type="time" value={editingClass.time} onChange={(e) => setEditingClass({...editingClass, time: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>수업 이름 *</label>
                  <input type="text" placeholder="예: 초등 리딩반" value={editingClass.name} onChange={(e) => setEditingClass({...editingClass, name: e.target.value})} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>종류</label>
                    <select value={editingClass.type} onChange={(e) => setEditingClass({...editingClass, type: e.target.value})}>
                      <option>리딩</option>
                      <option>문법</option>
                      <option>듣기</option>
                      <option>파닉스</option>
                      <option>쓰기</option>
                      <option>기타</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>학교</label>
                    <select value={editingClass.schoolId || ''} onChange={(e) => setEditingClass({...editingClass, schoolId: e.target.value})}>
                      <option value="">선택 안함</option>
                      {state.schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>교재명</label>
                    <input type="text" placeholder="예: Read it 40-2" value={editingClass.book || ''} onChange={(e) => setEditingClass({...editingClass, book: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>기본 숙제</label>
                    <input type="text" placeholder="예: p.10~12" value={editingClass.hw || ''} onChange={(e) => setEditingClass({...editingClass, hw: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>참여 학생</label>
                  <div className="student-select-grid">
                    {state.students.map(s => (
                      <label key={s.id} className="checkbox-item">
                        <input 
                          type="checkbox" 
                          checked={editingClass.studentIds.includes(s.id)}
                          onChange={(e) => {
                            const ids = e.target.checked 
                              ? [...editingClass.studentIds, s.id]
                              : editingClass.studentIds.filter(id => id !== s.id);
                            setEditingClass({...editingClass, studentIds: ids});
                          }}
                        />
                        <span>{s.name} ({s.grade})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseModal}>취소</button>
              <button className="btn-primary" onClick={handleSaveClass}>
                {editingClass.id ? '✅ 수정 완료' : '✅ 수업 추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
