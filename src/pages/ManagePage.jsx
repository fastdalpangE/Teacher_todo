import { useAppStore } from '../store/app-store';
import TimetableGrid from '../components/manage/TimetableGrid';
import StudentList from '../components/manage/StudentList';
import SchoolList from '../components/manage/SchoolList';

export default function ManagePage() {
  const { state, dispatch } = useAppStore();

  return (
    <section className="fade-in">
      <div className="sub-tabs" style={{ marginBottom: 11 }}>
        <button
          className={state.manageTab === 'timetable' ? 'is-active' : ''}
          onClick={() => dispatch({ type: 'SET_MANAGE_TAB', payload: 'timetable' })}
        >
          🗓️ 시간표
        </button>
        <button
          className={state.manageTab === 'students' ? 'is-active' : ''}
          onClick={() => dispatch({ type: 'SET_MANAGE_TAB', payload: 'students' })}
        >
          👥 학생
        </button>
        <button
          className={state.manageTab === 'schools' ? 'is-active' : ''}
          onClick={() => dispatch({ type: 'SET_MANAGE_TAB', payload: 'schools' })}
        >
          🏫 학교
        </button>
      </div>

      <div className="view-container">
        {state.manageTab === 'timetable' && <TimetableGrid />}
        {state.manageTab === 'students' && <StudentList />}
        {state.manageTab === 'schools' && <SchoolList />}
      </div>
    </section>
  );
}
