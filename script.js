const cache = {};

const OPENAI_API_KEY = "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";
const OPENAI_API_ENDPOINT = "https://api.openai.com/v1/engines/text-davinci-003/completions";

const chatToggle = document.getElementById('chat-toggle');
const chatWidget = document.getElementById("chat-widget");
const chatContainer = document.getElementById("chat-container");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatSendButton = document.getElementById("chat-send");

let chatVisible = true;
let introMessageSent = false;

chatToggle.addEventListener('click', () => {
chatVisible = !chatVisible;
chatWidget.classList.toggle('visible', chatVisible);
chatToggle.innerText = chatVisible ? 'Close' : 'Open Chat';
});

chatInput.addEventListener('keydown', (event) => {
if (event.key === 'Enter') {
event.preventDefault();
const userInput = chatInput.value.trim();
if (userInput) {
addChatMessage("You", userInput);
sendChatMessage(userInput);
chatInput.value = "";
}
}
});

chatSendButton.addEventListener("click", () => {
const userInput = chatInput.value.trim();
if (userInput) {
addChatMessage("You", userInput);
sendChatMessage(userInput);
chatInput.value = "";
shouldSkipQuestion('are you using chatgpt api')
}
});

function addChatMessage(sender, message) {
const messageContainer = document.createElement("div");
messageContainer.classList.add("chat-message-container");
const messageHeader = document.createElement("div");
messageHeader.classList.add("chat-message-header");
messageHeader.textContent = sender + ":";
const messageBody = document.createElement("div");
messageBody.classList.add("chat-message-body");
messageBody.textContent = message;
messageContainer.appendChild(messageHeader);
messageContainer.appendChild(messageBody);
chatMessages.appendChild(messageContainer);
chatContainer.scrollTop = chatContainer.scrollHeight;
}

function sendChatMessage(message) {
  if (!introMessageSent) {
    addChatMessage("Medily", "Hello! I'm Chat Medily. I'm constantly improving and for that reason, from time to time I may not provide a very accurate answer! Please enter your message below.");
    introMessageSent = true;
  }
  
  const loadingElement = document.getElementById("loading");
  loadingElement.style.display = "block";
  if (shouldSkipQuestion(message)) {
    addChatMessage("Medily", "Sorry, can't understand you");
    loadingElement.style.display = "none";
    return;
  }
  fetch(OPENAI_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: `Q: ${message}\nA: `,
      max_tokens: 600,
      temperature: 0.6,
      stop: ["\n"],
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const chatbotResponse = data.choices[0].text.trim();
      addChatMessage("Medily", chatbotResponse);
      speakText(chatbotResponse);
      loadingElement.style.display = "none";
    })
    .catch((error) => {
      console.error(error);
      addChatMessage("Medily", "Sorry, I was unable to process your request.");
      loadingElement.style.display = "none";
    });
}

function shouldSkipQuestion(question) {
  // Define the conditions for skipping specific questions
  // Example: Skip questions that start with "Do not answer"
  return question.toLowerCase().startsWith("do you" , "are you");
} 

// function speakText(text) {
//   const speechSynthesis = window.speechSynthesis;
//   const speechText = new SpeechSynthesisUtterance(text);
//   speechSynthesis.speak(speechText);
// }
// Declare a variable to keep track of speech status
let speechEnabled = false;

// Function to enable speech
function enableSpeech() {
  speechEnabled = true;
  
  // Update the button styles based on speech status
  const enableButton = document.getElementById("enable-speech-button");
  const disableButton = document.getElementById("disable-speech-button");
  enableButton.style.backgroundColor = "green";
  disableButton.style.backgroundColor = "";
}

// Function to disable speech
function disableSpeech() {
  speechEnabled = false;
  
  // Update the button styles based on speech status
  const enableButton = document.getElementById("enable-speech-button");
  const disableButton = document.getElementById("disable-speech-button");
  enableButton.style.backgroundColor = "";
  disableButton.style.backgroundColor = "red";
}

// Event listeners for the speech toggle buttons
const enableButton = document.getElementById("enable-speech-button");
const disableButton = document.getElementById("disable-speech-button");
enableButton.addEventListener("click", enableSpeech);
disableButton.addEventListener("click", disableSpeech);

// Function to speak the text
function speakText(text) {
  if (speechEnabled) {
    const speechSynthesis = window.speechSynthesis;
    const speechText = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(speechText);
  }
}
// Initialize the map
const map = L.map('map').setView([37.7749, -122.4194], 13);

// Create and add the tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

// Perform the nearby hospital search
L.Routing.control({
  router: L.Routing.osrmv1({
    serviceUrl: 'https://router.project-osrm.org/route/v1'
  }),
  waypoints: [
    L.latLng(37.7749, -122.4194) // Starting location
  ],
  routeWhileDragging: true,
  geocoder: L.Control.Geocoder.nominatim(),
  showAlternatives: false,
  altLineOptions: {
    styles: [{ color: 'black', opacity: 0.15, weight: 9 }, { color: 'white', opacity: 0.8, weight: 6 }, { color: 'blue', opacity: 0.5, weight: 2 }]
  },
  createMarker: function (i, waypoint, n) {
    if (i === 0) {
      return L.marker(waypoint.latLng, { draggable: true });
    }
  },
  routeWhileDragging: true
}).addTo(map);
