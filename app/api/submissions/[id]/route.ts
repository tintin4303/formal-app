import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Submission from '@/models/Submission';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15+ params is a Promise
) {
    try {
        const { id } = await params;
        await dbConnect();

        // We are using the 'id' field (UUID), not the _id field from Mongo, unless we switched to using _id in frontend.
        // The model has 'id' as a string field.
        const deleted = await Submission.findOneAndDelete({ id: id });

        if (!deleted) {
            return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
