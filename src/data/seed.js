export const initialSchools = [
  {
    id: 'sch1',
    name: '서동초등학교',
    memo: '',
    examSchedules: [
      {
        id: 'es1',
        grade: '초5',
        examType: '중간',
        examDate: '2026-04-20',
        examRange: 'Unit 1~3, 단어 100개',
        memo: ''
      },
      {
        id: 'es2',
        grade: '초6',
        examType: '중간',
        examDate: '2026-04-22',
        examRange: 'Unit 1~4, 문법 1~2',
        memo: '발음 강조'
      }
    ]
  },
  {
    id: 'sch2',
    name: '대구중학교',
    memo: '',
    examSchedules: [
      {
        id: 'es3',
        grade: '중1',
        examType: '중간',
        examDate: '2026-04-18',
        examRange: '교과서 1~4과, 단어 200개',
        memo: ''
      },
      {
        id: 'es4',
        grade: '중2',
        examType: '중간',
        examDate: '2026-04-19',
        examRange: '교과서 1~3과',
        memo: ''
      }
    ]
  },
  {
    id: 'sch3',
    name: '성광고등학교',
    memo: '',
    examSchedules: [
      {
        id: 'es5',
        grade: '고1',
        examType: '중간',
        examDate: '2026-04-25',
        examRange: '수능특강 1~5강',
        memo: ''
      }
    ]
  }
];

