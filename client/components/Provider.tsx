import { AuthProvider } from '@/contexts/AuthContext';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WebOnlyColorSchemeUpdater } from './ColorSchemeUpdater';
import { WebOnlyPrettyScrollbar } from './PrettyScrollbar'
import { HeroUINativeProvider } from '@/heroui';

function Provider({ children }: { children: ReactNode }) {
  return <WebOnlyColorSchemeUpdater>
    <WebOnlyPrettyScrollbar>
      <AuthProvider>
        <PlayerProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <HeroUINativeProvider>
              {children}
            </HeroUINativeProvider>
          </GestureHandlerRootView>
        </PlayerProvider>
      </AuthProvider>
    </WebOnlyPrettyScrollbar>
  </WebOnlyColorSchemeUpdater>
}

export {
  Provider,
}
