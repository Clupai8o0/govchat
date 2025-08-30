"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ChartColumnStacked } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustMeterProps {
  score: number;
  className?: string;
  showDetails?: boolean;
  heuristic?: string;
}

export function TrustMeter({ 
  score, 
  className, 
  showDetails = true,
  heuristic = "embeddings similarity, number of distinct sources, recency flag"
}: TrustMeterProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    if (score >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 60) return <TrendingUp className="w-4 h-4" />;
    if (score >= 40) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'High Trust';
    if (score >= 60) return 'Good Trust';
    if (score >= 40) return 'Moderate Trust';
    return 'Low Trust';
  };

  return (
		<div className={cn("space-y-4", className)}>
			{/* Header */}
			<div className="flex items-center gap-3">
				<div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center">
					<span className="text-white text-sm font-bold">
						<ChartColumnStacked className="w-4 h-4" />
					</span>
				</div>
				<div>
					<h3 className="text-lg font-semibold text-white">Trust Meter</h3>
				</div>
			</div>

			{/* Score Display */}
			<div className="relative">
				<div className="flex items-end gap-4">
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-2">
							<span className={cn("text-2xl font-bold", getScoreColor(score))}>
								{score}
							</span>
							<span className="text-white/60 text-sm">/ 100</span>
							<div className={cn("flex items-center", getScoreColor(score))}>
								{getScoreIcon(score)}
							</div>
						</div>
						<p className={cn("text-sm font-medium", getScoreColor(score))}>
							{getScoreLabel(score)}
						</p>
					</div>
				</div>

				{/* Animated Progress Bar */}
				<div className="mt-4 relative">
					<div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
						<motion.div
							className={cn("h-full bg-gradient-to-r", getScoreGradient(score))}
							initial={{ width: 0 }}
							animate={{ width: `${score}%` }}
							transition={{ duration: 1.2, ease: "easeOut" }}
						/>
					</div>

					{/* Score indicator */}
					<motion.div
						className="absolute top-0 w-3 h-3 rounded-full bg-white shadow-lg transform -translate-y-0.5"
						initial={{ left: "0%" }}
						animate={{ left: `${Math.max(0, Math.min(100, score))}%` }}
						transition={{ duration: 1.2, ease: "easeOut" }}
						style={{ marginLeft: "-6px" }}
					/>
				</div>

				{/* Scale markers */}
				<div className="flex justify-between mt-2 text-xs text-white/40">
					<span>0</span>
					<span>25</span>
					<span>50</span>
					<span>75</span>
					<span>100</span>
				</div>
			</div>

			{/* Heuristic Details */}
			{showDetails && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					transition={{ delay: 0.5, duration: 0.3 }}
					className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.05]"
				>
					<p className="text-xs text-white/60 leading-relaxed">
						<span className="font-medium text-white/80">Heuristic:</span>{" "}
						{heuristic}
					</p>
				</motion.div>
			)}

			{/* Animated Background Glow */}
			<motion.div
				className={cn(
					"absolute inset-0 rounded-lg opacity-5 blur-xl -z-10",
					`bg-gradient-to-r ${getScoreGradient(score)}`
				)}
				animate={{
					scale: [1, 1.05, 1],
					opacity: [0.1, 0.2, 0.1],
				}}
				transition={{
					duration: 2,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>
		</div>
	);
}

export default TrustMeter;
