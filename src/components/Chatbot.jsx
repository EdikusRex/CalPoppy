    /** @jsxImportSource @emotion/react */
import { useEffect, useState } from "react";
import ChatComposer from "./ChatComposer";
import ChatWindow from "./ChatWindow";
import HeaderNav from "./HeaderNav";
import axios from "axios";
import "../style/chatbot.css";

const SENDER_USER = "user";
const SENDER_BOT = "bot";

export default function Chatbot(props) {
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [conversation, setConversation] = useState([]);
    const [responseCount, setResponseCount] = useState(0); // AI mocking

    /**
     * Toggles the suggestions
     */
    let onSuggestionClick = () => {
        setSuggestionsOpen((s) => !s);
    };

    /**
     * Every time the user sends a new question, get the answer from the API and
     * add it to the conversation.
     */
    useEffect(() => {
        if (query === "") return;
        // let payload = { message: query };

        /* --------------------------------------------------------*/
        /* AI mock */
        function mockResponse() {
            let resp = "Placeholder response " + responseCount;
            setResponseCount(responseCount + 1);
            return [{ text: resp }];
        }
        /* --------------------------------------------------------*/

        async function postMessage() {
            try {
                // const response = await axios.post("api/webhooks/rest/webhook", payload);
                // const answerMessages = response.data.map(({ text }, i) => ({
                const answerMessages = mockResponse().map(({ text }, i) => ({
                    text,
                    sender: SENDER_BOT,
                    timestamp: Date.now() + i,
                    responseType: i === 0 ? "answer" : "followUp",
                }));
                setQuery("");
                setConversation([...conversation, ...answerMessages]);
            } catch (err) {
                console.error(err);
                return;
            }
        }

        postMessage();
    }, [query, conversation, responseCount]); //The useEffect is run if any of these values change

    /**
     * Adds the user's message to the conversation, passes message to the bot
     */
    let sendMessage = (message) => {
        setConversation([
            ...conversation,
            { text: message, sender: SENDER_USER, timestamp: Date.now() },
        ]);
        setQuery(message);
    };
    /**
     * Handles user feedback about chatbot answer accuracy.
     */
    function onFeedbackGiven(id, isPositive) {
        // We're gonna need a real endpoint, but for testing purposes:
        let answerIndex = conversation.findIndex(
            (message) => message.timestamp === id
        );
        if (answerIndex === -1) return;
        const payload = {
            sentiment: isPositive ? "positive" : "negative",
            question: conversation[answerIndex - 1].text,
            answer: conversation[answerIndex].text,
        };
        axios.post("log/query", payload);
    }


    return (
        <main className="Chatbot chatbotStyle">
            <HeaderNav
                onSuggestionClick={onSuggestionClick}
                suggestionsOpen={suggestionsOpen}
            />
            <ChatWindow
                conversation={conversation}
                suggestionsOpen={suggestionsOpen}
                onSend={sendMessage}
                onSuggestionClick={onSuggestionClick}
                onFeedbackGiven={onFeedbackGiven}
            />
            {!suggestionsOpen && <ChatComposer onSend={sendMessage} />}
        </main>
    );
}
