export const SMITH_TITLES = {
  1: 'Soot-Stained Novice',
  10: 'Copper Clapper',
  30: 'Iron Shaper',
  50: 'Steel Warden',
  70: 'Mithril Architect',
  90: 'Avatar of the Anvil',
  100: 'The Eternal Forgemaster'
};

export const getMultiplier = (minutes) => {
  if (minutes >= 120) return 1.5;
  if (minutes >= 60) return 1.2;
  return 1.0;
};

export const calculatePotentialXP = (minutes, isFlawless = true) => {
  const baseXP = minutes * 10;
  const multiplier = getMultiplier(minutes);
  const flawlessMultiplier = isFlawless ? 1.5 : 1.0;
  return Math.floor(baseXP * multiplier * flawlessMultiplier);
};

export const getLevelFromXP = (xp) => {
  if (xp === undefined || xp === null || xp <= 0) return 1;
  const level = Math.floor(Math.sqrt(Math.max(0, xp) / 60));
  return Math.max(1, level);
};

export const getXPForLevel = (level) => {
  if (level < 1) return 0;
  return 60 * (level ** 2);
};

export const getTitleForLevel = (level) => {
  if (level >= 100) return SMITH_TITLES[100];
  if (level >= 90) return SMITH_TITLES[90];
  if (level >= 70) return SMITH_TITLES[70];
  if (level >= 50) return SMITH_TITLES[50];
  if (level >= 30) return SMITH_TITLES[30];
  if (level >= 10) return SMITH_TITLES[10];
  return SMITH_TITLES[1];
};
