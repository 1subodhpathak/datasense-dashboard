import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { Button } from "@/components/ui/button";
import { useTheme } from '@/lib/theme-context';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Play, Send } from "lucide-react";
import axios from 'axios';
import { useWebSocketContext } from '@/util/WebsocketProvider'


export function CodeEditor({ 
  subject = 'sql',
  questionData,
  onResultUpdate,
sendDataToParent }) {
  const { theme } = useTheme();
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { socket, isConnected } = useWebSocketContext()


  const handleClick = () => {
    sendDataToParent(true);
  };

  useEffect(() => {
    if (containerRef.current) {
      editorRef.current = monaco.editor.create(containerRef.current, {
        value: questionData?.boilerplate || '',
        language: subject === 'sql' ? 'sql' : 'python',
        theme: theme === 'dark' ? 'vs-dark' : 'vs',
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        lineNumbers: 'on',
        roundedSelection: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 16, bottom: 16 }
      });

      return () => {
        editorRef.current?.dispose();
      };
    }
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    }
  }, [theme]);

  const handleCodeExecution = async (isSubmission = false) => {
    const code = editorRef.current?.getValue();
    setIsProcessing(true);
    setOutput('');
    setError('');
    setShowFeedback(false);
    setFeedback(null);


    try {
      if (subject === 'sql') {
        await handleSQLExecution(code, isSubmission);
      } else {
        await handlePythonExecution(code, isSubmission);
      }
    } catch (err) {
      setError('Failed to execute code. Please try again.');
      setFeedback({
        type: 'error',
        message: `Error executing code: ${err.message}`
      });
    } finally {
      setIsProcessing(false);
      setShowFeedback(true);
    }
  };

  const handleSQLExecution = async (code, isSubmission) => {
    
    const response = await axios.get(
      `https://server.datasenseai.com/execute-sql/query?q=${encodeURIComponent(code)}`
    );
    const result = response.data;
    
    if (!isSubmission) {
      setOutput(result);
      return;
    }



    const isCorrect = compareResults(result, questionData.expected_output);
    handleSubmissionResult(isCorrect, result);
  };

  const handlePythonExecution = async (code, isSubmission) => {
  
    if (!isSubmission) {
      // Use Piston API for running code and seeing output
      const combinedCode = questionData.test_cases.map(
        testCase => `print(${testCase.input})`
      ).join('\n');
      const fullCode = `${code}\n${combinedCode}`;
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'python',
          version: '3.10',
          files: [{ content: fullCode }]
        })
      });

      const data = await response.json();
      
      if (data.run) {
        if (data.run.stdout) setOutput(data.run.stdout);
        if (data.run.stderr) setError(data.run.stderr);
      }
      return;
    }

    // For submission, check against test cases
    const allTestCasesPassed = await checkAllTestCases(code, questionData.test_cases);
    handleSubmissionResult(allTestCasesPassed);

   
  };


  const checkAllTestCases = async (userCode, testCases) => {
    const combinedCode = testCases.map(
      testCase => `print(${testCase.input})`
    ).join('\n');
    const fullCode = `${userCode}\n${combinedCode}`;
    try {
      const response = await axios.post(
        'https://emkc.org/api/v2/piston/execute',
        {
          language: 'python',
          version: '3.10',
          files: [{ name: 'main.py', content: fullCode }]
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const outputs = response.data.run.output.split('\n').map(output => output.trim());
      for (let i = 0; i < testCases.length; i++) {
        if (outputs[i] !== testCases[i].expected_output) {
          // setUserOutput(outputs[i]);
          return false;
        }
      }


      return true;
    
    } catch (error) {
      console.error('Error executing test cases:', error);

      return false;
    }
  };

  const compareResults = (userResults, expectedOutput) => {
    // Handle error case
    if (userResults.error === true) return false;
  
    // Get the rows from expected output
    const expectedRows = expectedOutput.rows;
  
    // Early return if lengths don't match
    if (userResults.length !== expectedRows.length) {
      return false;
    }
  
    // Convert both result sets to arrays of stringified sorted values
    const expectedRowStrings = expectedRows
      .map(row => JSON.stringify(Object.values(row).sort()))
      .sort();
    
    const userRowStrings = userResults
      .map(row => JSON.stringify(Object.values(row).sort()))
      .sort();
  
    // Compare the sorted string arrays
    for (let i = 0; i < expectedRowStrings.length; i++) {
      if (expectedRowStrings[i] !== userRowStrings[i]) {
        return false;
      }
    }
  
    return true;
  };

  const handleSubmissionResult = (isCorrect, result = null) => {
    setFeedback({
      type: isCorrect ? 'success' : 'error',
      message: isCorrect ? 'Correct answer!' : 'Incorrect. Please try again.',
      result,
      expected: questionData.expected_output
    });

    if (onResultUpdate) {
      onResultUpdate({
        isCorrect,
        submittedCode: editorRef.current?.getValue(),
        submittedAt: new Date()
      });
    }

    if(isCorrect) {
      const currentGame = JSON.parse(localStorage.getItem('currentGame'));

      handleClick();
      
      socket.emit('gameResult', {
        gameId: currentGame.gameId,
        winnerSocketId: socket.id,
        winnerName: currentGame.playerName
      }, (response) => {
        if (response && response.status === 'ok') {
          console.log('Game result emitted successfully:', response);
        } else {
          console.error('Failed to emit game result:', response?.error || 'Unknown error');
        }
      });
      
      console.log('its correct and the socket should have emitted the event');
    }
  };




  const clearOutput = () => {
    setOutput('');
    setError('');
    setFeedback(null);
    setShowFeedback(false);
  };

  return (
    <div className="space-y-4">
      <div className={`${theme === 'dark' ? 'bg-[#2B3440]' : 'bg-gray-100'} rounded-xl overflow-hidden`}>
        <div className={`flex items-center gap-2 px-4 py-3 border-b ${
          theme === 'dark' ? 'border-[#3f5264]' : 'border-gray-300'
        }`}>
          <div className={`text-sm font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-600'
          }`}>
            {subject === 'sql' ? 'SQL' : 'Python'}
          </div>
        </div>
        <div
          ref={containerRef}
          className="min-h-[300px] md:min-h-[600px]"
        />
      </div>


      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => handleCodeExecution(false)}
          disabled={isProcessing}
          className="bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-white px-8 w-full sm:w-auto"
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
        </Button>

        <Button 
          onClick={() => handleCodeExecution(true)}
          disabled={isProcessing}
          variant="secondary"
          className="w-full sm:w-auto"
        >
          <Send className="mr-2 h-4 w-4" />
          Submit
        </Button>

        <Button 
          onClick={clearOutput}
          variant="outline" 
          disabled={isProcessing}
          className={`${
            theme === 'dark' 
              ? 'bg-transparent border-[#2a2d2e] text-gray-300 hover:bg-[#2a2d2e] hover:text-white' 
              : 'bg-gray-100 border-gray-100 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          } w-full sm:w-auto`}
        >
          Clear Output
        </Button>
      </div>


      {(output || error) && (
       
        <div className={`p-4 font-mono text-sm rounded-xl ${
          theme === 'dark' ? 'bg-[#181F26] text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>
          <div className="font-medium mb-2">Output:</div>
          <pre className="whitespace-pre-wrap">
          {output.error ? (
        // Handle error output
        <div className="text-red-600 bg-white-50 border border-grey-400 rounded-md p-4">
          {/* <p className="font-bold"><u>Error-</u></p> */}
          <p>{output.message}</p>
          <p><strong>Details:</strong> {output.details}</p>
          <p><strong>Error Code:</strong> {output.code}</p>
        </div>
      ) : Array.isArray(output) && output.length > 0 ? (
        // Handle table output
        <table className="w-full border-collapse">
          <thead>
            <tr className={theme === 'dark' ? 'bg-[#403f3f]' : 'bg-gray-200'}>
              {Object.keys(output[0]).map((header, index) => (
                <th key={index} className="border px-4 py-2">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {output.map((row, rowIndex) => (
              <tr key={rowIndex} className={theme === 'dark' ? 'bg-[#262626]' : 'bg-gray-50'}>
                {Object.values(row).map((cell, cellIndex) => (
                  <td key={cellIndex} className="border px-4 py-2 whitespace-nowrap">
                    {typeof cell === 'object' ? JSON.stringify(cell) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // Handle simple string output
        <p>{output}</p>
      )}


          </pre>
        </div>
      )}

      {showFeedback && feedback && (
        <Alert className={feedback.type === 'error' ? 'bg-red-100' : 'bg-green-100'}
        variant={feedback.type === 'error' ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {feedback.message}
            {feedback.result && feedback.expected && (
              <div >
                {/* <div>Your output: {JSON.stringify(feedback.result)}</div> */}
                {/* <div>Expected: {JSON.stringify(feedback.expected)}</div> */}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

    </div>
  );
}

export default CodeEditor;