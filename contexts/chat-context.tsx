"use client";

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { ChatMessage, ChatSettings, UploadedFile } from '@/lib/types';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  settings: ChatSettings;
  uploadedFiles: UploadedFile[];
  isIndexing: boolean;
  isMobileSidebarOpen: boolean;
}

type ChatAction = 
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<ChatSettings> }
  | { type: 'ADD_FILE'; payload: UploadedFile }
  | { type: 'UPDATE_FILE'; payload: { id: string; updates: Partial<UploadedFile> } }
  | { type: 'REMOVE_FILE'; payload: string }
  | { type: 'SET_INDEXING'; payload: boolean }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'TOGGLE_MOBILE_SIDEBAR' }
  | { type: 'SET_MOBILE_SIDEBAR'; payload: boolean };

const initialSettings: ChatSettings = {
  useOpenAI: true,
  topK: 4,
  chunkSize: 900,
  chunkOverlap: 120,
  modelName: 'gpt-4o-mini',
  embedModel: 'text-embedding-3-small',
};

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  settings: initialSettings,
  uploadedFiles: [],
  isIndexing: false,
  isMobileSidebarOpen: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case 'ADD_FILE':
      return {
        ...state,
        uploadedFiles: [...state.uploadedFiles, action.payload],
      };
    case 'UPDATE_FILE':
      return {
        ...state,
        uploadedFiles: state.uploadedFiles.map(file =>
          file.id === action.payload.id 
            ? { ...file, ...action.payload.updates }
            : file
        ),
      };
    case 'REMOVE_FILE':
      return {
        ...state,
        uploadedFiles: state.uploadedFiles.filter(file => file.id !== action.payload),
      };
    case 'SET_INDEXING':
      return {
        ...state,
        isIndexing: action.payload,
      };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [],
      };
    case 'TOGGLE_MOBILE_SIDEBAR':
      return {
        ...state,
        isMobileSidebarOpen: !state.isMobileSidebarOpen,
      };
    case 'SET_MOBILE_SIDEBAR':
      return {
        ...state,
        isMobileSidebarOpen: action.payload,
      };
    default:
      return state;
  }
}

interface ChatContextType extends ChatState {
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  updateSettings: (settings: Partial<ChatSettings>) => void;
  addFile: (file: UploadedFile) => void;
  updateFile: (id: string, updates: Partial<UploadedFile>) => void;
  removeFile: (id: string) => void;
  setIndexing: (indexing: boolean) => void;
  clearMessages: () => void;
  toggleMobileSidebar: () => void;
  setMobileSidebar: (open: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const addMessage = useCallback((message: ChatMessage) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const updateSettings = useCallback((settings: Partial<ChatSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const addFile = useCallback((file: UploadedFile) => {
    dispatch({ type: 'ADD_FILE', payload: file });
  }, []);

  const updateFile = useCallback((id: string, updates: Partial<UploadedFile>) => {
    dispatch({ type: 'UPDATE_FILE', payload: { id, updates } });
  }, []);

  const removeFile = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FILE', payload: id });
  }, []);

  const setIndexing = useCallback((indexing: boolean) => {
    dispatch({ type: 'SET_INDEXING', payload: indexing });
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_MOBILE_SIDEBAR' });
  }, []);

  const setMobileSidebar = useCallback((open: boolean) => {
    dispatch({ type: 'SET_MOBILE_SIDEBAR', payload: open });
  }, []);

  const value: ChatContextType = {
    ...state,
    addMessage,
    setLoading,
    updateSettings,
    addFile,
    updateFile,
    removeFile,
    setIndexing,
    clearMessages,
    toggleMobileSidebar,
    setMobileSidebar,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
