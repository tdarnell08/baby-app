import { useEffect } from 'react';
import { AppState } from 'react-native';
import { setReminderPremium, syncReminders } from '@/lib/reminders';
import { usePremium } from '@/providers/PremiumProvider';

export function RemindersRunner() {
  const { isPremium, ready } = usePremium();

  useEffect(() => {
    if (!ready) return;
    setReminderPremium(isPremium);
    void syncReminders();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void syncReminders();
    });
    return () => sub.remove();
  }, [isPremium, ready]);

  return null;
}
