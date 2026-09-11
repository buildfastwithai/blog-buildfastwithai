import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Send,
  BookOpen,
  Trophy,
  Star,
} from "lucide-react";

interface QuizQuestion {
  title: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizContainerProps {
  content: string;
}

// CTA Component for 50-74% score
const StudyMoreCTA: React.FC = () => (
  <div className="space-y-3  border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
    <div className="flex items-center justify-center">
      <BookOpen className="h-8 w-8 text-blue-500 mr-2" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Good Progress! Keep Learning
      </h3>
    </div>
    <p className="text-gray-600 dark:text-gray-300 text-center">
      You&apos;re on the right track! Review the material and practice more to
      improve your understanding.
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Button className="bg-blue-500 hover:bg-blue-600 text-white">
        Review Study Materials
      </Button>
      <Button
        variant="outline"
        className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
      >
        Practice More Questions
      </Button>
    </div>
  </div>
);

// CTA Component for 75-89% score
const WellDoneCTA: React.FC = () => (
  <div className="space-y-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
    <div className="flex items-center justify-center">
      <Trophy className="h-8 w-8 text-blue-500 mr-2" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Well Done! Great Understanding
      </h3>
    </div>
    <p className="text-gray-600 dark:text-gray-300 text-center">
      Excellent work! You have a solid grasp of the material. Ready to take on
      more challenges?
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Button className="bg-blue-500 hover:bg-blue-600 text-white">
        Take Advanced Quiz
      </Button>
      <Button
        variant="outline"
        className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
      >
        Share Achievement
      </Button>
    </div>
  </div>
);

// CTA Component for 90%+ score
const ExceptionalCTA: React.FC = () => (
  <div className="space-y-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
    <div className="flex items-center justify-center">
      <Star className="h-8 w-8 text-blue-500 mr-2" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Exceptional Performance! 🎉
      </h3>
    </div>
    <p className="text-gray-600 dark:text-gray-300 text-center">
      Outstanding! You&apos;ve mastered this topic. Consider helping others or
      exploring advanced concepts.
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Button className="bg-blue-500 hover:bg-blue-600 text-white">
        Become a Mentor
      </Button>
      <Button
        variant="outline"
        className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
      >
        Explore Advanced Topics
      </Button>
    </div>
  </div>
);

const QuizContainer: React.FC<QuizContainerProps> = ({ content }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string;
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    parseQuizContent();
  }, [content]);

  const parseQuizContent = () => {
    if (typeof window === "undefined") return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");

    const parsedQuestions: QuizQuestion[] = [];
    const seenQuestions = new Set<string>(); // Track seen questions to prevent duplicates

    // Find all quiz divs (including nested ones)
    const quizDivs = doc.querySelectorAll('div[id="quiz"]');

    quizDivs.forEach((quizDiv) => {
      // Extract question from h2 (main question)
      const questionElement = quizDiv.querySelector("h2");
      if (!questionElement) return;

      const questionText = questionElement.textContent?.trim() || "";

      // Skip if we've already seen this question
      if (seenQuestions.has(questionText)) {
        console.log("Skipping duplicate question:", questionText);
        return;
      }

      // Extract options from ul > li > p
      const optionsList = quizDiv.querySelector("ul");
      if (!optionsList) return;

      const options = Array.from(optionsList.querySelectorAll("li"))
        .map((li) => {
          const pElement = li.querySelector("p");
          return pElement
            ? pElement.textContent?.trim() || ""
            : li.textContent?.trim() || "";
        })
        .filter((opt) => opt.length > 0);

      // Extract correct answer from p with strong
      const correctAnswerElement = quizDiv.querySelector("p strong");
      if (!correctAnswerElement) return;

      const correctAnswer = correctAnswerElement.textContent?.trim() || "";

      // Only add if we have all required fields
      if (questionText && options.length > 0 && correctAnswer) {
        seenQuestions.add(questionText); // Mark as seen
        parsedQuestions.push({
          title: `Question ${parsedQuestions.length + 1}`,
          question: questionText,
          options: options,
          correctAnswer: correctAnswer,
        });
      }
    });

    setQuestions(parsedQuestions);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setShowResults(true);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setQuizStarted(false);
    setShowAnswers(false);
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  // Function to determine which CTA to show based on score percentage
  const renderCTABasedOnScore = () => {
    const percentage = (score / questions.length) * 100;

    if (percentage >= 90) {
      return <ExceptionalCTA />;
    } else if (percentage >= 60) {
      return <WellDoneCTA />;
    } else if (percentage >= 20) {
      return <StudyMoreCTA />;
    }

    return null; // No CTA for scores below 50%
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 dark:bg-transparent">
        <p className="text-gray-600 dark:text-gray-400">
          No quiz content found
        </p>
      </div>
    );
  }

  // Quiz Intro Screen
  if (!quizStarted) {
    return (
      <div className="max-w-7xl mx-auto dark:bg-transparent">
        <Card className="text-center border-gray-200 dark:border-gray-700 dark:bg-transparent">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              Test Your Knowledge
            </CardTitle>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {questions.length} quick questions.{" "}
              {Math.ceil(questions.length * 0.5)} minutes. A clear path to
              mastery.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-blue-500 font-semibold">
                    {questions.length}
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  Questions
                </span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-blue-500 font-semibold">MCQ</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">Format</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-blue-500 font-semibold">Instant</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  Results
                </span>
              </div>
            </div>

            <Button
              onClick={handleStartQuiz}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-lg font-semibold"
            >
              Start Quiz →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const percentage = (score / questions.length) * 100;

    return (
      <div className="max-w-7xl mx-auto dark:bg-transparent">
        {/* Unified Results Card */}
        <Card className="border-gray-200 dark:border-gray-700 dark:bg-transparent">
          <CardHeader className="text-center space-y-4">
            {/* <div className="mx-auto w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              {percentage >= 90 ? (
                <Star className="w-10 h-10 text-white" />
              ) : percentage >= 75 ? (
                <Trophy className="w-10 h-10 text-white" />
              ) : (
                <BookOpen className="w-10 h-10 text-white" />
              )}
            </div> */}
            <CardTitle className="text-3xl text-gray-900 dark:text-white">
              Quiz Complete!
            </CardTitle>

            {/* Score Section */}
            <div className="space-y-2">
              <div className="text-5xl font-bold text-blue-500 mb-2">
                {score}/{questions.length}
              </div>
              <div className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                {Math.round(percentage)}% Score
              </div>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                {score === questions.length
                  ? "Perfect! 🎉"
                  : score >= questions.length * 0.7
                    ? "Great job! 👍"
                    : score >= questions.length * 0.5
                      ? "Good effort! 💪"
                      : "Keep practicing! 📚"}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* CTA Section */}
            {renderCTABasedOnScore()}

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setShowAnswers(!showAnswers)}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  {showAnswers ? "Hide Answers" : "View Answers"}
                </Button>
                <Button
                  onClick={handleRestart}
                  className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                >
                  Take Quiz Again
                </Button>
              </div>
            </div>

            {/* View Answers Section */}
            {showAnswers && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Review Your Answers
                </h3>
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {selectedAnswers[index] === question.correctAnswer ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="font-medium text-lg text-gray-900 dark:text-white">
                          Question {index + 1}
                        </span>
                      </div>
                      <p className="text-base text-gray-700 dark:text-gray-300 mb-3 font-medium">
                        {question.question}
                      </p>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-600 dark:text-gray-400">
                            Your answer:
                          </span>
                          <span
                            className={`ml-2 ${selectedAnswers[index] === question.correctAnswer ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {selectedAnswers[index] || "Not answered"}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-600 dark:text-gray-400">
                            Correct answer:
                          </span>
                          <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                            {question.correctAnswer}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnswered = selectedAnswers[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="max-w-2xl mx-auto dark:bg-transparent">
      <Card className="border-gray-200 dark:border-gray-700 dark:bg-transparent">
        <CardHeader className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(
                  ((currentQuestionIndex + 1) / questions.length) * 100,
                )}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentQuestion.title}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 text-center font-medium">
              {currentQuestion.question}
            </p>

            {/* Radio Button Group */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="group">
                  <button
                    type="button"
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedAnswers[currentQuestionIndex] === option
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          selectedAnswers[currentQuestionIndex] === option
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {selectedAnswers[currentQuestionIndex] === option && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span
                        className={`text-base font-medium ${
                          selectedAnswers[currentQuestionIndex] === option
                            ? "text-blue-900 dark:text-blue-100"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {option}
                      </span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 border-gray-300 dark:border-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={!hasAnswered}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 font-semibold"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!hasAnswered}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 font-semibold"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Progress Indicators */}
          <div className="text-center space-y-3">
            <div className="flex justify-center gap-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentQuestionIndex
                      ? "bg-blue-500 scale-125"
                      : selectedAnswers[index]
                        ? "bg-green-500"
                        : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {Object.keys(selectedAnswers).length} of {questions.length}{" "}
              questions answered
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizContainer;
