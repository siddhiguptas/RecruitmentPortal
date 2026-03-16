import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  AlertTriangle, 
  Camera, 
  CheckCircle2, 
  Loader2,
  Info,
  ShieldCheck,
  Play
} from "lucide-react";
import { getTestDetails, startTest, saveAnswer, submitTest } from "../services/testService";
import { socketService } from "../services/socketService";
import { Button } from "../components/Button";
import { cn } from "../utils";

interface Question {
  _id: string;
  text: string;
  options: string[];
  type: "mcq";
}

interface Test {
  _id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  questions: Question[];
}

const OnlineTest = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  
  // State
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"instructions" | "in-progress" | "submitted">("instructions");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const proctoringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mock data for testing if API fails
  const mockTest: Test = {
    _id: "test-1",
    title: "Frontend Engineering Assessment",
    description: "This test evaluates your knowledge of React, TypeScript, and modern CSS practices. Please ensure you are in a quiet environment with a working webcam.",
    duration: 30,
    questions: [
      {
        _id: "q1",
        text: "What is the purpose of React's useMemo hook?",
        options: [
          "To memoize a component to prevent re-renders",
          "To memoize a function to prevent it from being recreated",
          "To memoize a value to prevent expensive recalculations on every render",
          "To handle side effects in functional components"
        ],
        type: "mcq"
      },
      {
        _id: "q2",
        text: "Which of the following is NOT a valid TypeScript utility type?",
        options: [
          "Partial<T>",
          "Required<T>",
          "Pick<T, K>",
          "Select<T, K>"
        ],
        type: "mcq"
      },
      {
        _id: "q3",
        text: "In Tailwind CSS, what does the 'flex-1' class do?",
        options: [
          "Sets flex-grow to 1, flex-shrink to 1, and flex-basis to 0%",
          "Sets flex-grow to 1, flex-shrink to 0, and flex-basis to auto",
          "Sets flex-grow to 0, flex-shrink to 1, and flex-basis to auto",
          "Sets flex-grow to 1, flex-shrink to 1, and flex-basis to auto"
        ],
        type: "mcq"
      },
      {
        _id: "q4",
        text: "What is the time complexity of searching for an element in a balanced Binary Search Tree?",
        options: [
          "O(1)",
          "O(n)",
          "O(log n)",
          "O(n log n)"
        ],
        type: "mcq"
      },
      {
        _id: "q5",
        text: "Which HTTP status code represents 'Unauthorized'?",
        options: [
          "400",
          "401",
          "403",
          "404"
        ],
        type: "mcq"
      }
    ]
  };

  useEffect(() => {
    socketService.connect();
    fetchTest();

    const handleCheatingAlert = (data: { message?: string; alert?: string }) => {
      const message = data?.message || data?.alert || "Suspicious activity detected";
      setAlerts(prev => [message, ...prev.slice(0, 2)]);
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a !== message));
      }, 5000);
    };

    const handleProctorConnectionError = (data: { message?: string }) => {
      const message = data?.message || "Proctoring service unavailable";
      setAlerts(prev => [message, ...prev.slice(0, 2)]);
    };

    socketService.on("cheating_alert", handleCheatingAlert);
    socketService.on("proctor_connection_error", handleProctorConnectionError);

    return () => {
      stopProctoring();
      stopTimer();
      socketService.off("cheating_alert", handleCheatingAlert);
      socketService.off("proctor_connection_error", handleProctorConnectionError);
      socketService.disconnect();
    };
  }, [testId]);

  const normalizeTest = (raw: any): Test => {
    const questions = (raw?.questions || []).map((q: any, idx: number) => ({
      _id: q._id || `q-${idx}`,
      text: q.text || q.questionText || "",
      options: q.options || [],
      type: "mcq" as const
    }));

    return {
      _id: raw?._id || "test-1",
      title: raw?.title || "Assessment",
      description: raw?.description || "",
      duration: raw?.duration || 30,
      questions
    };
  };

  const fetchTest = async () => {
    setLoading(true);
    try {
      // Try to fetch from API, fallback to mock
      const data = await getTestDetails(testId || "test-1").catch(() => mockTest);
      const normalized = data?.test ? normalizeTest(data.test) : normalizeTest(data);
      setTest(normalized);
      setTimeLeft(normalized.duration * 60);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startExam = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }

      try {
        const result = await startTest(testId || "test-1");
        setAttemptId(result.attemptId);
        if (result?.test) {
          const normalized = normalizeTest(result.test);
          setTest(normalized);
          if (typeof result.timeRemaining === "number") {
            setTimeLeft(result.timeRemaining);
          }
        }
      } catch (startErr) {
        console.warn("Failed to start test via API, continuing in mock mode.", startErr);
      }

      setStatus("in-progress");
      startTimer();
      startProctoring();
      
      // Notify backend via socket
      socketService.emit("start_exam", { testId, timestamp: new Date() });
    } catch (err) {
      alert("Camera access is required for proctoring. Please enable it to start the exam.");
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startProctoring = () => {
    proctoringIntervalRef.current = setInterval(() => {
      captureAndSendFrame();
    }, 2000); // Every 2 seconds
  };

  const stopProctoring = () => {
    if (proctoringIntervalRef.current) clearInterval(proctoringIntervalRef.current);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const captureAndSendFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      canvas.width = 300; // Smaller size for performance
      canvas.height = 225;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Frame = canvas.toDataURL("image/jpeg", 0.5); // Compressed
      
      socketService.emit("video_frame", base64Frame);
    }
  }, [testId, isCameraActive]);

  const handleOptionSelect = (questionId: string, optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
    if (attemptId && test) {
      const questionIndex = test.questions.findIndex((q) => q._id === questionId);
      if (questionIndex >= 0) {
        saveAnswer(attemptId, "mcq", questionIndex, optionIdx, 0).catch((err) => {
          console.warn("Failed to save answer", err);
        });
      }
    }
  };

  const submitExam = async () => {
    setIsSubmitting(true);
    stopTimer();
    stopProctoring();
    
    try {
      if (attemptId) {
        await submitTest(attemptId);
      } else {
        // Mock success if API fails
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      socketService.emit("exam_end", { testId, timestamp: new Date() });
      setStatus("submitted");
    } catch (err) {
      alert("Failed to submit exam. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Preparing your assessment...</p>
      </div>
    );
  }

  if (!test) return <div>Test not found</div>;

  if (status === "instructions") {
    return (
      <div className="max-w-3xl mx-auto space-y-8 py-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{test.title}</h1>
          <p className="text-slate-500 mb-8">{test.description}</p>
          
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
              <Timer className="text-slate-400 mt-1" size={20} />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                <p className="text-lg font-bold text-slate-900">{test.duration} Minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
              <Info className="text-slate-400 mt-1" size={20} />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Questions</p>
                <p className="text-lg font-bold text-slate-900">{test.questions.length} MCQs</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="font-bold text-slate-900">Proctoring Rules:</h3>
            <ul className="space-y-3">
              {[
                "Webcam must remain active throughout the test.",
                "Ensure your face is clearly visible and well-lit.",
                "Do not look away from the screen for extended periods.",
                "Multiple faces or use of mobile phones will trigger alerts.",
                "Switching tabs or minimizing the window is prohibited."
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          <Button onClick={startExam} className="w-full py-4 text-lg gap-2">
            <Play size={20} />
            Start Assessment
          </Button>
        </div>
      </div>
    );
  }

  if (status === "submitted") {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-6">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="text-3xl font-bold text-slate-900">Assessment Submitted!</h1>
        <p className="text-slate-500">Your test has been successfully submitted for review. The recruiter will be notified of your performance and proctoring report.</p>
        <div className="pt-8">
          <Button onClick={() => navigate("/student/dashboard")} variant="outline">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIdx];

  return (
    <div className="grid lg:grid-cols-4 gap-8 py-4 h-[calc(100vh-120px)]">
      {/* Left Panel - Question Content */}
      <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex-1">
          <div className="flex items-center justify-between mb-8">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest">
              Question {currentQuestionIdx + 1} of {test.questions.length}
            </span>
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg",
              timeLeft < 300 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-slate-50 text-slate-900"
            )}>
              <Timer size={20} />
              {formatTime(timeLeft)}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-8 leading-tight">
            {currentQuestion.text}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(currentQuestion._id, idx)}
                className={cn(
                  "w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 group",
                  answers[currentQuestion._id] === idx
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                    : "border-slate-100 hover:border-slate-200 bg-white text-slate-600"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors",
                  answers[currentQuestion._id] === idx
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                )}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
          <Button
            variant="ghost"
            onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIdx === 0}
            className="gap-2"
          >
            <ChevronLeft size={18} />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {currentQuestionIdx === test.questions.length - 1 ? (
              <Button onClick={submitExam} isLoading={isSubmitting} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Send size={18} />
                Submit Assessment
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIdx(prev => Math.min(test.questions.length - 1, prev + 1))}
                className="gap-2"
              >
                Next Question
                <ChevronRight size={18} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Proctoring & Navigation */}
      <div className="space-y-6 flex flex-col">
        {/* Webcam Preview */}
        <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-video relative border-4 border-white shadow-xl">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover mirror"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute top-4 left-4 flex items-center gap-2 px-2 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase rounded-full animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            Live Proctoring
          </div>
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 gap-2">
              <Camera size={32} />
              <p className="text-xs font-medium">Camera Inactive</p>
            </div>
          )}
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-2"
            >
              {alerts.map((alert, i) => (
                <div key={i} className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-start gap-3 shadow-sm">
                  <AlertTriangle className="text-rose-500 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-xs font-bold text-rose-700 leading-tight">{alert}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Navigator */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">Question Navigator</h3>
          <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-64 pr-2">
            {test.questions.map((q, idx) => (
              <button
                key={q._id}
                onClick={() => setCurrentQuestionIdx(idx)}
                className={cn(
                  "h-10 rounded-xl text-xs font-bold transition-all border-2",
                  currentQuestionIdx === idx
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200"
                    : answers[q._id] !== undefined
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                    : "bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200"
                )}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          
          <div className="mt-auto pt-6 border-t border-slate-50 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Progress</span>
              <span>{Math.round((Object.keys(answers).length / test.questions.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${(Object.keys(answers).length / test.questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineTest;
