"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Command, 
  Settings as SettingsIcon,
  Upload,
  MessageSquare,
  BarChart3,
  FileSearch,
  Loader,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/contexts/chat-context';
import { chatAPI } from '@/lib/api';
import { ChatMessage } from '@/lib/types';

// Import our custom components
import ChatHistory from './chat-history';
import TrustMeter from './trust-meter';
import SourcesPanel from './sources-panel';
import SettingsPanel from './settings-panel';
import FileUpload from './file-upload';
import { Textarea } from './animated-ai-chat';

interface TabButtonProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (id: string) => void;
  badge?: number;
}

function TabButton({ id, label, icon, isActive, onClick, badge }: TabButtonProps) {
  return (
    <motion.button
      onClick={() => onClick(id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
        isActive 
          ? "bg-white/10 text-white shadow-lg" 
          : "text-white/60 hover:text-white/90 hover:bg-white/5"
      )}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 text-white text-xs rounded-full flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </motion.button>
  );
}

export function GovChat() {
  const {
    messages,
    isLoading,
    settings,
    uploadedFiles,
    isIndexing,
    addMessage,
    setLoading,
    addFile,
    updateFile,
    removeFile,
    setIndexing,
  } = useChat();

  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedAudit, setSelectedAudit] = useState<ChatMessage['audit'] | null>(null);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const question = inputValue.trim();
    setInputValue('');
    setLoading(true);

    try {
      const response = await chatAPI.askQuestion(question, settings);
      
      const newMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        question,
        answer: response.answer,
        timestamp: Date.now(),
        audit: response.audit,
      };

      addMessage(newMessage);
      
      // Auto-switch to trust meter tab if not on chat
      if (activeTab !== 'chat') {
        setActiveTab('trust');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  }, [inputValue, isLoading, settings, addMessage, setLoading, activeTab]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFilesUploaded = useCallback((files: any[]) => {
    files.forEach(file => addFile(file));
  }, [addFile]);

  const handleRebuildIndex = useCallback(async () => {
    setIndexing(true);
    try {
      await chatAPI.rebuildIndex(settings);
    } catch (error) {
      console.error('Error rebuilding index:', error);
    } finally {
      setIndexing(false);
    }
  }, [settings, setIndexing]);

  const latestMessage = messages[messages.length - 1];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/5 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.05] bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">GovChat</h1>
                <p className="text-sm text-white/60">AI Assistant with RAG, Citations & Audit</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-sm text-white/60">
                {messages.length} conversation{messages.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Panel - Chat */}
        <div className="flex-1 flex flex-col">
          {/* Chat History */}
          <ChatHistory
            messages={messages}
            isLoading={isLoading}
            onShowAudit={setSelectedAudit}
            className="flex-1"
          />
          
          {/* Input Area */}
          <div className="border-t border-white/[0.05] bg-black/50 backdrop-blur-xl p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Input */}
              <div className="relative">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about your government data..."
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
              
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-white/[0.05] rounded-lg text-xs text-white/60 hover:text-white/90 transition-colors"
                >
                  <Paperclip className="w-3 h-3" />
                  Attach
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-white/[0.05] rounded-lg text-xs text-white/60 hover:text-white/90 transition-colors"
                >
                  <Command className="w-3 h-3" />
                  Commands
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Tabs */}
        <div className="w-96 border-l border-white/[0.05] bg-black/30 backdrop-blur-xl flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-white/[0.05] p-4">
            <div className="grid grid-cols-4 gap-1 bg-white/[0.02] p-1 rounded-lg">
              <TabButton
                id="trust"
                label="Trust"
                icon={<BarChart3 className="w-4 h-4" />}
                isActive={activeTab === 'trust'}
                onClick={setActiveTab}
              />
              <TabButton
                id="sources"
                label="Sources"
                icon={<FileSearch className="w-4 h-4" />}
                isActive={activeTab === 'sources'}
                onClick={setActiveTab}
                badge={latestMessage?.audit.retrieved.length}
              />
              <TabButton
                id="upload"
                label="Upload"
                icon={<Upload className="w-4 h-4" />}
                isActive={activeTab === 'upload'}
                onClick={setActiveTab}
                badge={uploadedFiles.length}
              />
              <TabButton
                id="settings"
                label="Settings"
                icon={<SettingsIcon className="w-4 h-4" />}
                isActive={activeTab === 'settings'}
                onClick={setActiveTab}
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              {activeTab === 'trust' && (
                <motion.div
                  key="trust"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {latestMessage ? (
                    <TrustMeter
                      score={latestMessage.audit.trust_score}
                      heuristic="embeddings similarity, number of distinct sources, recency flag"
                    />
                  ) : (
                    <div className="text-center py-12">
                      <BarChart3 className="w-12 h-12 text-white/40 mx-auto mb-4" />
                      <p className="text-white/60">Ask a question to see trust metrics</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'sources' && (
                <motion.div
                  key="sources"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SourcesPanel
                    sources={latestMessage?.audit.retrieved || []}
                  />
                </motion.div>
              )}

              {activeTab === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FileUpload
                    onFilesUploaded={handleFilesUploaded}
                    uploadedFiles={uploadedFiles}
                    onRemoveFile={removeFile}
                    isUploading={isIndexing}
                  />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SettingsPanel
                    onRebuildIndex={handleRebuildIndex}
                    isRebuilding={isIndexing}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Audit Modal */}
      <AnimatePresence>
        {selectedAudit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAudit(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/90 border border-white/[0.1] rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Audit Details</h3>
                <button
                  onClick={() => setSelectedAudit(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
              <pre className="text-sm text-white/80 whitespace-pre-wrap bg-white/[0.02] p-4 rounded-lg border border-white/[0.05]">
                {JSON.stringify(selectedAudit, null, 2)}
              </pre>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GovChat;
