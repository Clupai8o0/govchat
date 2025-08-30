"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Loader,
  Flower
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/contexts/chat-context';
import { chatAPI } from '@/lib/api';
import { ChatMessage, QueryResponse } from '@/lib/types';

// Import our custom components
import ChatHistory from './chat-history';
import { Textarea } from './animated-ai-chat';

export function GovChat() {
  const {
    messages,
    isLoading,
    settings,
    addMessage,
    setLoading,
  } = useChat();

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const question = inputValue.trim();
    setInputValue('');
    setLoading(true);

    try {
      const response: QueryResponse = await chatAPI.askQuestion(question, settings);
      
      const newMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        question,
        answer: response.answer,
        timestamp: Date.now(),
      };

      addMessage(newMessage);
      
      // Message sent successfully
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        question,
        answer: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: Date.now(),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
      // Re-focus input for better UX
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [inputValue, isLoading, settings, addMessage, setLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };



  return (
		<div className="min-h-screen text-white flex flex-col">
			{/* Background Effects */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/15 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
				<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
				<div className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/15 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
			</div>

			{/* Header */}
			<header className="relative z-10 border-b border-white/[0.05] bg-black/10 backdrop-blur-xl w-screen">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center">
								<Flower className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-lg sm:text-xl font-bold text-white">
									GovChat
								</h1>
								<p className="text-xs sm:text-sm text-white/60 hidden xs:block">
									AI Assistant with RAG, Citations & Audit
								</p>
							</div>
						</div>

						<div className="flex items-center gap-4">
							<div className="text-sm text-white/60">
								{messages.length} message{messages.length !== 1 ? "s" : ""}
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content - Full Width Chat */}
			<div className="flex-1 flex flex-col min-h-0 relative z-10 w-screen">
				{/* Chat History - Takes remaining space */}
				<div className="flex-1 min-h-0 relative">
					<ChatHistory
						messages={messages}
						isLoading={isLoading}
						className="absolute inset-0"
					/>
				</div>

				{/* Input Area - Sticky to bottom */}
				<div className="flex-shrink-0 border-t border-white/[0.05] bg-black/10 backdrop-blur-xl p-4 sm:p-6">
					<div className="max-w-4xl mx-auto space-y-4">
						{/* Input */}
						<div className="relative">
							<Textarea
								ref={inputRef}
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Ask a question about government datasets..."
								containerClassName="w-full"
								className={cn(
									"w-full px-4 py-3 pr-12",
									"resize-none",
									"bg-white/[0.02] border border-white/[0.1]",
									"text-white/90 text-sm",
									"focus:outline-none focus:border-violet-500/50",
									"placeholder:text-white/40",
									"min-h-[60px] max-h-[120px]"
								)}
								showRing={false}
							/>

							<motion.button
								onClick={handleSendMessage}
								disabled={!inputValue.trim() || isLoading}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className={cn(
									"absolute right-2 top-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
									inputValue.trim() && !isLoading
										? "bg-violet-500 text-white hover:bg-violet-600"
										: "bg-white/[0.05] text-white/40"
								)}
							>
								{isLoading ? (
									<Loader className="w-4 h-4 animate-spin" />
								) : (
									<Send className="w-4 h-4" />
								)}
							</motion.button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default GovChat;
