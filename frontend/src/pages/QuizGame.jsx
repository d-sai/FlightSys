import React, { useEffect, useState } from "react";
import "../styles/QuizGame.css";

const quizData = [
  {
    question: "What is the main purpose of the rudder on an aircraft?",
    options: ["To control pitch", "To control roll", "To control yaw", "To increase speed"],
    correctAnswer: "To control yaw"
  },
  {
    question: "Which instrument indicates the aircraft's altitude?",
    options: ["Altimeter", "Airspeed Indicator", "Attitude Indicator", "Vertical Speed Indicator"],
    correctAnswer: "Altimeter"
  },
  {
    question: "What does a stall in flight mean?",
    options: ["Engine failure", "Loss of lift", "High speed", "Excessive drag"],
    correctAnswer: "Loss of lift"
  },
  {
    question: "What is the standard pressure at sea level?",
    options: ["29.92 inHg", "1010 hPa", "30.50 inHg", "980 hPa"],
    correctAnswer: "29.92 inHg"
  },
  {
    question: "Which part of the plane provides lift?",
    options: ["Fuselage", "Tail", "Wings", "Engine"],
    correctAnswer: "Wings"
  },
  {
    question: "What happens when you pull the control yoke back?",
    options: ["Plane descends", "Plane rolls", "Plane climbs", "Plane turns left"],
    correctAnswer: "Plane climbs"
  },
  {
    question: "Which document must be onboard during every flight?",
    options: ["Insurance policy", "Flight logbook", "Pilot’s license", "Aircraft registration"],
    correctAnswer: "Aircraft registration"
  },
  {
    question: "What is the function of flaps during landing?",
    options: ["Increase lift and drag", "Decrease drag", "Increase speed", "Balance aircraft"],
    correctAnswer: "Increase lift and drag"
  },
  {
    question: "What is the name of the imaginary line from nose to tail of the aircraft?",
    options: ["Lateral axis", "Longitudinal axis", "Vertical axis", "Roll axis"],
    correctAnswer: "Longitudinal axis"
  },
  {
    question: "When flying into a headwind, what happens to your groundspeed?",
    options: ["Increases", "Decreases", "Remains the same", "Varies randomly"],
    correctAnswer: "Decreases"
  }
];

const QuizGame = () => {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [badge, setBadge] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const totalQuestions = quizData.length;

  useEffect(() => {
    if (timeLeft === 0) {
      handleNext(); // auto move to next
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = (option) => {
    const correct = quizData[qIndex].correctAnswer;
    if (option === correct) {
      setScore(score + 1);
    }
    handleNext();
  };

  const handleNext = () => {
    if (qIndex + 1 === totalQuestions) {
      setShowResult(true);
      assignBadge(score);
    } else {
      setQIndex(qIndex + 1);
      setTimeLeft(20);
    }
  };

  const assignBadge = (score) => {
    if (score >= 9) setBadge("🏅 Flight Ace");
    else if (score >= 6) setBadge("🎖️ Skilled Aviator");
    else setBadge("👨‍✈️ Rookie Pilot");
  };

  const resetGame = () => {
    setScore(0);
    setQIndex(0);
    setBadge("");
    setShowResult(false);
    setTimeLeft(20);
  };

  const xpPercent = Math.floor((score / totalQuestions) * 100);

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">✈️ Flight Training Quiz</h2>

      {!showResult ? (
        <>
          <div className="question-box">
            <div className="timer">⏱️ Time Left: {timeLeft}s</div>
            <h3>{quizData[qIndex].question}</h3>
            <div className="options">
              {quizData[qIndex].options.map((opt, idx) => (
                <button key={idx} className="option-btn" onClick={() => handleAnswer(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="progress-bar">
            {score!=0 && <div className="fill" style={{ width: `${xpPercent}%` }}>
              XP   : {score}/{totalQuestions}
            </div>}
          </div>
        </>
      ) : (
        <div className="result-box">
          <h3>Your Score: {score} / {totalQuestions}</h3>
          <p>🎉 Badge Unlocked: <strong>{badge}</strong></p>
          <button onClick={resetGame} className="restart-btn">Restart Quiz</button>
        </div>
      )}
    </div>
  );
};

export default QuizGame;
