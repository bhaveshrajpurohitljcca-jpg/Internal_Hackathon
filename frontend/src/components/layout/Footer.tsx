export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-sm text-slate-500 sm:flex-row sm:px-6">
        <p>&copy; {year} College Internal Hackathon Portal</p>
        <p>Built for internal college hackathon events</p>
      </div>
    </footer>
  );
}
