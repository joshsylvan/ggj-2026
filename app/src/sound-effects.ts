import type { ButtonEvent } from './state';

const soundEffectMap: Record<string, string> = {
  'Air Horn': 'sounds/air_horn.mp3',
  'Hub baseline': 'sounds/hub_baseline.mp3',
  'Notification sound': 'sounds/notification_sound.mp3',
  'Sipping Soda': 'sounds/chug_with_ahhh.mp3',
  'Violin screech': 'sounds/violin_screech.mp3',
  'Wilhelm Scream': 'sounds/wilhelm_scream.mp3',
};

const SoundEffectNames = Object.keys(soundEffectMap).sort(() => Math.random() - 0.5);
let currentSoundEffectIndex = 0;

export function getCurrentSoundEffect(): string {
  return SoundEffectNames[currentSoundEffectIndex];
}

const getBuzzerKey = (buzzer: ButtonEvent): string => {
  return `${buzzer.controller}-${buzzer.button}`;
};

const controllerSoundEffectMap: Map<string, keyof typeof soundEffectMap> = new Map();

const mapBuzzerToSoundEffect = (
  buzzer: ButtonEvent,
  soundEffect: keyof typeof soundEffectMap
): void => {
  controllerSoundEffectMap.set(getBuzzerKey(buzzer), soundEffect);
  window.console.log(
    `Mapped buzzer ${buzzer.controller}-${buzzer.button} to sound effect "${soundEffect}"`
  );
};

const playSoundEffect = (button: ButtonEvent): void => {
  const soundPath = soundEffectMap[controllerSoundEffectMap.get(getBuzzerKey(button)) ?? ''];
  if (soundPath) {
    const audio = new Audio(soundPath);
    audio.play().catch((error) => {
      console.error(`Failed to play sound effect "${soundPath}":`, error);
    });
  } else {
    console.warn(`Sound effect "${soundPath}" not found.`);
  }
};

export const setOrPlaySoundEffect = (buzzer: ButtonEvent | undefined): void => {
  if (!buzzer) {
    console.warn('No buzzer event provided.');
    return;
  }
  if (controllerSoundEffectMap.has(getBuzzerKey(buzzer))) {
    playSoundEffect(buzzer);
    return;
  }
  mapBuzzerToSoundEffect(buzzer, getCurrentSoundEffect());
  currentSoundEffectIndex = (currentSoundEffectIndex + 1) % SoundEffectNames.length;
};
