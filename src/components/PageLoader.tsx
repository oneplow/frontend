export const PageLoader = () => {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-[1px]"
      style={{ backgroundColor: 'color-mix(in srgb, var(--app-surface) 72%, transparent)' }}
    >
      <div className="flex flex-col items-center gap-4 relative">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-slate-800 rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
          <div className="w-2 h-5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)] animate-[pulse_1s_ease-in-out_0.2s_infinite]"></div>
          <div className="w-1.5 h-2 bg-slate-800 rounded-full animate-[pulse_1s_ease-in-out_0.4s_infinite]"></div>
          <div className="w-1.5 h-2 bg-slate-800 rounded-full animate-[pulse_1s_ease-in-out_0.6s_infinite]"></div>
        </div>
        <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mt-1"></div>
      </div>
    </div>
  );
};
