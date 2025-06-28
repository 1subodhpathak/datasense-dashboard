import React, { useState } from 'react';
// Minimal theme context fallback
const useTheme = () => ({ theme: 'light' });

interface TableData {
    columns: string[];
    rows: any[][];
    table_name?: string;
}

interface TestCase {
    input: string;
    expected_output: string;
}

interface QuestionData {
    question_text?: string;
    title?: string;
    scenario?: string;
    'data-overview'?: string;
    difficulty?: string;
    ideal_time?: string;
    subtopic?: string;
    subtopics?: string[];
    level?: string;
    table_data?: TableData[];
    expected_output?: TableData;
    test_cases?: TestCase[];
}

interface QuestionPanelProps {
    questionData: QuestionData;
}

const TableView = ({ data, title }: { data: TableData; title: string }) => {
    if (!data || !data.columns || !data.rows) return null;
    return (
        <div className="mt-4">
            <h3 className="font-medium text-white mb-2">{title}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full border border-[#14B8A6]/30 bg-[#23272e] rounded-lg">
                    <thead>
                        <tr className="bg-[#181F26]">
                            {data.columns.map((column, idx) => (
                                <th key={idx} className="px-4 py-2 text-left text-sm font-medium text-[#14B8A6]">{column}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.slice(0, 10).map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-t border-[#14B8A6]/10">
                                {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className="px-4 py-2 text-sm text-gray-200">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TestCase = ({ input, expected_output }: { input: string; expected_output: string }) => (
    <div className="space-y-2">
        <div>
            <span className="font-medium text-white">Input:</span>
            <pre className="bg-[#23272e] p-3 rounded-lg mt-1 text-gray-200"><code>{input}</code></pre>
        </div>
        <div>
            <span className="font-medium text-white">Expected Output:</span>
            <pre className="bg-[#181F26] p-3 rounded-lg mt-1 text-gray-200"><code>{expected_output}</code></pre>
        </div>
    </div>
);

const Tab = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg focus:outline-none transition-colors duration-200
        ${active
                ? 'bg-[#14B8A6] text-white shadow border-b-0'
                : 'bg-[#23272e] text-gray-400 hover:text-[#14B8A6] border-b border-[#23272e]'}
        `}
        style={{ borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem' }}
        onClick={onClick}
    >
        {label}
    </button>
);

export const QuestionPanel: React.FC<QuestionPanelProps> = ({ questionData }) => {
    const { theme } = useTheme();
    const isPython = questionData.test_cases !== undefined;
    const tabs = ['Question'];
    if (!isPython && questionData.table_data && questionData.table_data.length > 0) tabs.push('Tables');
    if (!isPython && questionData.expected_output) tabs.push('Expected Output');
    if (isPython && questionData.test_cases) tabs.push('Test Cases');
    const [activeTab, setActiveTab] = useState('Question');
    function parseDataOverview(inputString: string) {
        const resultMap = new Map();
        const lines = inputString.split("\n");
        lines.forEach(line => {
            const colonIndex = line.indexOf(":");
            if (colonIndex !== -1) {
                const key = line.slice(0, colonIndex).trim();
                const value = line.slice(colonIndex + 1).trim();
                resultMap.set(key, value);
            }
        });
        return resultMap;
    }
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Question':
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-white mb-4">
                            {isPython ? questionData.question_text : questionData.title}
                        </h2>
                        {!isPython && questionData.scenario && (
                            <div className="mb-4">
                                <h3 className="font-medium text-white mb-2">Scenario:</h3>
                                <div className="text-gray-200" dangerouslySetInnerHTML={{ __html: questionData.scenario }}></div>
                            </div>
                        )}
                        {!isPython && questionData.question_text && (
                            <div className="mb-6 mt-6">
                                <div className="flex">
                                    <div className="w-1 mr-4 bg-[#14B8A6]" style={{ minHeight: 32 }}></div>
                                    <div className="question-text flex-1 p-4 text-gray-200" dangerouslySetInnerHTML={{ __html: questionData.question_text.replace(/\n/g, '<br>') }} />
                                </div>
                            </div>
                        )}
                        {!isPython && questionData['data-overview'] && (
                            <div className="mb-4">
                                <h3 className="font-medium text-white mb-2">Data Overview:</h3>
                                <table className="min-w-full border border-[#14B8A6]/30 bg-[#23272e] rounded-lg"><tbody>{(() => { const parsedData = parseDataOverview(questionData['data-overview']!); return Array.from(parsedData.entries()).map(([key, value], rowIndex) => (<tr key={rowIndex} className="border-t border-[#14B8A6]/10"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200" dangerouslySetInnerHTML={{ __html: key }}></td><td className="px-6 py-4 whitespace-normal text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: typeof value === 'object' ? JSON.stringify(value) : value, }}></td></tr>)); })()}</tbody></table>
                            </div>
                        )}
                        <div className="mt-4">
                            <h3 className="font-medium text-white mb-2">Additional Information:</h3>
                            <ul className="list-disc list-inside space-y-1 text-gray-300">
                                <li>Difficulty: {isPython ? questionData.level : questionData.difficulty}</li>
                                {!isPython && questionData.ideal_time && <li>Ideal Time: {questionData.ideal_time}</li>}
                                <li>Topics: {isPython ? questionData.subtopic : questionData.subtopics?.join(', ')}</li>
                            </ul>
                        </div>
                    </div>
                );
            case 'Tables':
                return (
                    <div className="space-y-6">
                        {!isPython && questionData.table_data && questionData.table_data.map((table, idx) => (
                            <TableView key={idx} data={{ columns: table.columns, rows: table.rows }} title={`Table: ${table.table_name}`} />
                        ))}
                    </div>
                );
            case 'Expected Output':
                return (
                    <div>
                        {!isPython && questionData.expected_output && (
                            <TableView data={questionData.expected_output} title="Expected Output" />
                        )}
                    </div>
                );
            case 'Test Cases':
                return (
                    <div className="space-y-6">
                        <h3 className="font-medium text-white mb-2">Test Cases:</h3>
                        {isPython && questionData.test_cases && questionData.test_cases.map((testCase, idx) => (
                            <TestCase key={idx} {...testCase} />
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };
    return (
        <div className="h-full flex flex-col bg-[#181F26] rounded-2xl shadow-xl border border-[#14B8A6]/20">
            <div className="flex-none flex items-center gap-2 px-4 py-3 rounded-t-2xl bg-[#23272e] border-b border-[#23272e]">
                <div className="text-sm font-semibold text-white">{isPython ? 'Python Question' : 'SQL Question'}</div>
            </div>
            {/* Tabs navigation */}
            <div className="flex bg-[#23272e] border-b border-[#23272e] rounded-t-2xl">
                {tabs.map((tab) => (
                    <Tab key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
                ))}
            </div>
            {/* Tab content */}
            <div className="flex-grow overflow-y-auto bg-[#181F26] rounded-b-2xl">
                <div className="p-6 text-sm">{renderTabContent()}</div>
            </div>
        </div>
    );
};

export default QuestionPanel; 