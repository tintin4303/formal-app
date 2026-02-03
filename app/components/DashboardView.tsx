'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { gradingCriteria } from '../constants';
import { Submission } from '../types';
import StatisticsModal from './StatisticsModal';

export default function DashboardView() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [showQr, setShowQr] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [origin, setOrigin] = useState('');

    const fetchSubmissions = async () => {
        try {
            const res = await fetch('/api/submissions');
            const data = await res.json();
            if (data.success) {
                setSubmissions(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch submissions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setOrigin(window.location.origin);
        fetchSubmissions();
        // Refresh every 10 seconds to see new scores coming in live
        const interval = setInterval(fetchSubmissions, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this record?')) {
            try {
                await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
                setSubmissions(prev => prev.filter(s => s.id !== id));
            } catch (error) {
                alert('Failed to delete');
            }
        }
    };

    const handleBulkExport = () => {
        const headers = [
            "Contestant No", "Date", "Total Score", "Final Grade",
            ...gradingCriteria.map(c => c.title.replace(/\d+\.\s/, ''))
        ];

        const rows = submissions.map(s => [
            `"${s.contestant}"`,
            s.date,
            s.totalScore,
            s.finalGrade,
            ...gradingCriteria.map(c => s.scores[c.id])
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `all_evaluations_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleDownloadQr = () => {
        const svg = document.getElementById("qr-code-svg");
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = 1000;
            canvas.height = 1000;
            ctx?.drawImage(img, 0, 0, 1000, 1000);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = "speech-contest-qr.png";
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Loading submissions...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Evaluation Results</h2>
                    <p className="text-gray-500 text-sm mt-1">Total {submissions.length} submissions</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setShowStats(true)}
                        className="flex-1 md:flex-none px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition"
                    >
                        <span>📊 Statistics</span>
                    </button>
                    <button
                        onClick={() => setShowQr(true)}
                        className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition"
                    >
                        <span>Show QR Code</span>
                    </button>
                    <button
                        onClick={handleBulkExport}
                        className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
                    >
                        <span>Download CSV</span>
                    </button>
                </div>
            </div>

            {submissions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="text-gray-400 mb-4 text-6xl">📝</div>
                    <h3 className="text-xl font-semibold text-gray-900">No evaluations yet</h3>
                    <p className="text-gray-500 mt-2">Share the QR code to start receiving scores.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="p-4">Contestant</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4 text-center">Total</th>
                                    <th className="p-4 text-center">Grade</th>
                                    <th className="p-4 text-right hidden md:table-cell">Content</th>
                                    <th className="p-4 text-right hidden md:table-cell">Pronunciation</th>
                                    <th className="p-4 text-right hidden md:table-cell">Fluency</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {submissions.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-900">{s.contestant}</td>
                                        <td className="p-4">{s.date}</td>
                                        <td className="p-4 text-center font-mono font-bold text-blue-600">{s.totalScore}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${s.finalGrade === 'A' ? 'bg-green-100 text-green-700' :
                                                s.finalGrade === 'B' ? 'bg-blue-100 text-blue-700' :
                                                    s.finalGrade === 'F' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {s.finalGrade}
                                            </span>
                                        </td>
                                        {/* Detailed scores only visible on larger screens */}
                                        <td className="p-4 text-right hidden md:table-cell">{s.scores.content}/30</td>
                                        <td className="p-4 text-right hidden md:table-cell">{s.scores.pronunciation}/25</td>
                                        <td className="p-4 text-right hidden md:table-cell">{s.scores.fluency}/20</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                                                title="Delete"
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {showQr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full relative">
                        <button
                            onClick={() => setShowQr(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Scan to Evaluate</h3>
                            <p className="text-gray-500 text-sm mb-6">Audience can scan this code to open the grading form.</p>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-inner inline-block">
                                <QRCode
                                    id="qr-code-svg"
                                    value={origin}
                                    size={200}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <button
                                    onClick={handleDownloadQr}
                                    className="mb-4 w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition flex items-center justify-center gap-2"
                                >
                                    <span>⬇ Download QR Image</span>
                                </button>
                                <p className="text-xs text-gray-400 mb-2">Or share this link:</p>
                                <code className="block bg-gray-50 p-3 rounded-lg text-sm text-blue-600 break-all select-all cursor-pointer hover:bg-gray-100 transition" onClick={() => navigator.clipboard.writeText(origin)}>
                                    {origin}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistics Modal */}
            {showStats && (
                <StatisticsModal submissions={submissions} onClose={() => setShowStats(false)} />
            )}
        </div>
    );
}
