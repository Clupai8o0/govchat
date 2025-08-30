"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RetrievedSource } from '@/lib/types';

interface SourcesPanelProps {
  sources: RetrievedSource[];
  className?: string;
}

interface SourceItemProps {
  source: RetrievedSource;
  index: number;
}

function SourceItem({ source, index }: SourceItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const filename = source.source.split('/').pop() || source.source;
  const similarity = source.similarity ? Math.round(source.similarity * 100) : 0;
  
  const getSimilarityColor = (sim: number) => {
    if (sim >= 80) return 'text-green-400';
    if (sim >= 60) return 'text-yellow-400';
    if (sim >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/[0.02] rounded-lg border border-white/[0.05] overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileText className="w-4 h-4 text-white/60 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">
                  {filename}
                </span>
                <div className="flex items-center gap-1">
                  {source.recency_flag ? (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 text-yellow-400" />
                  )}
                  <span className="text-xs text-white/60">
                    {source.recency_flag ? 'Recent' : 'Older'}
                  </span>
                </div>
              </div>
              
              {source.similarity !== null && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/60">Relevance:</span>
                  <span className={cn("text-xs font-medium", getSimilarityColor(similarity))}>
                    {similarity}%
                  </span>
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full",
                        similarity >= 80 ? "bg-green-400" :
                        similarity >= 60 ? "bg-yellow-400" :
                        similarity >= 40 ? "bg-orange-400" : "bg-red-400"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${similarity}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4 text-white/60" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/[0.05]"
          >
            <div className="p-4 space-y-3">
              {source.preview && (
                <div>
                  <h4 className="text-xs font-medium text-white/80 mb-2">Preview</h4>
                  <p className="text-xs text-white/60 leading-relaxed bg-white/[0.02] p-3 rounded border border-white/[0.05]">
                    {source.preview}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-white/40" />
                  <span className="text-xs text-white/60">
                    Status: {source.recency_flag ? 'Recently updated' : 'Older content'}
                  </span>
                </div>
                
                <button className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  View source
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function SourcesPanel({ sources, className }: SourcesPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const displaySources = showAll ? sources : sources.slice(0, 3);
  
  if (sources.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Sources</h3>
        </div>
        
        <div className="bg-white/[0.02] rounded-lg border border-white/[0.05] p-6 text-center">
          <FileText className="w-8 h-8 text-white/40 mx-auto mb-3" />
          <p className="text-sm text-white/60">
            Ask a question to see sources and citations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Sources</h3>
            <p className="text-sm text-white/60">{sources.length} document{sources.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-3">
        {displaySources.map((source, index) => (
          <SourceItem key={`${source.source}-${index}`} source={source} index={index} />
        ))}
      </div>

      {/* Show More/Less Button */}
      {sources.length > 3 && (
        <motion.button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 text-sm text-violet-400 hover:text-violet-300 transition-colors border border-white/[0.05] rounded-lg hover:bg-white/[0.02]"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {showAll ? 'Show Less' : `Show ${sources.length - 3} More`}
        </motion.button>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.05]">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-white/60">Recent</span>
          </div>
          <p className="text-lg font-semibold text-white mt-1">
            {sources.filter(s => s.recency_flag).length}
          </p>
        </div>
        
        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.05]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-white/60">Avg. Relevance</span>
          </div>
          <p className="text-lg font-semibold text-white mt-1">
            {sources.length > 0 
              ? Math.round(sources.reduce((acc, s) => acc + (s.similarity || 0), 0) / sources.length * 100)
              : 0}%
          </p>
        </div>
      </div>
    </div>
  );
}

export default SourcesPanel;
