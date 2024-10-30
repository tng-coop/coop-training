let currentSection = 0; // Start from 0, to represent the start screen
let score = 0;
let startTime;
let answerSubmitted = false;

function startQuiz() {
  startTime = new Date().getTime();
  document.getElementById("startButton").style.display = "none";
  showSection(1); // Go to the first question
}

function checkAnswer(questionNumber, correctAnswer) {
  const selectedAnswer = document.querySelector(
    `input[name="answer${questionNumber}"]:checked`
  );
  const result = document.getElementById(`result${questionNumber}`);
  if (selectedAnswer) {
    if (selectedAnswer.value === correctAnswer) {
      result.textContent = "Correct!";
      result.className = "result-correct";
      score++;
      document.getElementById(`next${questionNumber}`).style.display = "inline";
      answerSubmitted = true; // Correct answer, now we can proceed to the next question
    } else {
      result.textContent = "Not quite! Please try again.";
      result.className = "result-incorrect";
      answerSubmitted = false; // Incorrect answer, we need to keep trying
    }
  } else {
    alert("Please select an answer!");
  }
}

function showSection(sectionNumber) {
  if (currentSection > 0) {
    document.getElementById(`section${currentSection}`).style.display = "none";
  }
  currentSection = sectionNumber;
  document.getElementById(`section${sectionNumber}`).style.display = "block";
  answerSubmitted = false;
}

function showFinalResult() {
  const endTime = new Date().getTime();
  const timeTaken = Math.round((endTime - startTime) / 1000);

  const quizHistory = JSON.parse(localStorage.getItem("quizHistory")) || [];
  const attempt = {
    score: score,
    timeTaken: timeTaken,
    date: new Date().toLocaleString(),
  };
  quizHistory.push(attempt);
  localStorage.setItem("quizHistory", JSON.stringify(quizHistory));

  document.getElementById("chartContainer").style.display = "block";
  document.getElementById("result-summary").style.display = "block";
  document.getElementById(
    "final-score"
  ).textContent = `You scored ${score} out of 3!`;
  document.getElementById(
    "time-taken"
  ).textContent = `Time taken: ${timeTaken} seconds`;

  displayChart();
  displayHistory();
}

function displayHistory() {
  const quizHistory = JSON.parse(localStorage.getItem("quizHistory")) || [];
  const historyDiv = document.getElementById("history");

  historyDiv.innerHTML = "<h3>Quiz History</h3>";
  quizHistory.forEach((attempt, index) => {
    const attemptInfo = `
                    <p>
                        Attempt ${index + 1}:<br>
                        Score: ${attempt.score} / 3<br>
                        Time Taken: ${attempt.timeTaken} seconds<br>
                        Date: ${attempt.date}
                    </p>
                `;
    historyDiv.innerHTML += attemptInfo;
  });
}

function displayChart() {
  const quizHistory = JSON.parse(localStorage.getItem("quizHistory")) || [];
  const scores = quizHistory.map((attempt) => attempt.score);
  const times = quizHistory.map((attempt) => attempt.timeTaken);
  const labels = quizHistory.map((_, index) => `Attempt ${index + 1}`);

  const ctx = document.getElementById("quizChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Score",
          data: scores,
          backgroundColor: "rgba(166, 38, 57, 0.6)",
          borderColor: "rgba(166, 38, 57, 1)",
          borderWidth: 1,
        },
        {
          label: "Time Taken (seconds)",
          data: times,
          backgroundColor: "rgba(110, 11, 20, 0.6)",
          borderColor: "rgba(110, 11, 20, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function switchLanguage(lang) {
  alert(`Switching to ${lang === "en" ? "English" : "Japanese"}...`);
  // Add your language switch logic here.
}

// Event listener to handle both the Enter key and numeric keys
document.addEventListener("keydown", function (event) {
  const key = event.key;

  // Handle number key presses (1, 2, 3, 4)
  if (key >= "1" && key <= "4") {
    const index = key - 1;
    const radios = document.querySelectorAll(
      `#section${currentSection} input[type="radio"]`
    );
    if (radios[index]) {
      radios[index].checked = true;
    }
  }
  // Handle Enter key press
  else if (key === "Enter") {
    // Start the quiz from the start screen
    if (currentSection === 0) {
      startQuiz();
    }
    // If we're in a quiz section and haven't submitted an answer or need to re-submit
    else if (!answerSubmitted) {
      const submitButton = document.querySelector(
        `#section${currentSection} button[type="button"]`
      );
      if (submitButton) {
        submitButton.click();
      }
    }
    // If an answer has been submitted and it is correct, move to next section
    else if (answerSubmitted) {
      const nextButton = document.getElementById(`next${currentSection}`);
      if (nextButton && nextButton.style.display === "inline") {
        nextButton.click();
      }
      // If we're on the last section, show final results
      else if (currentSection === 3) {
        showFinalResult();
      }
    }
  }
});
