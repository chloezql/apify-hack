import React from 'react';
import { ExternalLink, ShoppingBag } from 'lucide-react';

export interface Item {
    id: string;
    imageUrl: string;
    title?: string;
    url?: string;
    isAd?: boolean;
    productName?: string;
}

export function MasonryGrid({ items }: { items: Item[] }) {
    if (items.length === 0) return null;

    return (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 w-full max-w-7xl mx-auto">
             {items.map((item, index) => (
                <div 
                    key={`${item.id}-${index}`} 
                    className={`break-inside-avoid relative group rounded-xl overflow-hidden shadow-lg bg-white mb-4 border-4 transition-colors duration-300 ${item.isAd ? 'border-transparent hover:border-green-500' : 'border-transparent'}`}
                >
                    <img 
                        src={item.imageUrl} 
                        alt={item.title || 'Image'} 
                        className="w-full h-auto object-cover block"
                        loading="lazy"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        {item.isAd && (
                            <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                                Recommended
                            </span>
                        )}
                        
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            {item.isAd ? (
                                <h3 className="text-white font-medium text-sm line-clamp-2 mb-3 drop-shadow-md">
                                    {item.productName || item.title || 'Discovery'}
                                </h3>
                            ) : null}
                            
                            {item.isAd && item.url ? (
                                <a 
                                    href={item.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center bg-white text-black py-2.5 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    Shop Now
                                </a>
                            ) : null}
                        </div>
                    </div>
                </div>
             ))}
        </div>
    );
}

