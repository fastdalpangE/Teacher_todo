import { useState } from 'react';
import { useAppStore, useToast } from '../../store/app-store';
import CsvImportButton from '../import/CsvImportButton';
import { getDateKey, getDayLabel } from '../../utils/date';
import { createId } from '../../utils/ids';

export default function TopNav() {
  const { state, dispatch } = useAppStore();
  const showToast = useToast();
  const [showQuick, setShowQuick] = useState(false);

  const quickAddClass = () => {
    dispatch({
      type: 'OPEN_CLASS_MODAL',
      payload: {
        id: '', date: state.selectedDate || getDateKey(new Date()),
        time: '14:00', name: '', type: '리딩',
        schoolId: '', grade: '', book: '', hw: '', classMemo: '', studentIds: []
      }
    });
    setShowQuick(false);
  };

  const quickAddStudent = () => {
    const name = prompt('학생 이름을 입력하세요:');
    if (!name) return;
    const grade = prompt('학년을 입력하세요 (예: 초3, 중1):', '초3');
    dispatch({
      type: 'UPSERT_STUDENT',
      payload: {
        id: createId('student'), name, grade: grade || '',
        schoolId: '', schoolName: '', enrolledClassIds: [],
        teacherComments: [], vocabTestHistory: [], attendanceHistory: [],
        progressMemo: ''
      }
    });
    showToast?.(`${name} 학생이 추가되었습니다`);
    setShowQuick(false);
  };

  const quickAddExam = () => {
    const title = prompt('D-Day 제목을 입력하세요:');
    if (!title) return;
    const date = prompt('날짜를 입력하세요 (YYYY-MM-DD):', new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
    if (!date) return;
    dispatch({ type: 'ADD_EXAM', payload: { title, date, type: '시험', memo: '' } });
    showToast?.('D-Day가 추가되었습니다');
    setShowQuick(false);
  };

  return (
    <header className="top-nav">
      <div className="top-nav__container">
        <div className="top-nav__brand">
          <span className="brand-icon">📚</span>
          <h1 className="brand-name">선생님 <em>데일리</em></h1>
        </div>

        <div className="top-nav__actions">
          <div className="quick-add-wrap">
            <button className="quick-add-trigger" onClick={() => setShowQuick(!showQuick)} title="빠른 추가">＋</button>
            {showQuick && (
              <>
                <div className="quick-add-overlay" onClick={() => setShowQuick(false)} />
                <div className="quick-add-menu">
                  <button onClick={quickAddClass}>📅 수업 추가</button>
                  <button onClick={quickAddStudent}>👤 학생 추가</button>
                  <button onClick={quickAddExam}>⏱️ D-Day 추가</button>
                </div>
              </>
            )}
          </div>
          <CsvImportButton />
        </div>
      </div>

      <nav className="main-tabs">
        <button
          className={state.mainTab === 'schedule' ? 'is-active' : ''}
          onClick={() => dispatch({ type: 'SET_MAIN_TAB', payload: 'schedule' })}
        >
          📅 수업일지
        </button>
        <button
          className={state.mainTab === 'todo' ? 'is-active' : ''}
          onClick={() => dispatch({ type: 'SET_MAIN_TAB', payload: 'todo' })}
        >
          📌 할일·전달
        </button>
        <button
          className={state.mainTab === 'manage' ? 'is-active' : ''}
          onClick={() => dispatch({ type: 'SET_MAIN_TAB', payload: 'manage' })}
        >
          🗓️ 학생·학교
        </button>
      </nav>
    </header>
  );
}
