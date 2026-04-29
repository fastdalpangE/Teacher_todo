import { useAppStore } from './store/app-store';
import AppShell from './components/layout/AppShell';
import SchedulePage from './pages/SchedulePage';
import TodoPage from './pages/TodoPage';
import ManagePage from './pages/ManagePage';
import StudentProfile from './components/manage/StudentProfile';

export default function App() {
  const { state } = useAppStore();

  return (
    <AppShell>
      {state.mainTab === 'schedule' && <SchedulePage />}
      {state.mainTab === 'todo' && <TodoPage />}
      {state.mainTab === 'manage' && <ManagePage />}

      {/* Global student profile overlay */}
      {state.ui.studentProfileId && (
        <StudentProfile studentId={state.ui.studentProfileId} />
      )}
    </AppShell>
  );
}
