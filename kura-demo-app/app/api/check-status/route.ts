import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('runId');

    if (!runId) {
        return NextResponse.json({ error: 'Run ID is required' }, { status: 400 });
    }

    try {
        const run = await client.run(runId).get();

        if (!run) {
            return NextResponse.json({ status: 'NOT_FOUND' });
        }

        if (run.status === 'SUCCEEDED') {
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            return NextResponse.json({ status: 'SUCCEEDED', data: items });
        } else if (run.status === 'FAILED' || run.status === 'ABORTED') {
             return NextResponse.json({ status: 'FAILED' });
        } else {
            return NextResponse.json({ status: 'RUNNING' });
        }

    } catch (error) {
        console.error('Error checking status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

