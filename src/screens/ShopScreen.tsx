import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { SHOP_ITEMS } from '@/data/shopItems';

export function ShopScreen() {
  const goToMap = useGameStore(s => s.goToMap);
  const coins = useGameStore(s => s.progress.coins);
  const purchasedItems = useGameStore(s => s.progress.purchasedItems);
  const purchaseItem = useGameStore(s => s.purchaseItem);
  const spendCoins = useGameStore(s => s.spendCoins);

  function handleBuy(itemId: string, cost: number) {
    if (coins < cost || purchasedItems.includes(itemId)) return;
    spendCoins(cost);
    purchaseItem(itemId);
  }

  return (
    <div className="flex flex-col h-full bg-[#1B3B6F]">
      <div className="bg-[#152d55] px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={goToMap}
            className="bg-white/10 rounded-xl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Wróć na mapę"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#FFD93D]">🛍️ Sklepik</h1>
            <p className="text-white/60 text-sm">Wydaj monety na ulepszenia</p>
          </div>
          <div className="bg-[#FFD93D]/20 px-3 py-1.5 rounded-xl">
            <span className="text-[#FFD93D] font-bold">{coins} 🪙</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.map((item, i) => {
            const owned = purchasedItems.includes(item.id);
            const canAfford = coins >= item.cost;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl p-4 flex flex-col gap-2 ${
                  owned ? 'bg-[#7FB069]/20 border border-[#7FB069]/30' : 'bg-white/10'
                }`}
              >
                <span className="text-4xl">{item.icon}</span>
                <p className="text-white font-bold text-sm">{item.name}</p>
                <p className="text-white/50 text-xs">{item.description}</p>
                {owned ? (
                  <span className="text-[#7FB069] text-sm font-bold">✓ Posiadasz</span>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBuy(item.id, item.cost)}
                    disabled={!canAfford}
                    className={`mt-auto py-2 rounded-xl text-sm font-bold transition-colors min-h-[36px] ${
                      canAfford
                        ? 'bg-[#FF8C42] text-white'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    {item.cost} 🪙
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
