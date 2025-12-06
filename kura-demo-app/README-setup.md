# Kura Demo App Setup Guide

This mini-app demonstrates your Kura Apify Actor by combining it with Pinterest search results.

## Prerequisites

1.  **Apify API Token**: You need your Apify API Token. Get it from [Apify Console](https://console.apify.com/account/integrations).

## Setup Steps

1.  **Navigate to the app directory:**
    ```bash
    cd kura-demo-app
    ```

2.  **Install dependencies (if you haven't already):**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a file named `.env.local` in the `kura-demo-app` directory and add your token:
    ```bash
    # Create the file
    touch .env.local
    
    # Add this line to the file (replace with your actual token)
    APIFY_API_TOKEN=your_apify_api_token_here
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

5.  **Open the App:**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## How it Works

1.  **User Input**: User enters a mood (e.g., "Cozy winter cabin").
2.  **API Route (`/api/start-search`)**:
    *   Starts your **Kura Actor** (`tropical_lease/kura`) with `scenario_input`.
    *   Starts the **Pinterest Actor** (`LJ5EVniB0ulV4RfGP`) with `queries`.
    *   Returns two `runId`s immediately.
3.  **Polling (`/api/check-status`)**:
    *   The frontend polls the status of both runs every 3 seconds.
    *   As soon as Pinterest results are ready, they appear.
    *   When Kura finishes (usually takes longer), its "Ad" result pops to the top with a **Green Border**.

## Hosting on Vercel

1.  Push this code to GitHub.
2.  Import the project in Vercel.
3.  Add `APIFY_API_TOKEN` to the **Environment Variables** in Vercel Project Settings.
4.  Deploy!

