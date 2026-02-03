'use client';

import { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Submission } from '../types';
import { gradingCriteria } from '../constants';

type Props = {
    submissions: Submission[];
    onClose: () => void;
};

export default function StatisticsModal({ submissions, onClose }: Props) {
    const stats = useMemo(() => {
        if (submissions.length === 0) return null;

        const total = submissions.length;
        const scores = submissions.map(s => s.totalScore);
        const avgScore = scores.reduce((a, b) => a + b, 0) / total;
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);

        // Grade Distribution
        const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
        submissions.forEach(s => {
            gradeCounts[s.finalGrade] = (gradeCounts[s.finalGrade] || 0) + 1;
        });
        const distributionData = Object.entries(gradeCounts).map(([grade, count]) => ({
            name: grade,
            count,
        }));

        // Criteria Averages
        const criteriaData = gradingCriteria.map(c => {
            const avg = submissions.reduce((sum, s) => sum + (s.scores[c.id] || 0), 0) / total;
            return {
                subject: c.title.replace(/^\d+\.\s/, ''), // Remove "1. " from title
                A: avg,
                fullMark: c.maxPoints,
            };
        });

        return { total, avgScore, maxScore, minScore, distributionData, criteriaData };
    }, [submissions]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-900">📊 Statistics Dashboard</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-gray-900"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Total Evaluations" value={stats?.total || 0} icon="📝" />
                        <StatCard label="Average Score" value={stats?.avgScore.toFixed(1) || '0'} icon="📈" />
                        <StatCard label="Highest Score" value={stats?.maxScore || 0} icon="🏆 text-yellow-500" />
                        <StatCard label="Lowest Score" value={stats?.minScore || 0} icon="📉 text-red-500" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Grade Distribution Chart */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h4 className="font-semibold text-gray-700 mb-4 text-center">Grade Distribution</h4>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.distributionData}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Students" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Criteria Radar Chart */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h4 className="font-semibold text-gray-700 mb-4 text-center">Average Performance by Criteria</h4>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats?.criteriaData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 30]} />
                                        <Radar
                                            name="Average"
                                            dataKey="A"
                                            stroke="#8b5cf6"
                                            fill="#8b5cf6"
                                            fillOpacity={0.6}
                                        />
                                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-400 pt-4">
                        * Stats calculate based on all currently visible submissions.
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string, value: string | number, icon: string }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <div className={`text-2xl mb-1 ${icon.includes('text') ? '' : 'grayscale'}`}>{icon.replace(/[a-z- ]/g, '')}</div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{label}</div>
        </div>
    );
}
