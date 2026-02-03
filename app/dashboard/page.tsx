'use client';

import { useState, useEffect } from 'react';
import DashboardView from '../components/DashboardView';

export default function DashboardPage() {
    // Simple client-side protection for demonstration
    // In a real app, use NextAuth or similar
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const session = localStorage.getItem('admin_session');
        if (session === 'true') {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin123') { // Simple hardcoded password
            localStorage.setItem('admin_session', 'true');
            setIsAuthenticated(true);
        } else {
            alert('Incorrect password');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_session');
        setIsAuthenticated(false);
    };

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-md">
                    <h1 className="text-2xl font-bold mb-6 text-center text-blue-900">Teacher Dashboard</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Access Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Enter password..."
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                            Access Dashboard
                        </button>

                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="font-bold text-xl text-blue-900 flex items-center gap-2">
                    <span>🇯🇵 Japanese Speech Contest</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">Teacher Dashboard</span>
                </div>
                <div>
                    <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer">Logout</button>
                </div>
            </nav>

            <main className="p-4 md:p-8 max-w-7xl mx-auto">
                <DashboardView />
            </main>
        </div>
    );
}
