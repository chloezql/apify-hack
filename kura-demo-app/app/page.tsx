'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { MasonryGrid, Item } from '@/components/MasonryGrid';

export default function Home() {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  
  // Track separate loading states and data
  const [kuraLoading, setKuraLoading] = useState(false);
  const [pinterestLoading, setPinterestLoading] = useState(false);
  const [kuraData, setKuraData] = useState<Item[]>([]);
  const [pinterestData, setPinterestData] = useState<Item[]>([]);
  const [kuraDone, setKuraDone] = useState(false);
  const [pinterestDone, setPinterestDone] = useState(false);

  const kuraIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pinterestIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (kuraIntervalRef.current) clearInterval(kuraIntervalRef.current);
      if (pinterestIntervalRef.current) clearInterval(pinterestIntervalRef.current);
    };
  }, []);

  // Effect to synchronize final display
  useEffect(() => {
      if (kuraDone && pinterestDone) {
          const combined = [...pinterestData, ...kuraData];
          
          // Random shuffle for mixed feed
          const shuffled = combined.sort(() => Math.random() - 0.5);
          
          setItems(shuffled);
          setLoading(false);
          setKuraLoading(false); // Ensure spinners stop
          setPinterestLoading(false);
          setStatusText('');
      }
  }, [kuraDone, pinterestDone, kuraData, pinterestData]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setHasSearched(true);
    setLoading(true); 
    setKuraLoading(true);
    setPinterestLoading(true);
    
    // Reset states
    setItems([]);
    setKuraData([]);
    setPinterestData([]);
    setKuraDone(false);
    setPinterestDone(false);
    
    setStatusText('Initializing agents...');

    // Clear existing intervals
    if (kuraIntervalRef.current) clearInterval(kuraIntervalRef.current);
    if (pinterestIntervalRef.current) clearInterval(pinterestIntervalRef.current);

    try {
      const res = await fetch('/api/start-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error('Failed to start search');
      
      const { kuraRunId, pinterestRunId } = await res.json();
      
      setStatusText('Agents are working...');
      startPolling(kuraRunId, 'kura');
      startPolling(pinterestRunId, 'pinterest');

    } catch (err) {
      console.error(err);
      setStatusText('Something went wrong. Please try again.');
      setLoading(false);
      setKuraLoading(false);
      setPinterestLoading(false);
    }
  };

  const startPolling = (runId: string, type: 'kura' | 'pinterest') => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-status?runId=${runId}`);
        const result = await res.json();

        if (result.status === 'SUCCEEDED') {
            if (type === 'kura' && kuraIntervalRef.current) clearInterval(kuraIntervalRef.current);
            if (type === 'pinterest' && pinterestIntervalRef.current) clearInterval(pinterestIntervalRef.current);
            
            const formattedItems = formatItems(result.data, type);
            
            if (type === 'kura') {
                setKuraData(formattedItems);
                setKuraDone(true);
            } else {
                setPinterestData(formattedItems);
                setPinterestDone(true);
            }

        } else if (result.status === 'FAILED' || result.status === 'ABORTED') {
             if (type === 'kura' && kuraIntervalRef.current) clearInterval(kuraIntervalRef.current);
             if (type === 'pinterest' && pinterestIntervalRef.current) clearInterval(pinterestIntervalRef.current);
             
             // Even if failed, we mark as done so the other results can eventually show
             if (type === 'kura') setKuraDone(true);
             else setPinterestDone(true);
        } else {
            // Update status text while running
            if (type === 'kura') setStatusText('Generating creative ads...');
            else if (type === 'pinterest' && !pinterestDone) setStatusText('Gathering inspiration...');
        }
      } catch (e) {
        console.error(e);
      }
    }, 3000);

    if (type === 'kura') kuraIntervalRef.current = interval;
    if (type === 'pinterest') pinterestIntervalRef.current = interval;
  };

  const formatItems = (data: any[], type: 'kura' | 'pinterest'): Item[] => {
    if (type === 'kura') {
       const kuraResult = data[0]; 
       if (kuraResult && kuraResult.recommendations) {
         return kuraResult.recommendations.map((rec: any, idx: number) => ({
           id: `kura-${Date.now()}-${idx}`,
           imageUrl: rec.generated_image,
           title: rec.amazon?.title,
           productName: rec.keyword_or_title,
           url: rec.amazon?.url,
           isAd: true
         }));
       }
       return [];
    } else {
       // Pinterest adapter
       return data.map((pin: any, idx: number) => {
         const imageUrl = 
            pin['images.orig.url'] || 
            pin.images?.orig?.url || 
            pin.images?.original?.url || 
            pin.image_url ||
            pin.image;
            
         return {
            id: `pin-${Date.now()}-${idx}`,
            imageUrl: imageUrl,
            title: pin.description || pin.title || pin['board.name'] || 'Pinterest Idea',
            url: pin.url || pin.link,
            isAd: false
         };
       }).filter(item => item.imageUrl);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-8 font-[family-name:var(--font-geist-sans)]">
      
      {/* Header / Search Area */}
      <div className={`w-full max-w-3xl transition-all duration-500 ease-in-out ${hasSearched ? 'mt-4 mb-8' : 'mt-[30vh]'}`}>
        <div className="text-center mb-8">
            {!hasSearched && (
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                KURA <span className="text-green-600">Search</span>
                </h1>
            )}
            <p className={`text-gray-500 ${hasSearched ? 'hidden' : 'block'}`}>
                Describe anything you want to search, renovation ideas, hacks, recipes, gifts, etc.
            </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full shadow-xl rounded-full bg-white group focus-within:ring-4 ring-green-100 transition-all">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., South Californian backyard sunset..."
            className="w-full h-14 md:h-16 pl-6 pr-16 rounded-full border-none outline-none text-lg text-gray-800 placeholder-gray-400 bg-transparent"
            disabled={loading}
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 h-10 md:h-12 w-10 md:w-12 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            disabled={!query.trim() || loading}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
        </form>
        
        {/* Status Indicators */}
        <div className="flex flex-col items-center justify-center mt-6 gap-2 text-sm text-gray-500 min-h-[3rem]">
            {loading && (
                <>
                    <div className="flex gap-4">
                        {kuraLoading && (
                            <span className="flex items-center animate-pulse text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                <Sparkles className="w-4 h-4 mr-1.5" /> Generative Ads working...
                            </span>
                        )}
                        {pinterestLoading && (
                            <span className="flex items-center animate-pulse text-red-500 bg-red-50 px-3 py-1 rounded-full">
                                <ImageIcon className="w-4 h-4 mr-1.5" /> Gathering inspiration...
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 animate-pulse">{statusText}</p>
                </>
            )}
        </div>
      </div>

      {/* Results Area */}
      <div className="w-full max-w-[1600px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <MasonryGrid items={items} />
        
        {items.length === 0 && hasSearched && !loading && (
             <div className="text-center text-gray-400 mt-20">
                <p>No results found. Try a different mood.</p>
             </div>
        )}
      </div>

    </main>
  );
}
