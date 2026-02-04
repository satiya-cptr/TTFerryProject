'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Home() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Test Firestore connection
    const testConnection = async () => {
      try {
        // Try to access Firestore
        await getDocs(collection(db, 'test'));
        setConnected(true);
        console.log('Firebase connected!');
      } catch (error) {
        console.error('Firebase connection error:', error);
      }
    };

    testConnection();
  }, []);

  return (
    <main className="min-h-screen p-24">
      <h1 className="text-4xl font-bold">TT Ferry Project</h1>
      <p className="mt-4">
        Firebase Status: {connected ? '✅ Connected' : '⏳ Connecting...'}
      </p>
    </main>
  );
}