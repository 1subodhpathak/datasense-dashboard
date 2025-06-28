import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore: monaco-editor types may not be present if not installed
import * as monaco from 'monaco-editor';
// @ts-ignore: axios types may not be present if not installed
import axios from 'axios';
import { Loader2, Play, Send } from "lucide-react";

interface TestCase {
    input: string;
    expected_output: string;
}

interface QuestionData {
    boilerplate?: string;
    expected_output?: any;
    test_cases?: TestCase[];
}

interface CodeEditorProps {
    subject?: 'sql' | 'python';
    questionData: QuestionData;
    themeMode?: 'light' | 'dark';
    fixedActionBar?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
    subject = 'sql',
    questionData,
    themeMode = 'dark',
    fixedActionBar = false,
}) => {
    const editorRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [output, setOutput] = useState<any>(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    // Custom Monaco theme for your app
    useEffect(() => {
        if (monaco && monaco.editor && monaco.editor.defineTheme) {
            monaco.editor.defineTheme('ds-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: '', foreground: 'E5E7EB', background: '181F26' },
                    { token: 'string', foreground: '14B8A6' },
                    { token: 'keyword', foreground: '00E2CA' },
                    { token: 'number', foreground: 'FBBF24' },
                ],
                colors: {
                    'editor.background': '#181F26',
                    'editor.lineHighlightBackground': '#23272e',
                    'editorLineNumber.foreground': '#6EE7B7',
                    'editorCursor.foreground': '#14B8A6',
                    'editor.selectionBackground': '#14B8A655',
                    'editor.inactiveSelectionBackground': '#23272e',
                },
            });
        }
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            editorRef.current = monaco.editor.create(containerRef.current, {
                value: questionData?.boilerplate || '',
                language: subject === 'sql' ? 'sql' : 'python',
                theme: 'ds-dark',
                minimap: { enabled: false },
                fontSize: 15,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
            });
            return () => {
                editorRef.current?.dispose();
            };
        }
    }, [containerRef, questionData, subject]);

    useEffect(() => {
        if (editorRef.current) {
            monaco.editor.setTheme('ds-dark');
        }
    }, [themeMode]);

    const handleCodeExecution = async (isSubmission = false) => {
        const code = editorRef.current?.getValue();
        setIsProcessing(true);
        setOutput('');
        setError('');
        setShowFeedback(false);
        setFeedback(null);
        setTimeout(() => {
            setOutput(`Output (simulated):\n${code}`);
            setIsProcessing(false);
            setShowFeedback(true);
        }, 1000);
    };

    const clearOutput = () => {
        setOutput('');
        setError('');
        setFeedback(null);
        setShowFeedback(false);
    };

    return (
        <div className="relative h-full flex flex-col">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-[#14B8A6]/20 bg-[#181F26] flex-1 flex flex-col">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#23272e] bg-[#23272e] rounded-t-2xl">
                    <div className="text-sm font-semibold text-white tracking-wide">
                        {subject === 'sql' ? 'SQL' : 'Python'}
                    </div>
                </div>
                <div
                    ref={containerRef}
                    className={`min-h-[300px] md:min-h-[600px] bg-[#181F26] flex-1 custom-scrollbar`}
                />
                {(output || error) && (
                    <div className="p-4 font-mono text-sm rounded-xl bg-[#23272e] text-[#14B8A6] border border-[#14B8A6]/30 shadow mt-4">
                        <div className="font-medium mb-2 text-white">Output:</div>
                        <pre className="whitespace-pre-wrap text-[#14B8A6]">{output}</pre>
                    </div>
                )}
            </div>
            {fixedActionBar ? (
                <div className="sticky bottom-0 left-0 w-full bg-[#181F26] z-10 pt-4 pb-2 flex flex-col">
                    <div className="flex flex-col sm:flex-row gap-4 px-2">
                        <button
                            onClick={() => handleCodeExecution(false)}
                            disabled={isProcessing}
                            className="bg-[#14B8A6] hover:bg-[#00E2CA] text-white px-8 w-full sm:w-auto rounded-lg font-semibold shadow transition-colors duration-200"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Run Code
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => handleCodeExecution(true)}
                            disabled={isProcessing}
                            className="bg-[#23272e] text-[#14B8A6] px-8 w-full sm:w-auto rounded-lg font-semibold border border-[#14B8A6]/40 shadow"
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Submit
                        </button>
                        <button
                            onClick={clearOutput}
                            disabled={isProcessing}
                            className="bg-[#181F26] border border-[#23272e] text-gray-300 px-8 w-full sm:w-auto rounded-lg font-semibold shadow"
                        >
                            Clear Output
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <button
                        onClick={() => handleCodeExecution(false)}
                        disabled={isProcessing}
                        className="bg-[#14B8A6] hover:bg-[#00E2CA] text-white px-8 w-full sm:w-auto rounded-lg font-semibold shadow transition-colors duration-200"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-4 w-4" />
                                Run Code
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => handleCodeExecution(true)}
                        disabled={isProcessing}
                        className="bg-[#23272e] text-[#14B8A6] px-8 w-full sm:w-auto rounded-lg font-semibold border border-[#14B8A6]/40 shadow"
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Submit
                    </button>
                    <button
                        onClick={clearOutput}
                        disabled={isProcessing}
                        className="bg-[#181F26] border border-[#23272e] text-gray-300 px-8 w-full sm:w-auto rounded-lg font-semibold shadow"
                    >
                        Clear Output
                    </button>
                </div>
            )}
        </div>
    );
};

export default CodeEditor; 