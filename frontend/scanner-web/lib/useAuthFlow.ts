import { useState, useCallback, useEffect } from 'react';
import { parseQRPayload } from './qrParser';

export type AuthState = 'idle' | 'door-select' | 'scanning' | 'verifying' | 'granted' | 'denied';

export interface ScanResult {
  success: boolean;
  userId?: string;
  door?: string;
  time?: string;
  date?: string;
  role?: string;
  error?: string;
}

export const useAuthFlow = () => {
  const [state, setState] = useState<AuthState>('idle');
  const [selectedDoor, setSelectedDoor] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const startScan = useCallback(() => {
    setState('door-select');
  }, []);

  const selectDoor = useCallback((door: string) => {
    setSelectedDoor(door);
    setState('scanning');
  }, []);

  const cancelSelection = useCallback(() => {
    setState('idle');
    setSelectedDoor(null);
  }, []);

  const handleScanSuccess = useCallback(async (qrData: string) => {
    if (state !== 'scanning') return;
    
    setState('verifying');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: qrData,
          door: selectedDoor
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'granted') {
        setResult({
          success: true,
          userId: data.value,
          door: selectedDoor || undefined,
          time: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          }),
          role: data.role
        });
        setState('granted');
      } else {
        setResult({
          success: false,
          error: data.message || 'Access denied'
        });
        setState('denied');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      setResult({
        success: false,
        error: 'Failed to connect to server'
      });
      setState('denied');
    }
  }, [state, selectedDoor]);

  const reset = useCallback(() => {
    setState('idle');
    setSelectedDoor(null);
    setResult(null);
  }, []);

  // Auto-reset from granted or denied
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state === 'granted') {
      timer = setTimeout(reset, 8000); // 8 seconds for granted to show card
    } else if (state === 'denied') {
      timer = setTimeout(reset, 3000); // 3 seconds for denied
    }
    return () => clearTimeout(timer);
  }, [state, reset]);

  return {
    state,
    selectedDoor,
    result,
    startScan,
    selectDoor,
    cancelSelection,
    handleScanSuccess,
    reset
  };
};
