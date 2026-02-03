'use client';

import { useState, useEffect } from 'react';
import { gradingCriteria } from '../constants';
import { Submission } from '../types';

export default function GraderView() {
    const [contestant, setContestant] = useState('');
    const [date] = useState(new Date().toISOString().split('T')[0]);
    const [scores, setScores] = useState<Record<string, number>>({ content: 0, pronunciation: 0, fluency: 0, expression: 0, impression: 0 });
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [gradedContestants, setGradedContestants] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('graded_contestants');
        if (saved) {
            setGradedContestants(JSON.parse(saved));
        }
    }, []);

    const isAlreadyGraded = gradedContestants.includes(contestant);

    const handleScoreChange = (id: string, val: string, max: number) => {
        let num = Number(val);
        if (num > max) num = max;
        if (num < 0) num = 0;
        setScores(prev => ({ ...prev, [id]: num }));
    };

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

    // Grading Scale Logic
    const getGrade = (s: number) => {
        if (s >= 80) return 'A';
        if (s >= 75) return 'B';
        if (s >= 70) return 'C';
        if (s >= 50) return 'D';
        return 'F';
    };

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const finishGrading = async () => {
        setIsSubmitting(true);
        const submission: Submission = {
            id: crypto.randomUUID(),
            contestant,
            date,
            scores,
            totalScore,
            finalGrade: getGrade(totalScore),
            timestamp: Date.now()
        };

        try {
            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submission),
            });

            if (!res.ok) throw new Error('Failed to submit');

            setIsSuccess(true);
            const newGraded = [...gradedContestants, contestant];
            setGradedContestants(newGraded);
            localStorage.setItem('graded_contestants', JSON.stringify(newGraded));
        } catch (error) {
            alert('Error submitting score. Please try again.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setContestant('');
        setScores({ content: 0, pronunciation: 0, fluency: 0, expression: 0, impression: 0 });
        setCurrentStep(0);
        setIsSuccess(false);
    };

    if (isSuccess) {
        return (
            <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center animate-in zoom-in duration-300">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Evaluation Submitted!</h2>
                <p className="text-gray-500 mb-8">Thank you for grading contestant {contestant}.</p>
                <button
                    onClick={resetForm}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 active:scale-95 transition-all"
                >
                    Grade Next Contestant
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Progress Bar */}
            <div className="h-1 bg-gray-100 w-full">
                <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${(currentStep / (gradingCriteria.length + 1)) * 100}%` }}
                />
            </div>

            <div className="p-5 md:p-8">
                {/* Step 0: Intro */}
                {currentStep === 0 && (
                    <div className="space-y-6 animate-in fade-in">
                        <h2 className="text-2xl font-bold">Rate Contestant</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contestant No.</label>
                                <input value={contestant} onChange={e => setContestant(e.target.value)} className="w-full max-w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" autoFocus />
                            </div>
                        </div>
                        {isAlreadyGraded && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                                <span>⚠️</span>
                                <div>You have already graded Contestant <strong>{contestant}</strong>.</div>
                            </div>
                        )}
                        <button
                            onClick={nextStep}
                            disabled={!contestant || isAlreadyGraded}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-100 transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Steps 1-5: Criteria */}
                {currentStep > 0 && currentStep <= gradingCriteria.length && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                        {(() => {
                            const c = gradingCriteria[currentStep - 1];
                            return (
                                <>
                                    <div className="flex justify-between text-sm font-medium text-gray-500 uppercase tracking-wider">
                                        <span>Criterion {currentStep}/5</span>
                                        <span>Max: {c.maxPoints} pts</span>
                                    </div>
                                    <h2 className="text-2xl font-bold">{c.title}</h2>
                                    <ul className="bg-blue-50 p-4 rounded-lg text-blue-900 text-sm list-disc list-inside space-y-1">
                                        {c.details.map((d, i) => <li key={i}>{d}</li>)}
                                    </ul>
                                    <div className="pt-2">
                                        <input
                                            key={c.id}
                                            type="number"
                                            value={scores[c.id] || ''}
                                            onChange={e => handleScoreChange(c.id, e.target.value, c.maxPoints)}
                                            className="w-full text-4xl md:text-5xl font-bold text-center p-3 md:p-6 border rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                                            placeholder="0"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button onClick={prevStep} className="flex-1 py-3 border rounded-lg hover:bg-gray-50 transform hover:scale-[1.02] active:scale-[0.98] transition-all">Back</button>
                                        <button onClick={nextStep} className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all">Next</button>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}

                {/* Step 6: Review */}
                {currentStep > gradingCriteria.length && (
                    <div className="text-center space-y-6 animate-in zoom-in duration-300">
                        <div>
                            <div className="text-sm text-gray-500 uppercase tracking-wider">Final Grade</div>
                            <div className="text-7xl font-black text-gray-900 my-2">{getGrade(totalScore)}</div>
                            <div className="text-xl text-gray-600">{totalScore} / 100</div>
                        </div>
                        <button
                            onClick={finishGrading}
                            disabled={isSubmitting}
                            className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Evaluation'}
                        </button>
                        <button onClick={prevStep} disabled={isSubmitting} className="text-gray-500 hover:text-gray-900 text-sm">Go Back</button>
                    </div>
                )}
            </div>
        </div>
    );
}
