// Live Search Function
document.getElementById("searchBar").addEventListener("input", function() {
  let query = this.value.toLowerCase();
  let cards = document.querySelectorAll(".subject-card");
  cards.forEach(card => {
    let tags = card.getAttribute("data-tags").toLowerCase();
    card.style.display = tags.includes(query) ? "block" : "none";
  });
});

// Rocket AI Placeholder
document.getElementById("askAI").addEventListener("click", function() {
  let question = document.getElementById("aiQuestion").value.trim();
  let responseDiv = document.getElementById("aiResponse");

  if (!question) {
    responseDiv.innerHTML = "<p style='color:red'>Please type a question.</p>";
    return;
  }

  // Basic example AI responses (expand later)
  if (question.includes("study tips")) {
    responseDiv.innerHTML = "<p>📚 Tip: Break your study into 25-minute sessions with 5-minute breaks.</p>";
  } else if (question.includes("biology")) {
    responseDiv.innerHTML = "<p>🔬 Check out this video: <a href='https://youtu.be/URUJD5NEXC8' target='_blank'>Biology Basics</a></p>";
  } else {
    responseDiv.innerHTML = "<p>🤖 I'm still learning! Try asking about 'study tips' or a subject like 'biology'.</p>";
  }
});
