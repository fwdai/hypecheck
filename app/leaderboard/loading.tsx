export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen px-4 py-12 dot-grid">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-8">
        <div className="w-full flex items-center justify-between animate-fade-up">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="w-16" />
        </div>
        <div className="text-center space-y-3 w-full animate-fade-up">
          <div className="h-10 max-w-sm mx-auto bg-muted rounded-lg animate-pulse" />
          <div className="h-4 max-w-md mx-auto bg-muted rounded animate-pulse" />
        </div>
        <div className="w-full space-y-2 animate-fade-up-delay-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-panel rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-muted rounded" />
                </div>
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
