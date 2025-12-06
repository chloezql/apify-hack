import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

export async function POST(request: Request) {
    try {
        const { query } = await request.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        console.log(`Starting search for: ${query}`);

        // Start Kura Actor
        const kuraPromise = client.actor('tropical_lease/kura').start({
            scenario: query,
        });

        // Start Pinterest Scraper
        const pinterestPromise = client.actor('LJ5EVniB0ulV4RfGP').start({
            query: [query], // Using 'query' array instead of 'queries'
            limit: 15,      // Using 'limit' instead of 'maxPosts'
            gallery: false,
            dev_dataset_clear: false,
        });

        const [kuraRun, pinterestRun] = await Promise.all([kuraPromise, pinterestPromise]);

        return NextResponse.json({
            kuraRunId: kuraRun.id,
            pinterestRunId: pinterestRun.id,
        });

    } catch (error) {
        console.error('Error starting actors:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

