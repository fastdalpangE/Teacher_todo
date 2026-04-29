import { createContext, useContext, useEffect, useMemo, useReducer, useCallback, useState } from 'react';
import { initialState } from '../data/seed';
import { createId } from '../utils/ids';

const STORAGE_KEY = 'teacher-daily-react-v2';
const AppStoreContext = createContext(null);
const ToastContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MAIN_TAB':
      return { ...state, mainTab: action.payload };

    case 'SET_SCHEDULE_VIEW':
      return { ...state, scheduleView: action.payload };

    case 'SET_MANAGE_TAB':
      return { ...state, manageTab: action.payload };

    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };

    /* --- Week / Month Nav --- */
    case 'MOVE_WEEK': {
      const d = new Date(state.selectedDate);
      d.setDate(d.getDate() + action.payload * 7);
      return { ...state, selectedDate: d.toISOString().slice(0, 10) };
    }

    case 'MOVE_MONTH': {
      const d = new Date(state.selectedDate);
      d.setMonth(d.getMonth() + action.payload);
      return { ...state, selectedDate: d.toISOString().slice(0, 10) };
    }

    case 'GO_TODAY':
      return { ...state, selectedDate: new Date().toISOString().slice(0, 10) };

    /* --- Student Profile Overlay --- */
    case 'OPEN_STUDENT_PROFILE':
      return { ...state, ui: { ...state.ui, studentProfileId: action.payload } };

    case 'CLOSE_STUDENT_PROFILE':
      return { ...state, ui: { ...state.ui, studentProfileId: null } };

    /* --- CSV --- */
    case 'OPEN_CSV_PREVIEW':
      return {
        ...state,
        csvPreviewRows: action.payload.rows,
        csvPreviewErrors: action.payload.errors,
        ui: { ...state.ui, showCsvPreview: true }
      };

    case 'CLOSE_CSV_PREVIEW':
      return {
        ...state,
        csvPreviewRows: [],
        csvPreviewErrors: [],
        ui: { ...state.ui, showCsvPreview: false }
      };

    case 'OPEN_CLASS_MODAL':
      return { ...state, ui: { ...state.ui, classModalData: action.payload } };

    case 'CLOSE_CLASS_MODAL':
      return { ...state, ui: { ...state.ui, classModalData: null } };

    case 'IMPORT_CSV_ROWS': {
      const nextSchools = [...state.schools];
      const nextStudents = [...state.students];
      const nextScheduledClasses = [...state.scheduledClasses];

      action.payload.forEach((row) => {
        let school = nextSchools.find((item) => item.name === row.schoolName);
        if (!school && row.schoolName) {
          school = { id: createId('school'), name: row.schoolName, memo: '', examSchedules: [] };
          nextSchools.push(school);
        }

        const studentIds = row.studentNames.map((studentName) => {
          let student = nextStudents.find((item) => item.name === studentName);
          if (!student) {
            student = {
              id: createId('student'), name: studentName,
              schoolId: school?.id || '', schoolName: school?.name || row.schoolName || '',
              grade: row.grade || '', enrolledClassIds: [],
              teacherComments: [], vocabTestHistory: [], attendanceHistory: [],
              progressMemo: ''
            };
            nextStudents.push(student);
          }
          return student.id;
        });

        const duplicate = nextScheduledClasses.find(
          (item) => item.date === row.date && item.time === row.startTime && item.name === row.className
        );
        if (duplicate) return;

        const newId = createId('scheduled-class');
        nextScheduledClasses.push({
          id: newId, date: row.date, dayOfWeek: row.dayOfWeek, time: row.startTime,
          name: row.className, type: row.subjectType,
          schoolId: school?.id || '', schoolName: school?.name || row.schoolName || '',
          grade: row.grade || '', book: row.bookName || '', hw: row.homeworkAmount || '',
          classMemo: row.classMemo || '', studentIds, studentRecords: {}
        });

        studentIds.forEach((studentId) => {
          const t = nextStudents.find((item) => item.id === studentId);
          if (t && !t.enrolledClassIds.includes(newId)) t.enrolledClassIds.push(newId);
        });
      });

      return {
        ...state, schools: nextSchools, students: nextStudents,
        scheduledClasses: nextScheduledClasses,
        csvPreviewRows: [], csvPreviewErrors: [],
        ui: { ...state.ui, showCsvPreview: false }
      };
    }

    /* --- Record Management --- */

    /* --- Add Teacher Comment --- */
    case 'ADD_TEACHER_COMMENT': {
      const { studentId, text } = action.payload;
      return {
        ...state,
        students: state.students.map(s => {
          if (s.id !== studentId) return s;
          return {
            ...s,
            teacherComments: [
              { date: new Date().toISOString().slice(0, 10), text },
              ...(s.teacherComments || [])
            ]
          };
        })
      };
    }

    case 'DELETE_TEACHER_COMMENT': {
      const { studentId, index } = action.payload;
      return {
        ...state,
        students: state.students.map(s => {
          if (s.id !== studentId) return s;
          const comments = [...(s.teacherComments || [])];
          comments.splice(index, 1);
          return { ...s, teacherComments: comments };
        })
      };
    }

    /* --- Student CRUD --- */
    case 'UPSERT_STUDENT': {
      const student = action.payload;
      const exists = state.students.some((s) => s.id === student.id);
      return {
        ...state,
        students: exists
          ? state.students.map((s) => (s.id === student.id ? student : s))
          : [...state.students, { ...student, id: student.id || createId('student') }]
      };
    }

    case 'DELETE_STUDENT':
      return {
        ...state,
        students: state.students.filter((s) => s.id !== action.payload),
        scheduledClasses: state.scheduledClasses.map((cls) => ({
          ...cls, studentIds: cls.studentIds.filter((id) => id !== action.payload)
        }))
      };

    /* --- School CRUD --- */
    case 'UPSERT_SCHOOL': {
      const school = action.payload;
      const exists = state.schools.some((s) => s.id === school.id);
      return {
        ...state,
        schools: exists
          ? state.schools.map((s) => (s.id === school.id ? school : s))
          : [...state.schools, { ...school, id: school.id || createId('school') }]
      };
    }

    case 'DELETE_SCHOOL':
      return { ...state, schools: state.schools.filter((s) => s.id !== action.payload) };

    /* --- Class CRUD --- */
    case 'UPSERT_SCHEDULED_CLASS': {
      const cls = action.payload;
      const exists = state.scheduledClasses.some((c) => c.id === cls.id);
      return {
        ...state,
        scheduledClasses: exists
          ? state.scheduledClasses.map((c) => (c.id === cls.id ? cls : c))
          : [...state.scheduledClasses, { ...cls, id: cls.id || createId('sc'), studentRecords: {} }]
      };
    }

    case 'DELETE_SCHEDULED_CLASS':
      return { ...state, scheduledClasses: state.scheduledClasses.filter((c) => c.id !== action.payload) };

    /* --- Weekly Class Template CRUD --- */
    case 'UPSERT_WEEKLY_CLASS': {
      const { day, cls } = action.payload;
      const dayClasses = state.weeklyClasses[day] || [];
      const exists = dayClasses.some(c => c.id === cls.id);
      return {
        ...state,
        weeklyClasses: {
          ...state.weeklyClasses,
          [day]: exists ? dayClasses.map(c => c.id === cls.id ? cls : c) : [...dayClasses, cls]
        }
      };
    }

    case 'DELETE_WEEKLY_CLASS': {
      const { day, id } = action.payload;
      return {
        ...state,
        weeklyClasses: {
          ...state.weeklyClasses,
          [day]: (state.weeklyClasses[day] || []).filter(c => c.id !== id)
        }
      };
    }

    case 'UPDATE_STUDENT_RECORD': {
      const { classId, studentId, field, value, renderDate, renderDay } = action.payload;

      let scheduledClasses = [...state.scheduledClasses];
      let targetClass = scheduledClasses.find(c => c.id === classId);

      // If editing a weekly class instance, instantiate all classes for that date first
      if (!targetClass && renderDate && renderDay) {
        const weeklyForDay = state.weeklyClasses[renderDay] || [];
        const existingForDate = scheduledClasses.filter(c => c.date === renderDate);
        
        if (existingForDate.length === 0) {
          const instanced = weeklyForDay.map(wc => ({
            ...wc,
            id: createId('sc'),
            originalWeeklyId: wc.id,
            date: renderDate,
            studentRecords: {}
          }));
          scheduledClasses.push(...instanced);
          targetClass = instanced.find(c => c.originalWeeklyId === classId);
        }
      }

      if (!targetClass) return state;

      return {
        ...state,
        scheduledClasses: scheduledClasses.map(c => {
          if (c.id !== targetClass.id) return c;
          const records = { ...c.studentRecords };
          const rec = { ...(records[studentId] || { attendance: '', vocabScore: '', comment: '', hwStatus: '', attitude: '' }) };
          rec[field] = value;
          records[studentId] = rec;
          return { ...c, studentRecords: records };
        })
      };
    }
    case 'ADD_TODO':
      return { ...state, todos: [...state.todos, { id: createId('todo'), text: action.payload, done: false }] };
    case 'TOGGLE_TODO':
      return { ...state, todos: state.todos.map(t => t.id === action.payload ? { ...t, done: !t.done } : t) };
    case 'DELETE_TODO':
      return { ...state, todos: state.todos.filter(t => t.id !== action.payload) };

    /* --- Transfer CRUD --- */
    case 'ADD_TRANSFER':
      return { ...state, transfers: [...(state.transfers || []), { id: createId('tr'), text: action.payload, done: false }] };
    case 'TOGGLE_TRANSFER':
      return { ...state, transfers: (state.transfers || []).map(t => t.id === action.payload ? { ...t, done: !t.done } : t) };
    case 'DELETE_TRANSFER':
      return { ...state, transfers: (state.transfers || []).filter(t => t.id !== action.payload) };

    /* --- Exam / D-Day --- */
    case 'ADD_EXAM':
      return { ...state, exams: [...(state.exams || []), { ...action.payload, id: createId('exam') }] };
    case 'DELETE_EXAM':
      return { ...state, exams: (state.exams || []).filter(e => e.id !== action.payload) };

    /* --- Todo Sections (memo) --- */
    case 'ADD_TODO_SECTION':
      return { ...state, todoSections: [...(state.todoSections || []), action.payload] };
    case 'DELETE_TODO_SECTION':
      return { ...state, todoSections: (state.todoSections || []).filter(s => s.id !== action.payload) };
    case 'UPDATE_TODO_SECTION':
      return {
        ...state,
        todoSections: (state.todoSections || []).map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        )
      };

    default:
      return state;
  }
}

function initializer() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return initialState;
  try {
    const parsed = JSON.parse(saved);
    return { ...initialState, ...parsed, ui: { ...initialState.ui, ...(parsed.ui || {}) } };
  } catch {
    return initialState;
  }
}

// ═══ Toast Hook ═══
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ msg: '', visible: false });

  const showToast = useCallback((msg) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast({ msg: '', visible: false }), 1800);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={`toast ${toast.visible ? 'on' : ''}`}>{toast.msg}</div>
    </ToastContext.Provider>
  );
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, initializer);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
}
