import { AnimatePresence, motion } from 'framer-motion';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useGameStore } from './store/gameStore';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { MapScreen } from './screens/MapScreen';
import { CountryScreen } from './screens/CountryScreen';
import { MiniGameScreen } from './screens/MiniGameScreen';
import { BackpackScreen } from './screens/BackpackScreen';
import { ShopScreen } from './screens/ShopScreen';

const screenVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function App() {
  const screen = useGameStore(s => s.screen);

  return (
    <ErrorBoundary>
      <div className="relative w-full h-full overflow-hidden bg-[#1B3B6F]">
        {/* Główne ekrany (bez country — ten animuje się osobno) */}
        <AnimatePresence mode="wait">
          {screen === 'onboarding' && (
            <motion.div
              key="onboarding"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <OnboardingScreen />
            </motion.div>
          )}

          {(screen === 'map' || screen === 'country') && (
            <motion.div
              key="map"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <MapScreen />
            </motion.div>
          )}

          {screen === 'minigame' && (
            <motion.div
              key="minigame"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <MiniGameScreen />
            </motion.div>
          )}

          {screen === 'backpack' && (
            <motion.div
              key="backpack"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <BackpackScreen />
            </motion.div>
          )}

          {screen === 'shop' && (
            <motion.div
              key="shop"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <ShopScreen />
            </motion.div>
          )}

          {screen === 'passport' && (
            <motion.div
              key="passport"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center p-6">
                <div className="text-6xl mb-4">🚧</div>
                <p className="text-[#FFD93D] font-bold text-xl mb-2">Paszport</p>
                <p className="text-white/60 mb-6">Ten ekran jest w budowie…</p>
                <button
                  onClick={() => useGameStore.getState().goToMap()}
                  className="bg-[#FF8C42] text-white font-bold px-6 py-3 rounded-2xl"
                >
                  ← Wróć na mapę
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Country screen jako osobna nakładka — slajduje od dołu przez CSS transition */}
        <div
          className={`absolute inset-0 z-10 transition-transform duration-300 ease-out ${screen !== 'country' ? 'pointer-events-none' : ''}`}
          style={{ transform: screen === 'country' ? 'translateY(0)' : 'translateY(100%)' }}
        >
          <CountryScreen />
        </div>
      </div>
    </ErrorBoundary>
  );
}