export const initialStudents = [
  {
    id: 's1', name: '유안', schoolId: 'sch1', schoolName: '서동초등학교',
    grade: '초3', enrolledClassIds: ['m1', 't1'],
    teacherComments: [], vocabTestHistory: [], attendanceHistory: [],
    progressMemo: '파닉스 기초 잘 따라옴'
  },
  {
    id: 's2', name: '하은', schoolId: 'sch1', schoolName: '서동초등학교',
    grade: '초3', enrolledClassIds: ['m1', 't1'],
    teacherComments: [], vocabTestHistory: [], attendanceHistory: [],
    progressMemo: ''
  },
  {
    id: 's3', name: '다은', schoolId: 'sch1', schoolName: '서동초등학교',
    grade: '초4', enrolledClassIds: ['m1', 't1'],
    teacherComments: [{ date: '2026-03-01', text: '발음 교정 필요. 파닉스 B단계 복습 권장.' }],
    vocabTestHistory: [], attendanceHistory: [],
    progressMemo: ''
  },
  {
    id: 's4', name: '이혜인', schoolId: 'sch1', schoolName: '서동초등학교',
    grade: '초6', enrolledClassIds: ['m2', 't3', 'h2', 'f1'],
    teacherComments: [{ date: '2026-03-15', text: '문법 이해도 높음. 리딩 속도 개선 필요.' }],
    vocabTestHistory: [
      { date: '2026-04-01', classId: 'm2', className: '초등문법반', wrong: 2 },
      { date: '2026-04-08', classId: 'm2', className: '초등문법반', wrong: 0 }
    ],
    attendanceHistory: [],
    progressMemo: '영어 자신감 높음'
  },
  {
    id: 's5', name: '박준우', schoolId: 'sch1', schoolName: '서동초등학교',
    grade: '초6', enrolledClassIds: ['m2', 't3', 'h2', 'f1'],
    teacherComments: [],
    vocabTestHistory: [{ date: '2026-04-01', classId: 'm2', className: '초등문법반', wrong: 5 }],
    attendanceHistory: [],
    progressMemo: ''
  },
  {
    id: 's6', name: '정윤진', schoolId: 'sch1', schoolName: '서동초등학교',
    grade: '초6', enrolledClassIds: ['m2', 't3', 'f1'],
    teacherComments: [], vocabTestHistory: [], attendanceHistory: [],
    progressMemo: ''
  },
  {
    id: 's7', name: '박시유', schoolId: 'sch1', schoolName: '서동초등학교',
    grade: '초5', enrolledClassIds: ['m2', 'f1'],
    teacherComments: [], vocabTestHistory: [], attendanceHistory: [],
    progressMemo: ''
  },
  {
    id: 's8', name: '이지민', schoolId: 'sch2', schoolName: '대구중학교',
    grade: '중1', enrolledClassIds: ['m3', 'w2'],
    teacherComments: [{ date: '2026-03-20', text: '듣기 집중도 좋음. 어휘가 약해서 보충 필요.' }],
    vocabTestHistory: [{ date: '2026-04-05', classId: 'm3', className: '중등듣기반', wrong: 8 }],
    attendanceHistory: [],
    progressMemo: ''
  },
  {
    id: 's9', name: '윤세하', schoolId: 'sch2', schoolName: '대구중학교',
    grade: '중1', enrolledClassIds: ['m3', 'w2'],
    teacherComments: [], vocabTestHistory: [], attendanceHistory: [],
    progressMemo: ''
  },
  {
    id: 's10', name: '김보겸', schoolId: 'sch2', schoolName: '대구중학교',
    grade: '중2', enrolledClassIds: ['m3', 'w2'],
    teacherComments: [],
    vocabTestHistory: [{ date: '2026-04-05', classId: 'm3', className: '중등듣기반', wrong: 3 }],
    attendanceHistory: [],
    progressMemo: ''
  },
  {
    id: 's11', name: '조승아', schoolId: 'sch2', schoolName: '대구중학교',
    grade: '중2', enrolledClassIds: ['m3'],
    teacherComments: [], vocabTestHistory: [], attendanceHistory: [],
    progressMemo: ''
  },
  {
    id: 's12', name: '채유', schoolId: 'sch1', schoolName: '서동초등학교',
    grade: '초4', enrolledClassIds: ['t2', 'w1'],
    teacherComments: [], vocabTestHistory: [], attendanceHistory: [],
    progressMemo: ''
  },
  {
    id: 's13', name: '예진', schoolId: 'sch1', schoolName: '서동초등학교',
    grade: '초4', enrolledClassIds: ['t2', 'w1'],
    teacherComments: [], vocabTestHistory: [], attendanceHistory: [],
    progressMemo: ''
  },
  {
    id: 's14', name: '하진', schoolId: 'sch1', schoolName: '서동초등학교',
    grade: '초5', enrolledClassIds: ['t2', 'w1'],
    teacherComments: [], vocabTestHistory: [], attendanceHistory: [],
    progressMemo: ''
  },
  {
    id: 's15', name: '신아', schoolId: 'sch1', schoolName: '서동초등학교',
    grade: '초5', enrolledClassIds: ['t2'],
    teacherComments: [], vocabTestHistory: [], attendanceHistory: [],
    progressMemo: ''
  },
  {
    id: 's16', name: '임민경', schoolId: 'sch3', schoolName: '성광고등학교',
    grade: '고1', enrolledClassIds: ['h1', 'f2'],
    teacherComments: [{ date: '2026-03-10', text: '수능 듣기 집중 훈련 중. 3월 모의 2등급.' }],
    vocabTestHistory: [{ date: '2026-04-03', classId: 'h1', className: '고등듣기반', wrong: 6 }],
    attendanceHistory: [],
    progressMemo: '3월 모의고사 2등급'
  },
  {
    id: 's17', name: '남다현', schoolId: 'sch3', schoolName: '성광고등학교',
    grade: '고1', enrolledClassIds: ['h1', 'f2'],
    teacherComments: [], vocabTestHistory: [], attendanceHistory: [],
    progressMemo: ''
  },
  {
    id: 's18', name: '이지윤', schoolId: 'sch3', schoolName: '성광고등학교',
    grade: '고1', enrolledClassIds: ['h1', 'f2'],
    teacherComments: [], vocabTestHistory: [], attendanceHistory: [],
    progressMemo: ''
  }
];

