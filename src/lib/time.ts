import { useEffect, useState } from 'react';

export function nowMs() {
  return Date.now();
}

export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(nowMs);
  useEffect(() => {
    const id = setInterval(() => setNow(nowMs()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
