export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
    try {
        const conn = await dbConnect();
        const readyState = mongoose.connection.readyState;

        // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        const stateMap = ['disconnected', 'connected', 'connecting', 'disconnecting'];

        return NextResponse.json({
            status: 'ok',
            database: {
                connected: readyState === 1,
                state: stateMap[readyState] || 'unknown',
                host: conn.host
            },
            env_check: {
                has_uri: !!process.env.MONGODB_URI,
                uri_length: process.env.MONGODB_URI?.length || 0
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Health Check Error:", error);
        return NextResponse.json({
            status: 'error',
            message: (error as Error).message,
            name: (error as Error).name,
            env_check: {
                has_uri: !!process.env.MONGODB_URI
            }
        }, { status: 500 });
    }
}
