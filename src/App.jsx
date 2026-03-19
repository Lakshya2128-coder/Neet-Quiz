import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ================= SETTINGS =================
const QUESTION_TIME = 20;
const ADMIN_PASSWORD = "neetadmin";

// ================= TYPES =================
type Question = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

type Leaderboard = {
  name: string;
  score: number;
};

type Analytics = {
  [key: string]: {
    attempts: number;
    wrong: number;
  };
};

// ================= DEFAULT QUESTIONS =================
const defaultQuestions: Question[] = [
  {
    question: "Which kingdom includes unicellular prokaryotes?",
    options: ["Protista", "Monera", "Fungi", "Plantae"],
    answer: "Monera",
    explanation: "Monera contains unicellular prokaryotic organisms like bacteria.",
  },
];

export default function NeetQuiz() {
  const [mode, setMode] = useState("home");
  const [name, setName] = useState("");
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [adminPass, setAdminPass] = useState("");
  const [analytics, setAnalytics] = useState<Analytics>({});

  // ================= LOAD =================
  useEffect(() => {
    const savedQ = localStorage.getItem("neet_questions");
    if (savedQ) setQuestions(JSON.parse(savedQ));

    const savedLB = localStorage.getItem("neet_leaderboard");
    if (savedLB) setLeaderboard(JSON.parse(savedLB));

    const savedAnalytics = localStorage.getItem("neet_analytics");
    if (savedAnalytics) setAnalytics(JSON.parse(savedAnalytics));

    const lastDate = localStorage.getItem("neet_date");
    const today = new Date().toDateString();

    if (lastDate !== today) {
      localStorage.setItem("neet_leaderboard", JSON.stringify([]));
      localStorage.setItem("neet_date", today);
      setLeaderboard([]);
    }
  }, []);

  // ================= TIMER =================
  useEffect(() => {
    if (mode !== "quiz") return;

    if (timeLeft === 0) {
      nextQuestion();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, mode]);

  // ================= FLOW =================
  const startQuiz = () => {
    if (!name.trim()) return;
    setMode("quiz");
    setTimeLeft(QUESTION_TIME);
  };

  const selectAnswer = (opt: string) => {
    const newAns = [...answers];
    newAns[current] = opt;
    setAnswers(newAns);
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setTimeLeft(QUESTION_TIME);
    } else submitQuiz();
  };

  const submitQuiz = () => {
    let score = 0;
    const newAnalytics: Analytics = { ...analytics };

    questions.forEach((q, i) => {
      if (!newAnalytics[q.question]) {
        newAnalytics[q.question] = { attempts: 0, wrong: 0 };
      }

      newAnalytics[q.question].attempts++;

      if (answers[i] === q.answer) score++;
      else newAnalytics[q.question].wrong++;
    });

    setAnalytics(newAnalytics);
    localStorage.setItem("neet_analytics", JSON.stringify(newAnalytics));

    const updated = [...leaderboard, { name, score }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLeaderboard(updated);
    localStorage.setItem("neet_leaderboard", JSON.stringify(updated));

    setMode("result");
  };

  const getBadge = (score: number) => {
    const percent = (score / questions.length) * 100;
    if (percent === 100) return "🥇 NEET Topper";
    if (percent >= 70) return "🥈 Strong Performer";
    if (percent >= 40) return "🥉 Keep Practicing";
    return "📘 Beginner";
  };

  // ================= HOME =================
  if (mode === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white flex items-center justify-center p-4">
        <Card className="bg-black/70 backdrop-blur-lg border border-purple-500 w-full max-w-md text-center rounded-2xl">
          <CardContent className="p-6 flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-purple-400">
              🎃 NEET Daily Quiz
            </h1>

            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black/50 border-purple-500 text-white"
            />

            <Button onClick={startQuiz} className="bg-purple-600 hover:bg-purple-700">
              ENTER
            </Button>

            <Button
              variant="outline"
              onClick={() => setMode("adminLogin")}
              className="border-purple-500 text-purple-300 mt-2"
            >
              Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ================= QUIZ =================
  if (mode === "quiz") {
    const q = questions[current];

    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white flex items-center justify-center p-3">
        <Card className="w-full max-w-xl bg-black/70 backdrop-blur-lg border border-purple-500 rounded-2xl">
          <CardContent className="p-5 space-y-5">

            <div className="flex justify-between text-purple-300 text-sm">
              <p>Q {current + 1}/{questions.length}</p>
              <p>⏱ {timeLeft}s</p>
            </div>

            <h2 className="text-lg md:text-xl font-bold text-white bg-purple-900/40 p-3 rounded-lg">
              {q.question}
            </h2>

            {q.options.map((opt, i) => (
              <Button
                key={i}
                onClick={() => selectAnswer(opt)}
                className={`w-full text-white ${
                  answers[current] === opt
                    ? "bg-purple-600"
                    : "border border-purple-500 hover:bg-purple-800"
                }`}
              >
                {opt}
              </Button>
            ))}

            <Button onClick={nextQuestion} className="w-full bg-purple-600 hover:bg-purple-700">
              Next
            </Button>

          </CardContent>
        </Card>
      </div>
    );
  }

  // ================= RESULT (🔥 LEADERBOARD FIXED) =================
  if (mode === "result") {
    const score = answers.filter((a, i) => a === questions[i].answer).length;
    const badge = getBadge(score);

    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white flex items-center justify-center p-4">
        
        <Card className="w-full max-w-xl bg-black/70 backdrop-blur-lg border border-purple-500 rounded-2xl shadow-xl">
          
          <CardContent className="p-6 space-y-5">

            <h2 className="text-xl font-bold text-center">
              {name}, Score: {score}/{questions.length}
            </h2>

            <h3 className="text-purple-400 text-center font-semibold">
              {badge}
            </h3>

            <h3 className="text-lg font-bold text-purple-300 border-b border-purple-500 pb-2">
              🏆 Leaderboard
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {leaderboard.map((u, i) => (
                <div
                  key={i}
                  className={`flex justify-between p-3 rounded-lg text-white ${
                    i === 0
                      ? "bg-yellow-500/20 border border-yellow-400"
                      : i === 1
                      ? "bg-gray-400/20 border border-gray-300"
                      : i === 2
                      ? "bg-orange-500/20 border border-orange-400"
                      : "bg-purple-900/40 border border-purple-700"
                  }`}
                >
                  <span>#{i + 1} {u.name}</span>
                  <span className="font-bold">{u.score}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Play Again
            </Button>

          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
