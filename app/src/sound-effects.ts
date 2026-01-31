export type SoundEffect = {
  path: string;
  emoji: string;
  name: string;
};

export const soundEffectMap: Record<string, SoundEffect> = {
  'Air Horn': { path: 'sounds/air_horn.mp3', emoji: '📢', name: 'Air Horn' },
  'Hub baseline': { path: 'sounds/hub_baseline.mp3', emoji: '🟧', name: 'Hub baseline' },
  'Notification sound': {
    path: 'sounds/notification_sound.mp3',
    emoji: '🔔',
    name: 'Notification sound',
  },
  'Sipping Soda': { path: 'sounds/chug_with_ahhh.mp3', emoji: '🥤', name: 'Sipping Soda' },
  'Violin screech': { path: 'sounds/violin_screech.mp3', emoji: '🎻', name: 'Violin screech' },
  'Wilhelm Scream': { path: 'sounds/wilhelm_scream.mp3', emoji: '😱', name: 'Wilhelm Scream' },
};

const SoundEffectNames = Object.keys(soundEffectMap).sort(() => Math.random() - 0.5);
let currentSoundEffectIndex = 0;

export function getCurrentSoundEffect(): SoundEffect {
  return soundEffectMap[SoundEffectNames[currentSoundEffectIndex]];
}

/**
 * Advance to the next sound effect in the list
 */
export function nextSoundEffect(): void {
  currentSoundEffectIndex = (currentSoundEffectIndex + 1) % SoundEffectNames.length;
}

export function getPreviousSoundEffect(): SoundEffect | undefined {
  const previousIndex = currentSoundEffectIndex - 1;

  if (previousIndex < 0 || previousIndex >= SoundEffectNames.length) {
    return undefined;
  }
  return soundEffectMap[SoundEffectNames[previousIndex]];
}

export const playSoundEffect = (sound: SoundEffect): void => {
  const audio = new Audio(sound.path);
  audio.play().catch((error) => {
    console.error(`Failed to play sound effect "${sound.path}":`, error);
  });
};

/**
 * Play a sound effect by its name
 */
export const playSoundEffectByName = (name: string): void => {
  const sound = soundEffectMap[name];
  if (sound) {
    playSoundEffect(sound);
  }
};

/**
 * Get the emoji for a sound effect by its name
 */
export const getEmojiForSoundEffect = (name: string): string | undefined => {
  return soundEffectMap[name]?.emoji;
};
