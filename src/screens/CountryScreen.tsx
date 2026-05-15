import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// motion używany dla AnimatePresence wewnątrz zakładek oraz przycisków whileTap
import { useGameStore } from '@/store/gameStore';
import { getCountryById } from '@/data';
import { useSpeech } from '@/hooks/useSpeech';

type Tab = 'info' | 'facts' | 'phrases';

export function CountryScreen() {
  const [tab, setTab] = useState<Tab>('info');
  const [factRead, setFactRead] = useState<Set<string>>(new Set());

  const countryId = useGameStore(s => s.selectedCountryId);
  const goBack = useGameStore(s => s.goBack);
  const goToScreen = useGameStore(s => s.goToScreen);
  const collectFact = useGameStore(s => s.collectFact);
  const trackFood = useGameStore(s => s.trackFood);
  const trackAnimal = useGameStore(s => s.trackAnimal);
  const trackLanguage = useGameStore(s => s.trackLanguage);
  const collectedFacts = useGameStore(s => s.progress.collectedFacts);

  const { speak, isSupported } = useSpeech();

  const country = countryId ? getCountryById(countryId) : null;

  if (!country) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-white/60 mb-4">Nie znaleziono kraju</p>
          <button
            onClick={goBack}
            className="bg-[#FF8C42] text-white px-6 py-3 rounded-2xl font-bold"
          >
            ← Wróć
          </button>
        </div>
      </div>
    );
  }

  function handleFactRead(factId: string, factText: string) {
    setFactRead(prev => new Set(prev).add(factId));
    collectFact(factId);
    if (isSupported) speak(factText);
  }

  function handleFoodTrack() {
    if (!country) return;
    country.foods.forEach(f => trackFood(f));
  }

  function handleAnimalTrack() {
    if (!country) return;
    country.animals.forEach(a => trackAnimal(a));
  }

  function handlePhraseLearn() {
    if (!country) return;
    trackLanguage(country.id);
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'info', label: 'Kraj', icon: '🗺️' },
    { id: 'facts', label: 'Ciekawostki', icon: '💡' },
    { id: 'phrases', label: 'Język', icon: '💬' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#1B3B6F]">
      {/* Nagłówek */}
      <div className="relative bg-[#152d55] px-4 pt-4 pb-3">
        <button
          onClick={goBack}
          className="absolute left-4 top-4 bg-white/10 rounded-xl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Wróć na mapę"
        >
          ←
        </button>

        <div className="text-center">
          <div className="text-5xl mb-1">{country.flagEmoji}</div>
          <h1 className="text-2xl font-bold text-[#FFD93D]">{country.namePL}</h1>
          <p className="text-white/60 text-sm">
            {country.nameLocal} · {country.continent}
          </p>
        </div>
      </div>

      {/* Zakładki */}
      <div className="flex bg-[#152d55] border-t border-white/10">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-3 text-sm font-medium transition-colors min-h-[44px] ${
              tab === t.id ? 'text-[#FFD93D] border-b-2 border-[#FFD93D]' : 'text-white/60'
            }`}
            aria-selected={tab === t.id}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Zawartość */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {tab === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-4"
            >
              {/* Dane podstawowe */}
              <div className="bg-white/10 rounded-2xl p-4 grid grid-cols-2 gap-3">
                {[
                  { label: 'Stolica', value: country.capital, icon: '🏙️' },
                  {
                    label: 'Populacja',
                    value: country.population.toLocaleString('pl-PL'),
                    icon: '👥',
                  },
                  { label: 'Język', value: country.languages.join(', '), icon: '🗣️' },
                  { label: 'Waluta', value: country.currency, icon: '💰' },
                ].map(item => (
                  <div key={item.label} className="flex flex-col gap-0.5">
                    <span className="text-white/50 text-xs">
                      {item.icon} {item.label}
                    </span>
                    <span className="text-white font-medium text-sm">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Słynne miejsce */}
              <div className="bg-white/10 rounded-2xl p-4">
                <h3 className="text-[#FFD93D] font-bold mb-2">🏛️ Słynne miejsce</h3>
                <p className="text-white font-medium">{country.famousPlace.name}</p>
                <p className="text-white/70 text-sm mt-1">{country.famousPlace.description}</p>
              </div>

              {/* Potrawy */}
              <div className="bg-white/10 rounded-2xl p-4" onClick={handleFoodTrack}>
                <h3 className="text-[#FF8C42] font-bold mb-2">🍽️ Smaki</h3>
                <div className="flex flex-wrap gap-2">
                  {country.foods.map(food => (
                    <span
                      key={food}
                      className="bg-[#FF8C42]/20 text-white px-3 py-1.5 rounded-xl text-sm"
                    >
                      {food}
                    </span>
                  ))}
                </div>
              </div>

              {/* Zwierzęta */}
              <div className="bg-white/10 rounded-2xl p-4" onClick={handleAnimalTrack}>
                <h3 className="text-[#7FB069] font-bold mb-2">🐾 Zwierzęta</h3>
                <div className="flex flex-wrap gap-2">
                  {country.animals.map(animal => (
                    <span
                      key={animal}
                      className="bg-[#7FB069]/20 text-white px-3 py-1.5 rounded-xl text-sm"
                    >
                      {animal}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'facts' && (
            <motion.div
              key="facts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-3"
            >
              <p className="text-white/50 text-sm text-center">
                Przeczytano:{' '}
                {
                  country.facts.filter((_, i) => collectedFacts.includes(`${country.id}_fact_${i}`))
                    .length
                }
                /{country.facts.length}
              </p>
              {country.facts.map((fact, i) => {
                const factId = `${country.id}_fact_${i}`;
                const isRead = collectedFacts.includes(factId) || factRead.has(factId);
                return (
                  <motion.div
                    key={factId}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFactRead(factId, fact)}
                    className={`rounded-2xl p-4 flex gap-3 cursor-pointer transition-colors ${
                      isRead ? 'bg-[#7FB069]/20 border border-[#7FB069]/30' : 'bg-white/10'
                    }`}
                    role="button"
                    aria-label={`Ciekawostka ${i + 1}${isRead ? ' (przeczytana)' : ''}`}
                  >
                    <span className="text-2xl flex-shrink-0">{isRead ? '✅' : '💡'}</span>
                    <div>
                      <p className="text-white text-sm leading-relaxed">{fact}</p>
                      {isSupported && (
                        <p className="text-white/40 text-xs mt-1">
                          {isRead ? 'Kliknij, by odsłuchać ponownie' : 'Kliknij, by odsłuchać 🔊'}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {tab === 'phrases' && (
            <motion.div
              key="phrases"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-3"
              onClick={handlePhraseLearn}
            >
              <p className="text-white/50 text-sm text-center mb-2">
                Kilka słów po {country.languages[0] ?? 'lokalnym języku'}
              </p>
              {country.phrases.map((phrase, i) => (
                <motion.div
                  key={i}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => isSupported && speak(phrase.local)}
                  className="bg-white/10 rounded-2xl p-4 cursor-pointer"
                  role="button"
                  aria-label={`Zwrot: ${phrase.polish}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[#FFD93D] text-xl font-bold">{phrase.local}</p>
                      <p className="text-white/50 text-sm italic mt-0.5">[{phrase.phonetic}]</p>
                    </div>
                    <span className="text-2xl">🔊</span>
                  </div>
                  <p className="text-white mt-2 font-medium">= {phrase.polish}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Przycisk misji */}
      <div className="p-4 bg-[#152d55] border-t border-white/10">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => goToScreen('minigame')}
          className="w-full bg-[#FF8C42] text-white font-bold text-lg py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
        >
          🎮 Rozpocznij misję
          <span className="text-sm font-normal opacity-80">+10–50 🪙</span>
        </motion.button>
      </div>
    </div>
  );
}
