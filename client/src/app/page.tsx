"use client";

export default function Home() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold">CFA-System</h1>
      <p className="max-w-md text-zinc-400">
        Select a CFA tool from the sidebar to get started. The original Python
        IDE has been moved to each tool page for running and exploring code.
      </p>
    </div>
  );
}
