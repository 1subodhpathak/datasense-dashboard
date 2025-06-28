import React, { useState } from 'react';
import { useTheme } from '@/lib/theme-context';

const TableView = ({ data, title, theme }) => {
  if (!data || !data.columns || !data.rows) return null;
  
  return (
    <div className="mt-4">
      <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>{title}</h3>
      <div className="overflow-x-auto">
        <table className={`min-w-full border ${theme === 'dark' ? 'border-[#3f5264]' : 'border-gray-200'}`}>
          <thead>
            <tr className={theme === 'dark' ? 'bg-[#2B3440]' : 'bg-gray-100'}>
              {data.columns.map((column, idx) => (
                <th key={idx} className={`px-4 py-2 text-left text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.slice(0, 10).map((row, rowIdx) => (
              <tr key={rowIdx} className={`${theme === 'dark' ? 'border-[#3f5264]' : 'border-gray-200'} border-t`}>
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className={`px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TestCase = ({ input, expected_output, theme }) => (
  <div className="space-y-2">
    <div>
      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Input:</span>
      <pre className={`${theme === 'dark' ? 'bg-[#3f5264]' : 'bg-gray-100'} p-3 rounded-lg mt-1`}>
        <code>{input}</code>
      </pre>
    </div>
    <div>
      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Expected Output:</span>
      <pre className={`${theme === 'dark' ? 'bg-[#2a2d2e]' : 'bg-gray-100'} p-3 rounded-lg mt-1`}>
        <code>{expected_output}</code>
      </pre>
    </div>
  </div>
);

// Tab component
const Tab = ({ label, active, onClick, theme }) => (
  <button
    className={`px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none ${
      active 
        ? `${theme === 'dark' ? 'bg-[#111B21] text-white border-[#3f5264] border-b-0' : 'bg-white text-gray-900 border-gray-200 border-b-0'} border-t border-l border-r` 
        : `${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

const QuestionPanel = ({ questionData }) => {
  const { theme } = useTheme();
  const isPython = questionData.test_cases !== undefined;
  
  // Define tabs based on question type and available data
  const tabs = ['Question'];
  
  if (!isPython && questionData.table_data && questionData.table_data.length > 0) {
    tabs.push('Tables');
  }
  
  if (!isPython && questionData.expected_output) {
    tabs.push('Expected Output');
  }
  
  if (isPython && questionData.test_cases) {
    tabs.push('Test Cases');
  }
  
  // State to track active tab
  const [activeTab, setActiveTab] = useState('Question');

  function parseDataOverview(inputString) {
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

  // Get the content to display based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Question':
        return (
          <div className="space-y-4">
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
              {isPython ? questionData.question_text : questionData.title}
            </h2>

            {!isPython && questionData.scenario && (
              <div className="mb-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Scenario:</h3>
                <div dangerouslySetInnerHTML={{ __html: questionData.scenario }}></div>
              </div>
            )}

            {!isPython && questionData.question_text && (
              <div className="mb-6 mt-6">
                <div className="flex">
                  <div className={`w-1 mr-4 ${theme === 'dark' ? 'bg-teal-500' : 'bg-teal-600'}`}></div>
                  <div 
                    className="question-text flex-1 p-4"
                    dangerouslySetInnerHTML={{ __html: questionData.question_text.replace(/\n/g, '<br>') }}
                  />
                </div>
              </div>
            )}

            {!isPython && questionData['data-overview'] && (
              <div className="mb-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Data Overview:</h3>
                <table className={`min-w-full border ${theme === 'dark' ? 'border-[#3f5264]' : 'border-gray-200'}`}>
                  <tbody>
                    {(() => {
                      const parsedData = parseDataOverview(questionData['data-overview']);
                      return Array.from(parsedData.entries()).map(([key, value], rowIndex) => (
                        <tr key={rowIndex} className={`${theme === 'dark' ? 'border-[#3f5264]' : 'border-gray-200'} border-t`}>
                          <td 
                            className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}
                            dangerouslySetInnerHTML={{ __html: key }}
                          ></td>
                          <td 
                            className={`px-6 py-4 whitespace-normal text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}
                            dangerouslySetInnerHTML={{
                              __html: typeof value === 'object' ? JSON.stringify(value) : value,
                            }}
                          ></td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4">
              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Additional Information:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Difficulty: {isPython ? questionData.level : questionData.difficulty}</li>
                {!isPython && questionData.ideal_time && <li>Ideal Time: {questionData.ideal_time}</li>}
                <li>Topics: {isPython ? questionData.subtopic : questionData.subtopics.join(', ')}</li>
              </ul>
            </div>
          </div>
        );
      
      case 'Tables':
        return (
          <div className="space-y-6">
            {!isPython && questionData.table_data && questionData.table_data.map((table, idx) => (
              <TableView
                key={idx}
                data={{
                  columns: table.columns,
                  rows: table.rows
                }}
                title={`Table: ${table.table_name}`}
                theme={theme}
              />
            ))}
          </div>
        );
      
      case 'Expected Output':
        return (
          <div>
            {!isPython && questionData.expected_output && (
              <TableView
                data={questionData.expected_output}
                title="Expected Output"
                theme={theme}
              />
            )}
          </div>
        );
      
      case 'Test Cases':
        return (
          <div className="space-y-6">
            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Test Cases:</h3>
            {isPython && questionData.test_cases && questionData.test_cases.map((testCase, idx) => (
              <TestCase key={idx} {...testCase} theme={theme} />
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className={`${theme === 'dark' ? 'bg-[#23282E]' : 'bg-gray-100'} flex-none flex items-center gap-2 px-4 py-3 rounded-lg border-[#373737] border-b ${theme === 'dark' ? 'border-[#3f5264]' : 'border-gray-200'}`}>
        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
          {isPython ? 'Python Question' : 'SQL Question'}
        </div>
      </div>
      
      {/* Tabs navigation */}
      <div className={`flex ${theme === 'dark' ? 'bg-[#2B3440]' : 'bg-gray-100'} border-b ${theme === 'dark' ? 'border-[#3f5264]' : 'border-gray-200'}`}>
        {tabs.map((tab) => (
          <Tab 
            key={tab}
            label={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            theme={theme}
          />
        ))}
      </div>
      
      {/* Tab content */}
      <div className={`flex-grow overflow-y-auto ${theme === 'dark' ? 'bg-[#111B21]' : 'bg-white'}`}>
        <div className={`p-6 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export { QuestionPanel };