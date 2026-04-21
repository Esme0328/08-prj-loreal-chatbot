/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Configure your Cloudflare Worker URL here
const CLOUDFLARE_WORKER_URL =
  "https://loreal-chatbot-worker.esmeralda-ojeda.workers.dev";

// Conversation state
let conversationHistory = [];
let userName = null;

// Clear initial text when user starts typing
let isInitialLoad = true;

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get user message
  const userMessage = userInput.value.trim();

  if (!userMessage) return;

  // Clear initial message on first interaction
  if (isInitialLoad) {
    chatWindow.textContent = "";
    isInitialLoad = false;
  }

  // Clear input field
  userInput.value = "";

  // Display user message in chat
  const userMsg = document.createElement("div");
  userMsg.className = "msg user";
  userMsg.textContent = userMessage;
  chatWindow.appendChild(userMsg);

  // Add to conversation history
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  // Scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Show loading message
  const loadingMsg = document.createElement("div");
  loadingMsg.className = "msg ai";
  loadingMsg.id = "loading-msg";
  loadingMsg.textContent = "Thinking...";
  chatWindow.appendChild(loadingMsg);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Prepare messages for API with conversation context
  const messagesForAPI = [
    {
      role: "system",
      content: `You are a helpful L'Oréal beauty and skincare product advisor. 
You help customers find the right products for their needs, answer questions about skincare routines, 
and provide personalized beauty recommendations. Be friendly, professional, and knowledgeable about L'Oréal products.
${userName ? `The customer's name is ${userName}.` : ""}
Remember the context of the conversation and refer back to previous questions and answers.`,
    },
    ...conversationHistory,
  ];

  // Send to Cloudflare Worker
  sendMessageToAPI(messagesForAPI);

  // Extract name from first message if not already set
  if (!userName) {
    const nameMatch = userMessage.match(
      /(?:i'm|i am|name is|call me)\s+(\w+)/i,
    );
    if (nameMatch) {
      userName = nameMatch[1];
    }
  }
});

/* Function to send messages to Cloudflare Worker */
async function sendMessageToAPI(messages) {
  try {
    // For now, use mock responses to avoid API costs
    const mockResponse = getMockResponse(messages);

    // Remove loading message
    const loadingElement = document.getElementById("loading-msg");
    if (loadingElement) {
      loadingElement.remove();
    }

    // Display mock AI response
    const aiMsg = document.createElement("div");
    aiMsg.className = "msg ai";
    aiMsg.textContent = mockResponse;
    chatWindow.appendChild(aiMsg);

    // Add to conversation history
    conversationHistory.push({
      role: "assistant",
      content: mockResponse,
    });

    // Scroll to bottom
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (error) {
    console.error("Error:", error);

    // Remove loading message
    const loadingElement = document.getElementById("loading-msg");
    if (loadingElement) {
      loadingElement.remove();
    }

    // Show error message
    const errorMsg = document.createElement("div");
    errorMsg.className = "msg ai";
    errorMsg.textContent =
      "Sorry, I encountered an error. Please check that your Cloudflare Worker URL is configured correctly.";
    chatWindow.appendChild(errorMsg);

    // Scroll to bottom
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

/* Mock response function for L'Oréal beauty advisor */
function getMockResponse(messages) {
  const lastUserMessage = messages[messages.length - 1].content.toLowerCase();

  // Extract user name if mentioned
  const nameMatch = lastUserMessage.match(
    /(?:i'm|i am|name is|call me)\s+(\w+)/i,
  );
  if (nameMatch && !userName) {
    userName = nameMatch[1];
  }

  // Mock responses based on keywords
  if (lastUserMessage.includes("hello") || lastUserMessage.includes("hi")) {
    return `Hello${userName ? `, ${userName}` : ""}! I'm your L'Oréal beauty advisor. I can help you find the perfect skincare products, makeup recommendations, or beauty routines. What are you looking for today?`;
  }

  if (
    lastUserMessage.includes("skincare") ||
    lastUserMessage.includes("skin")
  ) {
    return `Great question about skincare${userName ? `, ${userName}` : ""}! For healthy, glowing skin, I recommend starting with L'Oréal's Revitalift Derm Intensives. It's our advanced anti-aging serum with 1.5% pure hyaluronic acid. Would you like recommendations for your specific skin type or concerns?`;
  }

  if (
    lastUserMessage.includes("makeup") ||
    lastUserMessage.includes("foundation")
  ) {
    return `For makeup recommendations${userName ? `, ${userName}` : ""}, L'Oréal's Infallible Pro-Matte foundation is perfect for all-day wear with a natural finish. It comes in 40 shades and is transfer-proof. What type of look are you going for - natural, bold, or something in between?`;
  }

  if (lastUserMessage.includes("hair") || lastUserMessage.includes("shampoo")) {
    return `For beautiful hair${userName ? `, ${userName}` : ""}, try L'Oréal's Elvive Dream Lengths shampoo and conditioner. It helps repair and protect your hair while promoting healthy growth. Do you have specific hair concerns like dryness, damage, or color protection?`;
  }

  if (
    lastUserMessage.includes("routine") ||
    lastUserMessage.includes("daily")
  ) {
    return `A good daily skincare routine${userName ? `, ${userName}` : ""} should include: 1) Cleanse with L'Oréal's Pure Clay Cleanser, 2) Treat with Revitalift serum, 3) Moisturize with Age Perfect cream, and 4) Protect with SPF 30+ sunscreen. This routine takes just 5 minutes but delivers amazing results!`;
  }

  if (
    lastUserMessage.includes("recommend") ||
    lastUserMessage.includes("suggest")
  ) {
    return `Based on what you've told me${userName ? `, ${userName}` : ""}, I'd recommend L'Oréal's best-sellers: Revitalift for anti-aging, Infallible for makeup, and Elvive for hair care. Each product is dermatologist-tested and delivers professional salon results at home. Which category interests you most?`;
  }

  // Default response
  return `That's an interesting question${userName ? `, ${userName}` : ""}! As your L'Oréal beauty advisor, I'm here to help with skincare, makeup, hair care, and beauty routines. L'Oréal has products for every need and skin type. What specific beauty concerns can I help you with today?`;
}
