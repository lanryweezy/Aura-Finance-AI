import { useEffect } from 'react';

type KeyCombo = string;

export const useHotkeys = (hotkeys: Record<KeyCombo, () => void>) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isMod = event.ctrlKey || event.metaKey;

            for (const combo in hotkeys) {
                const parts = combo.toLowerCase().split('+');
                const key = parts[parts.length - 1];
                const needsMod = parts.includes('cmd') || parts.includes('ctrl') || parts.includes('mod');
                const needsShift = parts.includes('shift');
                const needsAlt = parts.includes('alt');

                if (
                    event.key.toLowerCase() === key &&
                    (needsMod ? isMod : !isMod) &&
                    (needsShift ? event.shiftKey : !event.shiftKey) &&
                    (needsAlt ? event.altKey : !event.altKey)
                ) {
                    event.preventDefault();
                    hotkeys[combo]();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hotkeys]);
};
