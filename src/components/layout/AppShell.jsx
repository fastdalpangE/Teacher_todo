import TopNav from './TopNav';

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <TopNav />
      <div className="page-wrap">{children}</div>
    </div>
  );
}
