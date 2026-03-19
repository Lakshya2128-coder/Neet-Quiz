import React, { useState, useEffect } from "react";

// ================= SETTINGS =================
const QUESTION_TIME = 20;

// ================= QUESTIONS =================
const defaultQuestions = [
  {
    question: "Which kingdom includes unicellular prokaryotes?",
    options: ["Protista", "Monera", "Fungi", "Plantae"],
    answer: "Monera",
  },
];

export default function App() {
  const [mode, setMode] = useState("home");
  const [name, setName] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);

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

  // ================= FUNCTIONS =================
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
    if (current < defaultQuestions.length - 1) {
      setCurrent(current + 1);
      setTimeLeft(QUESTION_TIME);
    } else {
      setMode("result");
    }
  };

  const score = answers.filter(
    (a, i) => a === defaultQuestions[i].answer
  ).length;

  // ================= UI =================

  // HOME
  if (mode === "home") {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>🔥 NEET Quiz</h1>

        <input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <button onClick={startQuiz} style={styles.button}>
          Start Quiz
        </button>
      </div>
    );
  }

  // QUIZ
  if (mode === "quiz") {
    const q = defaultQuestions[current];

    return (
      <div style={styles.container}>
        <p>⏱ {timeLeft}s</p>

        <h2 style={styles.question}>{q.question}</h2>

        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => selectAnswer(opt)}
            style={{
              ...styles.button,
              background:
                answers[current] === opt ? "#7c3aed" : "#333",
            }}
          >
            {opt}
          </button>
        ))}

        <button onClick={nextQuestion} style={styles.button}>
          Next
        </button>
      </div>
    );
  }

  // RESULT
  if (mode === "result") {
    return (
      <div style={styles.container}>
        <h2>
          {name}, Score: {score}/{defaultQuestions.length}
        </h2>

        <button
          onClick={() => window.location.reload()}
          style={styles.button}
        >
          Play Again
        </button>
      </div>
    );
  }

  return null;
}

// ================= STYLES =================
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(black, purple)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    padding: "20px",
  },
  title: {
    fontSize: "28px",
  },
  question: {
    fontSize: "20px",
    background: "rgba(128,0,128,0.3)",
    padding: "10px",
    borderRadius: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
  },
  button: {
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    color: "white",
  },
};
