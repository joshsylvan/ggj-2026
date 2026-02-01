export type SoundEffect = {
  path: string;
  emoji: string;
  name: string;
  noise: number;
  audio?: HTMLAudioElement;
};


const SOUNDS: SoundEffect[] = [
  { path: 'sounds/air_horn.mp3', emoji: '📢', name: 'Discrete Horn', noise: 3 },
  { path: 'sounds/hub_baseline.mp3', emoji: '🟧', name: 'Funky baseline', noise: 2 },
  {
    path: 'sounds/notification_sound.mp3',
    emoji: '🔔',
    name: 'Notification sound',
    noise: 1,
  },
  { path: 'sounds/wilhelm_scream.mp3', emoji: '😱', name: 'Scream', noise: 2 },
  { path: 'sounds/metal-pipe-clang.mp3', emoji: '🔨', name: 'A Pipe', noise: 3 },
  { path: 'sounds/bass-boostedyoda-death-sound.mp3', emoji: '👽', name: 'Yoda with bass', noise: 3 },
  { path: 'sounds/disgusting.mp3', emoji: '👩‍👦', name: 'Concerned Parent', noise: 2 },
  { path: 'sounds/windows.mp3', emoji: '💻', name: 'Computer Sounds', noise: 1 },
  { path: 'sounds/fartmemereloaded.mp3', emoji: '🧑‍⚕️', name: 'Healthy Gut', noise: 2 },
  { path: 'sounds/some-all-star.mp3', emoji: '🤢', name: 'Some', noise: 2 },
  { path: 'sounds/sea-shanty-2.mp3', emoji: '🏴‍☠️', name: 'Pirate Music', noise: 2 },
  { path: 'sounds/shut-up-mom.mp3', emoji: '🤫', name: 'Silence Mother', noise: 3 },
  { path: 'sounds/not-the-bees.mp3', emoji: '🐝', name: 'Bees', noise: 2 },
  { path: 'sounds/tearingmeapart.mp3', emoji: '💃', name: 'Oh Lisa', noise: 2 },
  { path: 'sounds/lemon-grab.mp3', emoji: '🍋', name: 'Lemon Man', noise: 2 },
  { path: 'sounds/drinking-schlurping.mp3', emoji: '🥤', name: 'I need more soda', noise: 1 },
  { path: 'sounds/nookie.mp3', emoji: '🍪', name: 'Solid Biscuit', noise: 3 },
];

export const soundEffectMap: Record<string, SoundEffect> = SOUNDS.reduce<Record<string, SoundEffect>>((pre, cur) => {
  pre[cur.name] = cur;
  pre[cur.name].audio = new Audio(cur.path);
  return pre;
}, {})

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

export const stopSoundEffect = (soundName: string): void => {
  const audio = soundEffectMap[soundName].audio;
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}
export const playSoundEffect = (sound: SoundEffect): void => {
  // Precache the sounds
  if (soundEffectMap[sound.name].audio) {
    soundEffectMap[sound.name].audio?.play();
    return;
  }
  console.log('should not be here');
  soundEffectMap[sound.name].audio?.play();
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

export const getSoundEffectDuration = (name: string): number => {
  const sound = soundEffectMap[name];
  if (sound) {
    return (sound.audio?.duration ?? 0) * 1000;
  }
  return 0
};

/**
 * Get the emoji for a sound effect by its name
 */
export const getEmojiForSoundEffect = (name: string): string | undefined => {
  return soundEffectMap[name]?.emoji;
};
