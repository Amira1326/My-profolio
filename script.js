document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const SELECTORS = {
        CHATBOT_TOGGLER: '.chatbot-toggler',
        CHATBOT: '.chatbot',
        CLOSE_BUTTON: '.chatbot header span',
        CHATBOX: '.chatbox',
        MESSAGE_CONTENT: '.message-content',
        QUICK_REPLIES: '.quick-replies',
        QUICK_REPLY_BUTTON: '.quick-reply-btn',
        TYPING_DOTS: '.typing-dots',
        BOT_ICON: '.material-symbols-rounded',
    };

    const CLASSES = {
        SHOW_CHATBOT: 'show-chatbot',
        CHAT: 'chat',
        OUTGOING: 'outgoing',
        INCOMING: 'incoming',
        TYPING: 'typing',
    };

    const TYPING_DELAY_MS = 700; // Milliseconds to simulate bot typing

    // --- Select DOM Elements ---
    const chatbotToggler = document.querySelector(SELECTORS.CHATBOT_TOGGLER);
    const chatbot = document.querySelector(SELECTORS.CHATBOT);
    const closeBtn = document.querySelector(SELECTORS.CLOSE_BUTTON);
    const chatbox = document.querySelector(SELECTORS.CHATBOX);
    const body = document.body;

    // --- Knowledge Base ---
    // Key-value pairs where key is lowercased question, value is an object with answer and buttons.
    const knowledgeBase = {
        "initial": {
            answer: "Hello! How can I assist you today?", // Changed question to answer for consistency
            buttons: [
                "Who is Amira?",
                "Amira's Skills",
                "Amira's Services",
                "Contact Amira"
            ]
        },
        "who is amira?": {
            answer: "Amira is a passionate and skilled professional with expertise in various fields. She is dedicated to creating impactful digital experiences.",
            buttons: [
                "Amira's Skills",
                "Amira's Services",
                "Educational Background",
                "Go Back to Main Menu"
            ]
        },
        "amira's skills": {
            answer: "Amira's skills include UI/UX Design, Data Analysis, Web Design, Frontend Development, and Software Engineering. She is proficient in various tools and technologies related to these areas.",
            buttons: [
                "Who is Amira?",
                "Amira's Services",
                "Contact Amira",
                "Go Back to Main Menu"
            ]
        },
        "amira's services": {
            answer: "Amira offers services such as Responsive Web Development, Intuitive UI/UX Design, Data-Driven Solutions, and Innovative Web Solutions.",
            buttons: [
                "Amira's Skills",
                "Educational Background",
                "Contact Amira",
                "Go Back to Main Menu"
            ]
        },
        "educational background": {
            answer: "Amira has a strong educational background with a Bachelor's degree in Information Systems, completing courses like Database Design and Web Development. She also holds an Advanced Diploma in UI/UX Design.",
            buttons: [
                "Who is Amira?",
                "Amira's Skills",
                "Amira's Services",
                "Go Back to Main Menu"
            ]
        },
        "contact amira": {
            answer: "You can reach Amira through the contact form on this website, or connect with her on her social media channels listed in the footer.",
            buttons: [
                "Who is Amira?",
                "Amira's Skills",
                "Amira's Services",
                "Go Back to Main Menu"
            ]
        },
        "go back to main menu": {
            answer: "What else would you like to know?",
            buttons: [
                "Who is Amira?",
                "Amira's Skills",
                "Amira's Services",
                "Contact Amira"
            ]
        },
    };

    // --- Utility Functions for DOM Manipulation ---

    /**
     * Creates a chat list item (<li>) element with specified message, class, and optional buttons.
     * @param {string} message - The text content of the chat message.
     * @param {string} className - Class for the chat item (e.g., "outgoing", "incoming").
     * @param {boolean} isBotTyping - If true, displays typing animation.
     * @param {string[]} [buttons] - Optional array of button texts to display within the message.
     * @returns {HTMLLIElement} The created <li> element.
     */
    const createChatLi = (message, className, isBotTyping = false, buttons = []) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add(CLASSES.CHAT, className);

        if (className === CLASSES.OUTGOING) {
            chatLi.innerHTML = `<p>${message}</p>`;
        } else {
            const messageContentDiv = document.createElement('div');
            messageContentDiv.classList.add(SELECTORS.MESSAGE_CONTENT.substring(1)); // Remove dot for class name

            const botIcon = document.createElement('span');
            botIcon.classList.add(SELECTORS.BOT_ICON.substring(1)); // Remove dot for class name
            botIcon.textContent = 'smart_toy';

            const messageParagraph = document.createElement('p');

            if (isBotTyping) {
                chatLi.classList.add(CLASSES.TYPING);
                messageParagraph.classList.add(SELECTORS.TYPING_DOTS.substring(1)); // Remove dot
                messageParagraph.innerHTML = '<span>.</span><span>.</span><span>.</span>';
            } else {
                messageParagraph.textContent = message;
            }

            messageContentDiv.appendChild(messageParagraph);

            if (buttons.length > 0) {
                const quickRepliesDiv = document.createElement("div");
                quickRepliesDiv.classList.add(SELECTORS.QUICK_REPLIES.substring(1)); // Remove dot

                buttons.forEach(buttonText => {
                    const btn = document.createElement("button");
                    btn.classList.add(SELECTORS.QUICK_REPLY_BUTTON.substring(1)); // Remove dot
                    btn.textContent = buttonText;
                    // Use a more robust way to pass context if 'this' was an issue, but direct passing is fine here
                    btn.addEventListener("click", () => handleQuickReply(buttonText));
                    quickRepliesDiv.appendChild(btn);
                });
                messageContentDiv.appendChild(quickRepliesDiv);
            }

            chatLi.appendChild(botIcon);
            chatLi.appendChild(messageContentDiv);
        }
        return chatLi;
    };

    /**
     * Appends a chat message to the chatbox and scrolls to the bottom smoothly.
     * @param {HTMLLIElement} chatLi - The chat list item to append.
     */
    const appendMessageAndScroll = (chatLi) => {
        chatbox.appendChild(chatLi);
        chatbox.scrollTo({
            top: chatbox.scrollHeight,
            behavior: 'smooth'
        });
    };

    /**
     * Removes the quick reply buttons from the last incoming message, if any.
     * This ensures only the most relevant buttons are displayed.
     */
    const removeOldQuickReplies = () => {
        // Find the last actual bot message (not a typing indicator)
        const lastActualBotMessage = Array.from(chatbox.children)
                                        .reverse()
                                        .find(li => li.classList.contains(CLASSES.INCOMING) && !li.classList.contains(CLASSES.TYPING));
        
        if (lastActualBotMessage) {
            const oldQuickReplies = lastActualBotMessage.querySelector(SELECTORS.QUICK_REPLIES);
            if (oldQuickReplies) {
                oldQuickReplies.remove();
            }
        }
    };

    // --- Chatbot Logic ---

    /**
     * Handles the click event of a quick reply button.
     * @param {string} questionText - The text of the clicked button.
     */
    const handleQuickReply = (questionText) => {
        // 1. Remove old quick reply buttons from the previous bot message
        removeOldQuickReplies();
        
        // 2. Display user's choice immediately
        appendMessageAndScroll(createChatLi(questionText, CLASSES.OUTGOING));

        const lowerCaseQuestion = questionText.toLowerCase();
        const responseData = knowledgeBase[lowerCaseQuestion];

        // 3. Display typing indicator while bot "thinks"
        const incomingTypingLi = createChatLi("Typing...", CLASSES.INCOMING, true);
        appendMessageAndScroll(incomingTypingLi);

        setTimeout(() => {
            let finalMessage = "";
            let finalButtons = [];

            if (responseData) {
                finalMessage = responseData.answer;
                // Determine which buttons to show next. Fallback to initial if none specified.
                finalButtons = (responseData.buttons && responseData.buttons.length > 0) 
                                ? responseData.buttons 
                                : knowledgeBase["initial"].buttons;
            } else {
                // Fallback for an unexpected state (should not happen with button-driven system)
                finalMessage = "I apologize, I didn't understand that. Please choose from the options.";
                finalButtons = knowledgeBase["initial"].buttons;
            }

            // Create the final bot message LI with answer and buttons
            const finalBotMessageLi = createChatLi(finalMessage, CLASSES.INCOMING, false, finalButtons);
            
            // Replace the typing indicator with the final bot message
            chatbox.replaceChild(finalBotMessageLi, incomingTypingLi);
            
            // Ensure scroll after bot response has fully rendered
            appendMessageAndScroll(finalBotMessageLi); 
        }, TYPING_DELAY_MS);
    };

    /**
     * Initializes the chatbot display when opened.
     */
    const initializeChatbotDisplay = () => {
        chatbox.innerHTML = ''; // Clear previous conversations
        
        // Display initial bot message with its associated buttons
        const initialBotMessage = createChatLi(
            knowledgeBase["initial"].answer, // Use .answer here as it's the bot's message
            CLASSES.INCOMING, 
            false, 
            knowledgeBase["initial"].buttons
        );
        appendMessageAndScroll(initialBotMessage);
    };

    // --- Event Listeners ---

    if (chatbotToggler) {
        chatbotToggler.addEventListener('click', () => {
            body.classList.toggle(CLASSES.SHOW_CHATBOT);
            if (body.classList.contains(CLASSES.SHOW_CHATBOT)) {
                initializeChatbotDisplay();
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            body.classList.remove(CLASSES.SHOW_CHATBOT);
        });
    }
});

// Contact form handling is now managed via Web3Forms in index.html
// No server-side code needed in script.js for static hosting

