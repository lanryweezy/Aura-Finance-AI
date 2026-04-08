
import React, { useState, useRef, useEffect } from 'react';
import type { CategorizedTransaction, ChatMessage } from '../types';
import { Card } from './ui/Card';
import { GoogleGenAI, Chat } from "@google/genai";

interface AIChatProps {
  transactions: CategorizedTransaction[];
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const suggestedPrompts = [
    "What was my biggest expense?",
    "Summarize my income sources.",
    "Am I profitable this month?",
    "How much did I spend on software?",
];

export const AIChat: React.FC<AIChatProps> = ({ transactions }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatInstance = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const systemInstruction = `You are O-Heidi, a friendly and expert financial AI assistant for Nigerian small business owners. 
    Analyze the user's financial data to answer their questions. Be concise, helpful, and use Nigerian Naira (NGN) for currency.
    Here is the user's transaction data in JSON format: ${JSON.stringify(transactions)}`;

    if(process.env.API_KEY) {
        chatInstance.current = ai.chats.create({
            model: 'gemini-2.0-flash',
            config: { systemInstruction },
        });

        if (messages.length === 0) {
            setMessages([{
                id: 'init',
                role: 'model',
                text: "Hello! I'm O-Heidi, your AI financial assistant. How can I help you analyze your finances today?"
            }]);
        }
    } else {
        setMessages([{
            id: 'init',
            role: 'model',
            text: "AI Chat is disabled. Please provide an API Key."
        }])
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [messages]);


  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading || !chatInstance.current) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const modelMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);

    try {
      const stream = await chatInstance.current.sendMessageStream({ message: textToSend });

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setMessages(prev => prev.map(msg => 
            msg.id === modelMessageId ? { ...msg, text: msg.text + chunkText } : msg
        ));
      }

    } catch (error) {
      console.error("AI Chat Error:", error);
       setMessages(prev => prev.map(msg => 
            msg.id === modelMessageId ? { ...msg, text: "Sorry, I encountered an error. Please try again." } : msg
        ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-4">Chat with O-Heidi AI</h2>
      <div className="flex-grow overflow-y-auto p-4 space-y-6 bg-dark-secondary rounded-lg">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-brand-pink flex-shrink-0 flex items-center justify-center font-bold text-black">
                AI
              </div>
            )}
            <div className={`max-w-xl p-4 rounded-2xl ${msg.role === 'user' ? 'bg-brand-purple text-white rounded-br-none' : 'bg-dark-tertiary text-gray-200 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.text}{isLoading && msg.id === messages[messages.length-1].id && <span className="animate-pulse">▍</span>}</p>
            </div>
             {msg.role === 'user' && (
              <img src="https://picsum.photos/seed/user1/40/40" alt="User" className="w-10 h-10 rounded-full flex-shrink-0" />
            )}
          </div>
        ))}
         <div ref={messagesEndRef} />
      </div>

       <div className="pt-4 mt-4 border-t border-gray-700/50">
        {!isLoading && messages.length <= 2 && (
            <div className="flex flex-wrap gap-2 mb-3">
                {suggestedPrompts.map(prompt => (
                    <button 
                        key={prompt} 
                        onClick={() => handleSend(prompt)}
                        className="px-3 py-1.5 bg-dark-tertiary border border-gray-700 rounded-full text-sm text-gray-300 hover:bg-dark-primary hover:border-brand-cyan"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        )}
        <div className="flex items-center gap-4">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your finances..."
            className="w-full bg-dark-tertiary border-2 border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all"
            disabled={isLoading || !chatInstance.current}
            />
            <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim() || !chatInstance.current}
            className="bg-brand-cyan text-black font-bold p-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-brand-cyan/80 transition-colors"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
        </div>
      </div>
    </Card>
  );
};
