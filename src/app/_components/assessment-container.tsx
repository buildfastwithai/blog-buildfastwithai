import { mainSiteUrl } from "@/lib/urls";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Brain,
  Target,
  Clock,
} from "lucide-react";
import Link from "next/link";
interface AssessmentQuestion {
  title: string;
  question: string;
  options: { text: string; points: number }[];
}

interface AssessmentContainerProps {
  content: string;
}

// Result Card Components
const WalkingDeadResult: React.FC<{ onTryAgain: () => void }> = ({
  onTryAgain,
}) => (
  <div className="max-w-2xl mx-auto">
    <Card className="border-gray-200 dark:border-gray-700 dark:bg-transparent">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
          &quot;The Walking Dead&quot; (Career-wise)
        </CardTitle>
        <div className="space-y-2">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AI is eyeing your job like pizza, it&apos;s about to take over.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            You&apos;ve automated yourself, time to pivot fast.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            Learn skills AI can&apos;t copy, creativity, humor, human
            connection.
          </p>
        </div>
        <div className="space-y-3 flex flex-col justify-center items-center">
          <Link href={mainSiteUrl("/agentic-ai")}>
            <Button className="w-fit text-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 text-lg font-semibold">
              Future-Proof My Career →
            </Button>
          </Link>
          <Button
            onClick={onTryAgain}
            variant="outline"
            className="w-fit text-center rounded-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

const NegotiatorResult: React.FC<{ onTryAgain: () => void }> = ({
  onTryAgain,
}) => (
  <div className="max-w-2xl mx-auto">
    <Card className="border-gray-200 dark:border-gray-700 dark:bg-transparent">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
          <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-gray-400 rounded border-2 border-gray-300"></div>
        </div>
        <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
          &quot;The Negotiator&quot;
        </CardTitle>
        <div className="space-y-2">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            You&apos;re in a standoff with AI-it could go either way.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AI can be your rival or your sidekick.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            Use AI for the boring stuff-focus on people and strategy.
          </p>
        </div>
        <div className="space-y-3 flex flex-col justify-center items-center">
          <Link href={mainSiteUrl("/agentic-ai")}>
            <Button className="w-fit text-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 text-lg font-semibold">
              Train My AI Sidekick →
            </Button>
          </Link>
          <Button
            onClick={onTryAgain}
            variant="outline"
            className="w-fit text-center rounded-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

const UntouchableLegendResult: React.FC<{ onTryAgain: () => void }> = ({
  onTryAgain,
}) => (
  <div className="max-w-2xl mx-auto">
    <Card className="border-gray-200 dark:border-gray-700 dark:bg-transparent">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded"></div>
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
          &quot;The Untouchable Legend&quot;
        </CardTitle>
        <div className="space-y-2">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AI can&apos;t touch you-you thrive in human complexity.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your creativity, empathy, and chaos skills keep you unique.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            Leverage AI as your sidekick-you&apos;re still the hero.
          </p>
        </div>
        <div className="space-y-3 flex flex-col justify-center items-center">
          <Link href={mainSiteUrl("/agentic-ai")}>
            <Button className="w-fit text-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 text-lg font-semibold">
              Claim My Superpower →
            </Button>
          </Link>
          <Button
            onClick={onTryAgain}
            variant="outline"
            className="w-fit text-center rounded-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const AssessmentContainer: React.FC<AssessmentContainerProps> = ({
  content,
}) => {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number;
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [assessmentInfo, setAssessmentInfo] = useState<{
    title: string;
    description: string;
    totalQuestions: string;
    timeLimit: string;
  }>({
    title: "",
    description: "",
    totalQuestions: "",
    timeLimit: "",
  });

  useEffect(() => {
    parseAssessmentContent();
  }, [content]);

  useEffect(() => {
    if (assessmentStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [assessmentStarted, timeLeft]);

  const parseAssessmentContent = () => {
    if (typeof window === "undefined") return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");

    const parsedQuestions: AssessmentQuestion[] = [];

    // Find the assessment div
    const assessmentDiv = doc.querySelector('div[id="assessment"]');
    if (!assessmentDiv) return;

    // Parse assessment info (title, description, etc.)
    const titleElement = assessmentDiv.querySelector("h2");
    const title =
      titleElement?.textContent?.trim() ||
      "Discover Your AI-Powered Edge at Work";

    // Get all p tags before the first assessment-questions div
    const allPElements = assessmentDiv.querySelectorAll("p");
    const descriptionParagraphs: string[] = [];
    let totalQuestions = "";
    let timeLimit = "";

    allPElements.forEach((pElement) => {
      const text = pElement.textContent?.trim() || "";
      if (text.includes("Total Questions:")) {
        totalQuestions = text;
      } else if (text.includes("Time Limit:")) {
        timeLimit = text;
      } else if (
        !text.includes("→") &&
        !text.startsWith("A.") &&
        !text.startsWith("B.") &&
        !text.startsWith("C.")
      ) {
        // This is a description paragraph
        descriptionParagraphs.push(text);
      }
    });

    const description = descriptionParagraphs.join(" ");

    setAssessmentInfo({
      title,
      description,
      totalQuestions,
      timeLimit,
    });

    // Find all assessment-questions divs
    const questionDivs = assessmentDiv.querySelectorAll(
      ".assessment-questions",
    );

    questionDivs.forEach((questionDiv, index) => {
      const questionElement = questionDiv.querySelector("h3");
      if (!questionElement) return;

      const questionText = questionElement.textContent?.trim() || "";

      // Extract options and their points
      const options: { text: string; points: number }[] = [];
      const optionElements = questionDiv.querySelectorAll("p");

      optionElements.forEach((pElement) => {
        const text = pElement.textContent?.trim() || "";
        if (
          text.startsWith("A.") ||
          text.startsWith("B.") ||
          text.startsWith("C.")
        ) {
          // Find the points for this option
          const nextP = pElement.nextElementSibling;
          if (nextP && nextP.textContent?.includes("→")) {
            const pointsText = nextP.textContent?.trim() || "";
            const points = parseInt(pointsText.replace("→", "").trim()) || 0;
            options.push({
              text: text.substring(3).trim(), // Remove "A.", "B.", "C."
              points: points,
            });
          }
        }
      });

      if (questionText && options.length > 0) {
        parsedQuestions.push({
          title: `Question ${index + 1}`,
          question: questionText,
          options: options,
        });
      }
    });

    setQuestions(parsedQuestions);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
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
    let score = 0;
    questions.forEach((question, index) => {
      const selectedOptionIndex = selectedAnswers[index];
      if (selectedOptionIndex !== undefined) {
        score += question.options[selectedOptionIndex].points;
      }
    });

    setTotalScore(score);
    setShowResults(true);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setTotalScore(0);
    setAssessmentStarted(false);
    setTimeLeft(600);
  };

  const handleStartAssessment = () => {
    setAssessmentStarted(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getResultComponent = () => {
    if (totalScore >= 8 && totalScore <= 12) {
      return <WalkingDeadResult onTryAgain={handleRestart} />;
    } else if (totalScore >= 13 && totalScore <= 19) {
      return <NegotiatorResult onTryAgain={handleRestart} />;
    } else if (totalScore >= 20 && totalScore <= 24) {
      return <UntouchableLegendResult onTryAgain={handleRestart} />;
    }
    return <WalkingDeadResult onTryAgain={handleRestart} />; // Default fallback
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 dark:bg-transparent">
        <p className="text-gray-600 dark:text-gray-400">
          No assessment content found
        </p>
      </div>
    );
  }

  // Assessment Intro Screen
  if (!assessmentStarted) {
    return (
      <div className="max-w-3xl mx-auto dark:bg-transparent ">
        <Card className="text-center py-16 border-gray-200 dark:border-gray-700 dark:bg-transparent shadow-sm">
          <CardHeader className="space-y-2 px-8 pt-12 pb-0">
            <CardTitle className="text-4xl font-bold text-[#1E3A8A] dark:text-white leading-tight">
              {assessmentInfo.title || "Discover Your AI-Powered Edge at Work"}
            </CardTitle>
            <div className="space-y-1">
              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-base">
                {assessmentInfo.description ||
                  "8 quick questions. 2 minutes. A clear path to your AI-enhanced future."}
              </p>
              {assessmentInfo.totalQuestions && (
                <p className="text-gray-500 dark:text-gray-500 text-xs md:text-sm font-medium">
                  {assessmentInfo.totalQuestions}
                </p>
              )}
              {assessmentInfo.timeLimit && (
                <p className="text-gray-500 dark:text-gray-500 text-xs md:text-sm font-medium">
                  {assessmentInfo.timeLimit}
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-8 ">
            <Button
              onClick={handleStartAssessment}
              className="bg-blue-500 hover:bg-blue-600 mt-4 text-white px-8 py-3 rounded-full font-medium text-base transition-colors duration-200 inline-flex items-center gap-2"
            >
              Find My AI Edge
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto border-2 py-6 rounded-lg border-gray-200 dark:bg-transparent">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-[#1E3A8A] dark:text-white mb-2">
            Your AI Replacement Destiny Revealed!
          </h2>
        </div>
        {getResultComponent()}
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="max-w-2xl mx-auto dark:bg-transparent">
      <Card className="border-gray-200 dark:border-gray-700 dark:bg-transparent">
        <CardHeader className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              {/* <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-500 font-medium">
                  {formatTime(timeLeft)}
                </span>
              </div> */}
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
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          selectedAnswers[currentQuestionIndex] === index
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {selectedAnswers[currentQuestionIndex] === index && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span
                        className={`text-base font-medium ${
                          selectedAnswers[currentQuestionIndex] === index
                            ? "text-blue-900 dark:text-blue-100"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}. {option.text}
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
                Submit Assessment
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
                      : selectedAnswers[index] !== undefined
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
