@/components → ./components
import React, { useState, useEffect } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
const QUESTION_TIME = 20;

export default function NeetQuiz() {
  const [mode, setMode] = useState("home");
  const [name, setName] = useState("");
  const [questions] = useState([
    {
      question: "Which kingdom includes unicellular prokaryotes?",
      options: ["Protista", "Monera", "Fungi", "Plantae"],
      answer: "Monera",
    },
  ]);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (mode !== "quiz") return;
    if (timeLeft === 0) {
      nextQuestion();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, mode]);

  const startQuiz = () => {
    if (!name) return;
    setMode("quiz");
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
    } else {
      setShowResult(true);
      setMode("result");
    }
  };

  const score = answers.filter((a, i) => a === questions[i]?.answer).length;

  if (mode === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center p-4 text-white">
        <Card className="p-6 space-y-4 bg-black/70 border border-purple-500 rounded-2xl w-full max-w-md text-center">
          <h1 className="text-3xl text-purple-400 font-bold">🔥 NEET PRO QUIZ</h1>
          <Input
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black/50 border-purple-500"
          />
          <Button className="bg-purple-600" onClick={startQuiz}>Start</Button>
        </Card>
      </div>
    );
  }

  if (mode === "quiz") {
    const q = questions[current];

    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center p-3 text-white">
        <Card className="w-full max-w-xl bg-black/70 border border-purple-500 rounded-2xl">
          <CardContent className="p-5 space-y-5">

            <div className="flex justify-between text-purple-300">
              <p>Q {current + 1}</p>
              <p className="animate-pulse">⏱ {timeLeft}s</p>
            </div>

            <h2 className="text-lg font-bold bg-purple-900/40 p-3 rounded">
              {q.question}
            </h2>

            {q.options.map((opt, i) => {
              const isSelected = answers[current] === opt;
              const isCorrect = q.answer === opt;

              return (
                <Button
                  key={i}
                  onClick={() => selectAnswer(opt)}
                  className={`w-full text-white transition-all duration-300
                    ${
                      showResult
                        ? isCorrect
                          ? "bg-green-600"
                          : isSelected
                          ? "bg-red-600"
                          : "border border-purple-500"
                        : isSelected
                        ? "bg-purple-600"
                        : "border border-purple-500 hover:bg-purple-800"
                    }`}
                >
                  {opt}
                </Button>
              );
            })}

            <Button className="w-full bg-purple-600" onClick={nextQuestion}>
              Next
            </Button>

          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "result") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900 to-black text-white">
        <Card className="p-6 bg-black/70 border border-purple-500 rounded-2xl text-center space-y-4">
          <h2 className="text-xl font-bold">{name}, Score: {score}</h2>
          <p className="text-purple-400">🔥 Keep Grinding</p>
          <Button onClick={() => window.location.reload()}>Restart</Button>
        </Card>
      </div>
    );
  }

  return null;
}
