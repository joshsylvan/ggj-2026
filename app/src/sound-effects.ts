export type SoundEffect = {
  path: string;
  emoji: string;
  name: string;
  audio?: HTMLAudioElement;
};


const SOUNDS: SoundEffect[] = [
  { path: 'sounds/air_horn.mp3', emoji: '📢', name: 'Discrete Horn' },
  { path: 'sounds/hub_baseline.mp3', emoji: '🟧', name: 'Funky baseline' },
  {
    path: 'sounds/notification_sound.mp3',
    emoji: '🔔',
    name: 'Notification sound',
  },
  { path: 'sounds/wilhelm_scream.mp3', emoji: '😱', name: 'Scream' },
  { path: 'sounds/metal-pipe-clang.mp3', emoji: '🔨', name: 'A Pipe' },
  { path: 'sounds/bass-boostedyoda-death-sound.mp3', emoji: '👽', name: 'Yoda with bass' },
  { path: 'sounds/disgusting.mp3', emoji: '👩‍👦', name: 'Concerned Parent' },
  { path: 'sounds/windows.mp3', emoji: '💻', name: 'Computer Sounds' },
  { path: 'sounds/fartmemereloaded.mp3', emoji: '🧑‍⚕️', name: 'Healthy Gut' },
  { path: 'sounds/some-all-star.mp3', emoji: '🤢', name: 'Some' },
  { path: 'sounds/sea-shanty-2.mp3', emoji: '🏴‍☠️', name: 'Pirate Music' },
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

/**
 * Get the emoji for a sound effect by its name
 */
export const getEmojiForSoundEffect = (name: string): string | undefined => {
  return soundEffectMap[name]?.emoji;
};
