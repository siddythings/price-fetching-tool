"use client";

import { useState } from "react";
import locations from "../location.json";

// Define a type for product results
type ProductResult = {
  title: string;
  price: string;
  extracted_price?: number;
  source?: string;
  thumbnail?: string;
  product_link?: string;
  snippet?: string;
  rating?: number;
  reviews?: number;
};

type LocationOption = {
  country_code: string;
  country_name: string;
};

function renderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<span key={i} style={{ color: '#ffa41c', fontSize: 16 }}>★</span>);
    } else if (rating >= i - 0.5) {
      stars.push(<span key={i} style={{ color: '#ffa41c', fontSize: 16 }}>☆</span>);
    } else {
      stars.push(<span key={i} style={{ color: '#ddd', fontSize: 16 }}>★</span>);
    }
  }
  return stars;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  // Using 'any' for demo purposes due to dynamic JSON structure
  const [results, setResults] = useState<ProductResult[]>([]);
  const [sort, setSort] = useState("default");
  const [activeTab, setActiveTab] = useState<'products' | 'json'>('products');
  const [error, setError] = useState<string | null>(null);

  // Flatten location options (country/state)
  const locationOptions: LocationOption[] = Array.isArray(locations)
    ? locations
    : Array.isArray(locations[0])
    ? locations[0]
    : [];
  const [location, setLocation] = useState<string>("us");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setError(null);
    setResults([]);
    try {
      const selectedCountry = locationOptions.find(l => l.country_code === location);
      const locationName = selectedCountry ? selectedCountry.country_name : '';
      const res = await fetch(
        `http://localhost:8000/search?q=${encodeURIComponent(query)}&location=${encodeURIComponent(locationName)}&country_code=${encodeURIComponent(location)}`
      );
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const shoppingResults = data.shopping_results || [];
      setResults(shoppingResults);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setSearching(false);
    }
  };

  const sortedResults = results.slice();
  if (sort === "low") {
    sortedResults.sort((a, b) => {
      const priceA = typeof a.extracted_price === 'number' ? a.extracted_price : parseFloat(a.price?.replace(/[^\d.]/g, ""));
      const priceB = typeof b.extracted_price === 'number' ? b.extracted_price : parseFloat(b.price?.replace(/[^\d.]/g, ""));
      return (priceA || 0) - (priceB || 0);
    });
  } else if (sort === "high") {
    sortedResults.sort((a, b) => {
      const priceA = typeof a.extracted_price === 'number' ? a.extracted_price : parseFloat(a.price?.replace(/[^\d.]/g, ""));
      const priceB = typeof b.extracted_price === 'number' ? b.extracted_price : parseFloat(b.price?.replace(/[^\d.]/g, ""));
      return (priceB || 0) - (priceA || 0);
    });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0 0 0' }}>
      {/* Amazon-style wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        <span style={{ fontWeight: 900, fontSize: 38, color: '#232f3e', letterSpacing: 1, fontFamily: 'Arial Black, Arial, sans-serif', position: 'relative' }}>
          AtoZ
          <span style={{ position: 'absolute', left: 12, bottom: -8, width: 70, height: 18, borderBottom: '4px solid #ff9900', borderRadius: '0 0 30px 30px', display: 'inline-block' }}></span>
        </span>
      </div>
      {/* Tab section */}
      <div style={{ display: 'flex', width: 700, maxWidth: '95vw', marginBottom: 32, borderBottom: '2px solid #eee' }}>
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          style={{
            flex: 1,
            padding: '14px 0',
            fontSize: 18,
            fontWeight: 700,
            background: activeTab === 'products' ? '#fff' : '#f6f6f6',
            color: activeTab === 'products' ? '#232f3e' : '#888',
            border: 'none',
            borderBottom: activeTab === 'products' ? '3px solid #ff9900' : '3px solid transparent',
            cursor: 'pointer',
            outline: 'none',
            transition: 'background 0.2s, color 0.2s',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          Products
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('json')}
          style={{
            flex: 1,
            padding: '14px 0',
            fontSize: 18,
            fontWeight: 700,
            background: activeTab === 'json' ? '#fff' : '#f6f6f6',
            color: activeTab === 'json' ? '#232f3e' : '#888',
            border: 'none',
            borderBottom: activeTab === 'json' ? '3px solid #ff9900' : '3px solid transparent',
            cursor: 'pointer',
            outline: 'none',
            transition: 'background 0.2s, color 0.2s',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          JSON
        </button>
      </div>
      {/* Tab content */}
      {activeTab === 'products' && (
        <>
          <form
            onSubmit={handleSearch}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 700, maxWidth: '95vw', marginBottom: 32 }}
          >
            <div style={{ display: 'flex', width: '100%', gap: 8 }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products..."
                style={{ flex: 2, padding: '14px 18px', fontSize: 18, border: '1px solid #ddd', borderRadius: '8px 0 0 8px', outline: 'none', background: '#f8fafb' }}
                autoFocus
              />
              <select
                value={location}
                onChange={e => setLocation(e.target.value)}
                style={{ flex: 1, fontSize: 16, border: '1px solid #ddd', borderRadius: 6, padding: '0 10px', background: '#f8fafb', color: '#232f3e', minWidth: 120 }}
              >
                {locationOptions.map((loc) => (
                  <option key={loc.country_code} value={loc.country_code}>{loc.country_name}</option>
                ))}
              </select>
              <button
                type="submit"
                style={{ background: '#ff9900', color: '#232f3e', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: '0 8px 8px 0', padding: '0 28px', cursor: 'pointer', transition: 'background 0.2s' }}
                disabled={searching}
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
          {error && (
            <div style={{ color: '#b12704', fontWeight: 600, marginBottom: 16, fontSize: 16 }}>{error}</div>
          )}
          {results.length > 0 && (
            <div style={{ width: 700, maxWidth: '95vw', marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <label style={{ fontSize: 15, color: '#333', marginRight: 8 }}>Sort by:</label>
              <select value={sort} onChange={e => setSort(e.target.value)} style={{ fontSize: 15, padding: '4px 10px', borderRadius: 4, border: '1px solid #ddd' }}>
                <option value="default">Default</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
            </div>
          )}
          <div style={{ width: 700, maxWidth: '95vw' }}>
            {sortedResults.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {sortedResults.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 0', borderBottom: idx !== sortedResults.length - 1 ? '1px solid #f1f1f1' : 'none' }}>
                    <img src={item.thumbnail} alt={item.title} style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 6, background: '#f6f6f6', border: '1px solid #eee', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <a href={item.product_link} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, fontSize: 17, color: '#232f3e', marginBottom: 2, textDecoration: 'none', display: 'inline-block' }}>{item.title}</a>
                      <div style={{ color: '#555', fontSize: 15, marginBottom: 4 }}>{item.source}</div>
                      {item.snippet && <div style={{ color: '#444', fontSize: 14, marginBottom: 4 }}>{item.snippet}</div>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {item.rating && renderStars(item.rating)}
                        {item.reviews && <span style={{ color: '#888', fontSize: 14 }}>({item.reviews.toLocaleString()} reviews)</span>}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#b12704', fontSize: 18, marginLeft: 8, whiteSpace: 'nowrap' }}>{item.price}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
      {activeTab === 'json' && (
        <div style={{ width: 700, maxWidth: '95vw', marginTop: 24 }}>
          <pre style={{ background: '#232f3e', color: '#fff', padding: 20, borderRadius: 10, fontSize: 15, overflowX: 'auto', maxHeight: 600 }}>
            {JSON.stringify(sortedResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
