import React, { useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor'

export function MonacoEditor({ language, onChange, onMount }) {
  const editorRef = useRef(null)
  const editor = useRef(null)

  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.defineTheme('datawars-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#1E2124',
        }
      })

      editor.current = monaco.editor.create(editorRef.current, {
        value: '',
        language,
        theme: 'datawars-dark',
        minimap: { enabled: false },
        automaticLayout: true,
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        roundedSelection: false,
        padding: { top: 16 },
        folding: true,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 3,
        renderLineHighlight: 'none',
      })

      if (onMount) {
        onMount(editor.current)
      }

      editor.current.onDidChangeModelContent(() => {
        if (onChange) {
          onChange(editor.current?.getValue() || '')
        }
      })

      return () => {
        editor.current?.dispose()
      }
    }
  }, [language, onChange, onMount])

  return <div className="h-full w-full" ref={editorRef} />
}