import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ================= SETTINGS =================
const QUESTION_TIME = 20; // change timer here
const ADMIN_PASSWORD = "neetadmin"; // change admin password

// ================= DEFAULT QUESTIONS =================
const defaultQuestions = [
  {
    question: "Which kingdom includes unicellular prokaryotes?",
    options: ["Protista", "Monera", "Fungi", "Plantae"],
    answer: "Monera",
    explanation: "Monera contains unicellular prokaryotic organisms like bacteria."
  }
];

export default function NeetQuiz() {
  const [mode, setMode] = useState("home");
  const [name, setName] = useState("");
  const [questions, setQuestions] = useState(defaultQuestions);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [leaderboard, setLeaderboard] = useState([]);
  const [adminPass, setAdminPass] = useState("");
  const [analytics, setAnalytics] = useState({});

  // ================= LOAD DATA =================
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

  // ================= QUIZ FLOW =================
  const startQuiz = () => {
    if (!name.trim()) return;
    setMode("quiz");
    setTimeLeft(QUESTION_TIME);
  };

  const selectAnswer = (opt) => {
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
    const newAnalytics = { ...analytics };

    questions.forEach((q, i) => {
      if (!newAnalytics[q.question])
        newAnalytics[q.question] = { attempts: 0, wrong: 0 };

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

  // ================= BADGE SYSTEM =================
  const getBadge = (score) => {
    const percent = (score / questions.length) * 100;
    if (percent === 100) return "🥇 NEET Topper";
    if (percent >= 70) return "🥈 Strong Performer";
    if (percent >= 40) return "🥉 Keep Practicing";
    return "📘 Beginner";
  };

  // ================= ADMIN FUNCTIONS =================
  const addQuestion = () => {
    const updated = [
      ...questions,
      {
        question: "New Question",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        answer: "Option 1",
        explanation: "Explanation"
      }
    ];
    setQuestions(updated);
    localStorage.setItem("neet_questions", JSON.stringify(updated));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
    localStorage.setItem("neet_questions", JSON.stringify(updated));
  };

  const updateOption = (qi, oi, value) => {
    const updated = [...questions];
    updated[qi].options[oi] = value;
    setQuestions(updated);
    localStorage.setItem("neet_questions", JSON.stringify(updated));
  };

  // ================= UI =================
  if (mode === "home") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <Card className="bg-black/80 border-purple-600 w-full max-w-md text-center">
          <CardContent className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">🎃 NEET Daily Quiz</h1>
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button onClick={startQuiz}>ENTER</Button>
            <Button variant="outline" onClick={() => setMode("adminLogin")}>Admin Panel</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "quiz") {
    const q = questions[current];
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-xl bg-black/80 border-purple-600">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between">
              <p>Q {current + 1}/{questions.length}</p>
              <p>⏱ {timeLeft}s</p>
            </div>
            <h2>{q.question}</h2>
            {q.options.map((opt, i) => (
              <Button
                key={i}
                variant={answers[current] === opt ? "default" : "outline"}
                onClick={() => selectAnswer(opt)}
                className="w-full"
              >
                {opt}
              </Button>
            ))}
            <Button onClick={nextQuestion}>Next</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "result") {
    const score = answers.filter((a, i) => a === questions[i].answer).length;
    const badge = getBadge(score);

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-xl bg-black/80 border-purple-600">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold">{name}, Score: {score}/{questions.length}</h2>
            <h3 className="text-purple-400">{badge}</h3>

            <h3 className="text-lg mt-4">🏆 Leaderboard</h3>
            {leaderboard.map((u, i) => (
              <div key={i} className="flex justify-between bg-purple-900/40 p-2 rounded">
                <span>#{i + 1} {u.name}</span>
                <span>{u.score}</span>
              </div>
            ))}

            <Button onClick={() => window.location.reload()}>Play Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "adminLogin") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="p-6 space-y-4 bg-black/80 border-purple-600">
          <h2>Admin Login</h2>
          <Input
            placeholder="Enter Password"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            type="password"
          />
          <Button onClick={() => adminPass === ADMIN_PASSWORD && setMode("admin")}>Login</Button>
        </Card>
      </div>
    );
  }
if (mode === "admin") {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <h1 className="text-2xl font-bold mb-4">⚙️ Admin Panel</h1>
        <Button onClick={addQuestion}>+ Add Question</Button>

        {questions.map((q, qi) => (
          <Card key={qi} className="my-4 bg-black/70 border-purple-600">
            <CardContent className="p-4 space-y-2">
              <Input value={q.question} onChange={(e) => updateQuestion(qi, "question", e.target.value)} />
              {q.options.map((opt, oi) => (
                <Input key={oi} value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} />
              ))}
              <Input value={q.answer} onChange={(e) => updateQuestion(qi, "answer", e.target.value)} />
              <Input value={q.explanation} onChange={(e) => updateQuestion(qi, "explanation", e.target.value)} />
            </CardContent>
          </Card>
        ))}

        <h2 className="text-xl mt-6">📊 Analytics</h2>
        {Object.entries(analytics).map(([q, data], i) => (
          <div key={i} className="bg-purple-900/40 p-3 my-2 rounded">
            <p>{q}</p>
            <p>Attempts: {data.attempts} | Wrong: {data.wrong}</p>
          </div>
        ))}

        <Button onClick={() => setMode("home")}>Back</Button>
      </div>
    );
  }
}
