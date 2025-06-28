import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { AlertCircle, Play, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CodeExecutionHandler = ({ 
  subject,
  userCode,
  questionData,
  onResultUpdate,
  userId,
  questionId 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleCodeExecution = async (isSubmission = false) => {
    setIsProcessing(true);
    setShowFeedback(false);
    setFeedback(null);

    try {
      if (subject === 'sql') {
        await handleSQLExecution(isSubmission);
      } else {
        await handlePythonExecution(isSubmission);
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: `Error executing code: ${error.message}`
      });
    } finally {
      setIsProcessing(false);
      setShowFeedback(true);
    }
  };

  const handleSQLExecution = async (isSubmission) => {
    const response = await axios.get(
      `https://server.datasenseai.com/execute-sql/query?q=${encodeURIComponent(userCode)}`
    );
    const result = response.data;
    
    if (!isSubmission) {
      setOutput(result);
      return;
    }

    const isCorrect = compareResults(result, questionData.expected_output);
    handleSubmissionResult(isCorrect, result);
  };

  const handlePythonExecution = async (isSubmission) => {
    const allTestCasesPassed = await checkAllTestCases(userCode, questionData.test_cases);
    
    if (!isSubmission) {
      // For run operation, just show the output
      setOutput(allTestCasesPassed ? 'Test cases passed!' : 'Some test cases failed');
      return;
    }

    handleSubmissionResult(allTestCasesPassed);
  };

  const handleSubmissionResult = (isCorrect, result = null) => {
    // Update feedback
    setFeedback({
      type: isCorrect ? 'success' : 'error',
      message: isCorrect ? 'Correct answer!' : 'Incorrect. Please try again.',
      result,
      expected: questionData.expected_output
    });

    // Update scores and save submission
    onResultUpdate({
      isCorrect,
      submittedCode: userCode,
      submittedAt: new Date()
    });

    // Save solved question if correct
    if (isCorrect) {
      saveSolvedQuestion(userId, questionId);
    }

    // Save submission
    saveSubmission(userId, questionId, isCorrect, userCode);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button 
          onClick={() => handleCodeExecution(false)}
          disabled={isProcessing}
          className="w-24"
        >
          <Play className="mr-2 h-4 w-4" />
          Run
        </Button>
        
        <Button 
          onClick={() => handleCodeExecution(true)}
          disabled={isProcessing}
          variant="secondary"
          className="w-24"
        >
          <Send className="mr-2 h-4 w-4" />
          Submit
        </Button>
      </div>

      {output && (
        <div className="p-4 bg-secondary rounded-md">
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}

      {showFeedback && feedback && (
        <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {feedback.message}
            {feedback.result && feedback.expected && (
              <div className="mt-2">
                <div>Your output: {JSON.stringify(feedback.result)}</div>
                <div>Expected: {JSON.stringify(feedback.expected)}</div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CodeExecutionHandler;