import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Submission from '@/models/Submission';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        const submission = await Submission.create(body);

        return NextResponse.json({ success: true, data: submission }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        // Sort by timestamp descending (newest first)
        const submissions = await Submission.find({}).sort({ timestamp: -1 });

        return NextResponse.json({ success: true, data: submissions });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
