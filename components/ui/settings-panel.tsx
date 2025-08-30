"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Brain,
  Sliders,
  RefreshCw,
  Save,
  RotateCcw,
  ChevronDown,
  Info,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatSettings } from '@/lib/types';
import { useChat } from '@/contexts/chat-context';

interface SettingsPanelProps {
  className?: string;
  onRebuildIndex?: () => void;
  isRebuilding?: boolean;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  description?: string;
}

function Slider({ label, value, min, max, step = 1, onChange, description }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white/90">{label}</label>
        <span className="text-sm text-white/60">{value}</span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
        />
        <div 
          className="absolute top-0 h-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg pointer-events-none"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
      </div>
      
      {description && (
        <p className="text-xs text-white/50 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

function Toggle({ label, checked, onChange, description }: ToggleProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white/90">{label}</label>
        <button
          onClick={() => onChange(!checked)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            checked ? "bg-violet-500" : "bg-white/20"
          )}
        >
          <motion.span
            animate={{ x: checked ? 20 : 2 }}
            transition={{ duration: 0.2 }}
            className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
          />
        </button>
      </div>
      
      {description && (
        <p className="text-xs text-white/50 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
}

function Input({ label, value, onChange, placeholder, description }: InputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/90">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
      />
      {description && (
        <p className="text-xs text-white/50 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

export function SettingsPanel({ 
  className, 
  onRebuildIndex, 
  isRebuilding = false 
}: SettingsPanelProps) {
  const { settings, updateSettings } = useChat();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSettings, setLocalSettings] = useState<ChatSettings>(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateLocalSetting = <K extends keyof ChatSettings>(
    key: K, 
    value: ChatSettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    setHasUnsavedChanges(JSON.stringify(newSettings) !== JSON.stringify(settings));
  };

  const saveSettings = () => {
    updateSettings(localSettings);
    setHasUnsavedChanges(false);
  };

  const resetSettings = () => {
    setLocalSettings(settings);
    setHasUnsavedChanges(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-white/[0.02] rounded-lg border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">Settings</h3>
            <p className="text-sm text-white/60">Configure AI model and retrieval</p>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-white/60" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 overflow-hidden"
          >
            {/* AI Model Settings */}
            <div className="bg-white/[0.02] rounded-lg border border-white/[0.05] p-4">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-violet-400" />
                <h4 className="font-medium text-white">AI Model</h4>
              </div>
              
              <div className="space-y-4">
                <Toggle
                  label="Use OpenAI embeddings + LLM"
                  checked={localSettings.useOpenAI}
                  onChange={(checked) => updateLocalSetting('useOpenAI', checked)}
                  description="Enable for better quality responses (requires API key)"
                />
                
                <Input
                  label="LLM Model"
                  value={localSettings.modelName}
                  onChange={(value) => updateLocalSetting('modelName', value)}
                  placeholder="gpt-4o-mini"
                  description="OpenAI model for generating responses"
                />
                
                <Input
                  label="Embeddings Model"
                  value={localSettings.embedModel}
                  onChange={(value) => updateLocalSetting('embedModel', value)}
                  placeholder="text-embedding-3-small"
                  description="Model for text embeddings and similarity search"
                />
              </div>
            </div>

            {/* Retrieval Settings */}
            <div className="bg-white/[0.02] rounded-lg border border-white/[0.05] p-4">
              <div className="flex items-center gap-2 mb-4">
                <Sliders className="w-4 h-4 text-blue-400" />
                <h4 className="font-medium text-white">Retrieval Parameters</h4>
              </div>
              
              <div className="space-y-4">
                <Slider
                  label="Retriever k"
                  value={localSettings.topK}
                  min={2}
                  max={8}
                  onChange={(value) => updateLocalSetting('topK', value)}
                  description="Number of document chunks to retrieve for context"
                />
                
                <Slider
                  label="Chunk Size"
                  value={localSettings.chunkSize}
                  min={300}
                  max={1500}
                  step={50}
                  onChange={(value) => updateLocalSetting('chunkSize', value)}
                  description="Size of text chunks for document processing"
                />
                
                <Slider
                  label="Chunk Overlap"
                  value={localSettings.chunkOverlap}
                  min={0}
                  max={300}
                  step={10}
                  onChange={(value) => updateLocalSetting('chunkOverlap', value)}
                  description="Overlap between adjacent chunks to preserve context"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {hasUnsavedChanges && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                >
                  <Info className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-200">You have unsaved changes</span>
                </motion.div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={saveSettings}
                  disabled={!hasUnsavedChanges}
                  whileHover={{ scale: hasUnsavedChanges ? 1.02 : 1 }}
                  whileTap={{ scale: hasUnsavedChanges ? 0.98 : 1 }}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    hasUnsavedChanges
                      ? "bg-violet-500 text-white hover:bg-violet-600"
                      : "bg-white/5 text-white/40 cursor-not-allowed"
                  )}
                >
                  <Save className="w-4 h-4" />
                  Save
                </motion.button>
                
                <motion.button
                  onClick={resetSettings}
                  disabled={!hasUnsavedChanges}
                  whileHover={{ scale: hasUnsavedChanges ? 1.02 : 1 }}
                  whileTap={{ scale: hasUnsavedChanges ? 0.98 : 1 }}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                    hasUnsavedChanges
                      ? "border-white/20 text-white/90 hover:bg-white/5"
                      : "border-white/10 text-white/40 cursor-not-allowed"
                  )}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </motion.button>
              </div>
              
              <motion.button
                onClick={onRebuildIndex}
                disabled={isRebuilding}
                whileHover={{ scale: isRebuilding ? 1 : 1.02 }}
                whileTap={{ scale: isRebuilding ? 1 : 0.98 }}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all bg-gradient-to-r",
                  isRebuilding
                    ? "from-gray-500 to-gray-600 cursor-not-allowed"
                    : "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                )}
              >
                <motion.div
                  animate={isRebuilding ? { rotate: 360 } : {}}
                  transition={isRebuilding ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
                {isRebuilding ? 'Rebuilding...' : '(Re)build Index'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}

export default SettingsPanel;
