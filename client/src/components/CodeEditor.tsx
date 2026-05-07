"use client";

import { Editor, type OnMount } from "@monaco-editor/react";
import { useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
};

/**
 * Thin wrapper over @monaco-editor/react configured for Python by default.
 * Rendered client-side only (see dynamic import in the page).
 */
export default function CodeEditor({
  value,
  onChange,
  language = "python",
  height = "100%",
}: Props) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  return (
    <Editor
      height={height}
      defaultLanguage={language}
      language={language}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      onMount={(editor) => {
        editorRef.current = editor;
      }}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily:
          'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        renderLineHighlight: "line",
      }}
    />
  );
}
