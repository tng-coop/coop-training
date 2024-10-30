// Language data for alerts and dynamic messages
const messages = {
    en: {
      storageCleared: "LocalStorage cleared!",
      correct: "Correct!",
      incorrect: "Not quite! Please try again.",
      selectAnswer: "Please select an answer!",
      finalScore: "You scored {score} out of 3!",
      timeTaken: "Time taken: {time} seconds",
      quizHistoryTitle: "Quiz History",
      attempt: "Attempt {index}:",
      score: "Score: {score} / 3",
      timeTakenHistory: "Time Taken: {time} seconds",
      date: "Date: {date}",
    },
    jp: {
      storageCleared: "ローカルストレージがクリアされました！",
      correct: "正解です！",
      incorrect: "違います。もう一度試してください。",
      selectAnswer: "回答を選択してください！",
      finalScore: "スコア：{score} / 3",
      timeTaken: "所要時間：{time} 秒",
      quizHistoryTitle: "クイズ履歴",
      attempt: "試行 {index}:",
      score: "スコア：{score} / 3",
      timeTakenHistory: "所要時間：{time} 秒",
      date: "日付：{date}",
    },
};

// Retrieve language from localStorage or default to English
let currentLanguage = localStorage.getItem("quizLanguage") || "en";

// Helper function to get the correct localized message
function getMessage(key, replacements = {}) {
    let message = messages[currentLanguage][key];
    for (const [placeholder, value] of Object.entries(replacements)) {
        message = message.replace(`{${placeholder}}`, value);
    }
    return message;
}

// Clear LocalStorage function
function clearLocalStorage() {
    localStorage.clear();
    alert(getMessage("storageCleared"));
    location.reload(); // Reloads the page to reflect changes
}

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
            result.textContent = getMessage("correct");
            result.className = "result-correct";
            score++;
            document.getElementById(`next${questionNumber}`).style.display = "inline";
            answerSubmitted = true; // Correct answer, now we can proceed to the next question
        } else {
            result.textContent = getMessage("incorrect");
            result.className = "result-incorrect";
            answerSubmitted = false; // Incorrect answer, we need to keep trying
        }
    } else {
        alert(getMessage("selectAnswer"));
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
    ).textContent = getMessage("finalScore", { score: score });
    document.getElementById(
        "time-taken"
    ).textContent = getMessage("timeTaken", { time: timeTaken });

    displayChart();
    displayHistory();
}

function displayHistory() {
    const quizHistory = JSON.parse(localStorage.getItem("quizHistory")) || [];
    const historyDiv = document.getElementById("history");

    historyDiv.innerHTML = `<h3>${getMessage("quizHistoryTitle")}</h3>`;
    quizHistory.forEach((attempt, index) => {
        const attemptInfo = `
            <p>
                ${getMessage("attempt", { index: index + 1 })}<br>
                ${getMessage("score", { score: attempt.score })}<br>
                ${getMessage("timeTakenHistory", { time: attempt.timeTaken })}<br>
                ${getMessage("date", { date: attempt.date })}
            </p>`;
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
    currentLanguage = lang; // Update the language
    localStorage.setItem("quizLanguage", lang); // Store in localStorage

    document.querySelectorAll("[data-en]").forEach((el) => {
        const span = el.querySelector("span");
        if (span) {
            span.textContent = el.getAttribute(`data-${lang}`);
        } else {
            el.textContent = el.getAttribute(`data-${lang}`);
        }
    });
}

// Initialize language on page load
window.addEventListener("load", () => {
    switchLanguage(currentLanguage);
});

// Event listener to handle Enter, numeric keys, language switch, and restart (R key)
document.addEventListener("keydown", function (event) {
    const key = event.key;

    if (key >= "1" && key <= "4") {
        const index = key - 1;
        const radios = document.querySelectorAll(
            `#section${currentSection} input[type="radio"]`
        );
        if (radios[index]) {
            radios[index].checked = true;
        }
    } else if (key === "Enter") {
        if (currentSection === 0) {
            startQuiz();
        } else if (!answerSubmitted) {
            const submitButton = document.querySelector(
                `#section${currentSection} button[type="button"]`
            );
            if (submitButton) {
                submitButton.click();
            }
        } else if (answerSubmitted) {
            const nextButton = document.getElementById(`next${currentSection}`);
            if (nextButton && nextButton.style.display === "inline") {
                nextButton.click();
            } else if (currentSection === 3) {
                showFinalResult();
            }
        }
    } else if (key === "C" || key === "c") {
        clearLocalStorage(); // Switch to English
    } else if (key === "E" || key === "e") {
        switchLanguage("en"); // Switch to English
    } else if (key === "J" || key === "j") {
        switchLanguage("jp"); // Switch to Japanese
    } else if (key === "R" || key === "r") {
        location.reload(); // Reload the page
    }
});