export const initialWeeklyClasses = {
  월: [
    {
      id: 'm1', dayOfWeek: '월', time: '14:00', name: '파닉스반', type: '파닉스',
      book: '브릭스파닉스2', hw: 'p.10~12', classMemo: '',
      studentIds: ['s1', 's2', 's3']
    },
    {
      id: 'm2', dayOfWeek: '월', time: '15:00', name: '초등문법반', type: '문법',
      book: '그래머텐 기본2', hw: '워크북 p.5~8', classMemo: '',
      studentIds: ['s4', 's5', 's6', 's7']
    },
    {
      id: 'm3', dayOfWeek: '월', time: '16:00', name: '중등듣기반', type: '듣기',
      book: 'EBS 실전모의고사', hw: '듣기 5회분', classMemo: '',
      studentIds: ['s8', 's9', 's10', 's11']
    }
  ],
  화: [
    {
      id: 't1', dayOfWeek: '화', time: '14:00', name: '파닉스반', type: '파닉스',
      book: '브릭스파닉스2', hw: 'p.13~15', classMemo: '',
      studentIds: ['s1', 's2', 's3']
    },
    {
      id: 't2', dayOfWeek: '화', time: '15:00', name: '초등리딩반', type: '리딩',
      book: 'Read it 40-2', hw: '지문 3개 읽기', classMemo: '',
      studentIds: ['s12', 's13', 's14', 's15']
    },
    {
      id: 't3', dayOfWeek: '화', time: '16:00', name: '중등리딩반', type: '리딩',
      book: '링크스타터2', hw: '본문 외우기', classMemo: '',
      studentIds: ['s4', 's5', 's6']
    }
  ],
  수: [
    {
      id: 'w1', dayOfWeek: '수', time: '15:00', name: '초등리딩반', type: '리딩',
      book: 'Read it 40-2', hw: '단어 20개', classMemo: '',
      studentIds: ['s12', 's13', 's14']
    },
    {
      id: 'w2', dayOfWeek: '수', time: '16:00', name: '중등문법반', type: '문법',
      book: '문법자신감 2', hw: '연습문제 A', classMemo: '',
      studentIds: ['s8', 's9', 's10']
    }
  ],
  목: [
    {
      id: 'h1', dayOfWeek: '목', time: '14:00', name: '고등듣기반', type: '듣기',
      book: '수능 실전모의고사', hw: '', classMemo: '',
      studentIds: ['s16', 's17', 's18']
    },
    {
      id: 'h2', dayOfWeek: '목', time: '15:00', name: '중등리딩반', type: '리딩',
      book: '링크스타터2', hw: '본문 외우기', classMemo: '',
      studentIds: ['s4', 's5']
    }
  ],
  금: [
    {
      id: 'f1', dayOfWeek: '금', time: '15:00', name: '초등문법반', type: '문법',
      book: '그래머텐 기본2', hw: '', classMemo: '',
      studentIds: ['s4', 's5', 's6', 's7']
    },
    {
      id: 'f2', dayOfWeek: '금', time: '16:00', name: '고등리딩반', type: '리딩',
      book: '수능특강 영어', hw: '지문 분석 2개', classMemo: '',
      studentIds: ['s16', 's17', 's18']
    }
  ],
  토: [],
  일: []
};

export const initialScheduledClasses = [];

export const DEFAULT_TODO_SECTIONS = [
  { id: 's-todo', type: 'todo', title: '오늘 할일', icon: '✅' },
  { id: 's-transfer', type: 'transfer', title: '전달사항', icon: '📢' },
  { id: 's-dday', type: 'dday', title: '시험 / D-Day', icon: '⏱️' },
  { id: 's-report', type: 'report', title: '월말 보고서', icon: '📊' },
  { id: 's-memo0', type: 'memo', title: '자유 메모', icon: '📝', content: '' }
];

export const initialState = {
  mainTab: 'schedule',
  scheduleView: 'weekly',
  manageTab: 'timetable',
  selectedDate: new Date().toISOString().slice(0, 10),
  schools: initialSchools,
  students: initialStudents,
  weeklyClasses: initialWeeklyClasses,
  scheduledClasses: initialScheduledClasses,
  todos: [
    { id: 'todo-1', text: '이혜인 단어 시험지 출력', done: false },
    { id: 'todo-2', text: '중간고사 대비 자료 준비', done: false },
    { id: 'todo-3', text: '학부모 상담 일정 정리', done: true }
  ],
  transfers: [
    { id: 'tr-1', text: '이번 주 금요일 수업 30분 단축', done: false },
    { id: 'tr-2', text: '다음 주 월요일 휴강 안내', done: false }
  ],
  exams: [
    {
      id: 'exam-1',
      title: '모의고사 자체시험',
      date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      type: '시험',
      memo: '고등반 대상'
    }
  ],
  todoSections: JSON.parse(JSON.stringify(DEFAULT_TODO_SECTIONS)),
  csvPreviewRows: [],
  csvPreviewErrors: [],
  ui: {
    showCsvPreview: false,
    classModalData: null
  }
};
