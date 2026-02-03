'use client';

import { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
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

        // 1. Leaderboard Logic (Group by contestant)
        const contestantScores: Record<string, number[]> = {};
        submissions.forEach(s => {
            if (!contestantScores[s.contestant]) contestantScores[s.contestant] = [];
            contestantScores[s.contestant].push(s.totalScore);
        });

        const leaderboardData = Object.entries(contestantScores)
            .map(([contestant, scores_arr]) => ({
                contestant,
                avg: scores_arr.reduce((a, b) => a + b, 0) / scores_arr.length,
                evaluations: scores_arr.length
            }))
            .sort((a, b) => b.avg - a.avg)
            .slice(0, 5); // Top 5

        // 2. Criteria Detailed Stats (Replaces Trend)
        const detailedCriteria = gradingCriteria.map(c => {
            const scores = submissions.map(s => s.scores[c.id] || 0);
            const avg = scores.reduce((a, b) => a + b, 0) / total;
            const min = Math.min(...scores);
            const max = Math.max(...scores);
            return {
                ...c,
                avg,
                min,
                max,
                percentage: (avg / c.maxPoints) * 100
            };
        });

        // 3. Criteria Breakdown (Normalized) for Chart
        const criteriaBreakdown = detailedCriteria.map(c => ({
            name: c.title.replace(/^\d+\.\s/, '').split(' ')[0],
            score: c.percentage,
            fill: '#8884d8'
        }));

        // 4. Grade Distribution
        const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
        submissions.forEach(s => {
            gradeCounts[s.finalGrade] = (gradeCounts[s.finalGrade] || 0) + 1;
        });
        const distributionData = Object.entries(gradeCounts).map(([grade, count]) => ({
            name: grade,
            count,
        }));

        return { total, avgScore, maxScore, minScore, leaderboardData, detailedCriteria, criteriaBreakdown, distributionData };
    }, [submissions]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-900">Statistics Dashboard</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-500 hover:text-gray-900 hover:scale-110 active:scale-95">✕</button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Total Evaluations" value={stats?.total || 0} />
                        <StatCard label="Average Score" value={stats?.avgScore.toFixed(1) || '0'} />
                        <StatCard label="Highest Score" value={stats?.maxScore || 0} />
                        <StatCard label="Lowest Score" value={stats?.minScore || 0} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 1. Leaderboard Table */}
                        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">Top 5 Contestants</h4>
                            <div className="overflow-x-auto flex-1">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-3 rounded-l-lg">Rank</th>
                                            <th className="px-3 py-3">No.</th>
                                            <th className="px-3 py-3 text-right rounded-r-lg">Avg</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {stats?.leaderboardData.map((l, i) => (
                                            <tr key={l.contestant}>
                                                <td className="px-3 py-3 font-medium text-gray-500">#{i + 1}</td>
                                                <td className="px-3 py-3 font-bold text-gray-900">{l.contestant}</td>
                                                <td className="px-3 py-3 text-right font-mono text-blue-600 font-bold">{l.avg.toFixed(1)}</td>
                                            </tr>
                                        ))}
                                        {(!stats?.leaderboardData.length) && (
                                            <tr><td colSpan={3} className="text-center py-4 text-gray-400">No data yet</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 2. Detailed Criteria Analysis (Replaces Trend) */}
                        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-800 mb-4">Detailed Criteria Analysis</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Criterion</th>
                                            <th className="px-4 py-3 text-right">Max</th>
                                            <th className="px-4 py-3 text-right">Avg</th>
                                            <th className="px-4 py-3 text-right">Range</th>
                                            <th className="px-4 py-3 rounded-r-lg w-1/3">Performance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {stats?.detailedCriteria.map((c) => (
                                            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    <div className="font-bold">{c.title.replace(/^\d+\.\s/, '')}</div>
                                                    <div className="text-xs text-gray-400 font-normal hidden md:block truncate max-w-[200px]">{c.details.join(', ')}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-500">{c.maxPoints}</td>
                                                <td className="px-4 py-3 text-right font-mono font-bold text-blue-600">{c.avg.toFixed(1)}</td>
                                                <td className="px-4 py-3 text-right text-xs text-gray-500">
                                                    {c.min} - {c.max}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${c.percentage >= 80 ? 'bg-green-500' : c.percentage >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                                                style={{ width: `${c.percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium w-9 text-right">{c.percentage.toFixed(0)}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 3. Grade Distribution */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-800 mb-4">Grade Distribution</h4>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.distributionData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
                                        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 4, 4]} barSize={40} name="Count" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 4. Criteria Breakdown */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-800 mb-4">Criteria Performance (%)</h4>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={stats?.criteriaBreakdown}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} formatter={(val: number | undefined) => (val !== undefined ? val.toFixed(1) + '%' : '')} />
                                        <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} name="Avg %" background={{ fill: '#f3f4f6' }} />
                                    </BarChart>
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

function StatCard({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{label}</div>
        </div>
    );
}
