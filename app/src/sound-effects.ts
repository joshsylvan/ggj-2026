import { getPlayerState } from './player-state';
import type { ButtonEvent } from './state';

type SoundEffect = {
  path: string;
  emoji: string;
};

export const soundEffectMap: Record<string, SoundEffect> = {
  'Air Horn': { path: 'sounds/air_horn.mp3', emoji: '📢' },
  'Hub baseline': { path: 'sounds/hub_baseline.mp3', emoji: '🟧' },
  'Notification sound': { path: 'sounds/notification_sound.mp3', emoji: '🔔' },
  'Sipping Soda': { path: 'sounds/chug_with_ahhh.mp3', emoji: '🥤' },
  'Violin screech': { path: 'sounds/violin_screech.mp3', emoji: '🎻' },
  'Wilhelm Scream': { path: 'sounds/wilhelm_scream.mp3', emoji: '😱' },
};

const SoundEffectNames = Object.keys(soundEffectMap).sort(() => Math.random() - 0.5);
let currentSoundEffectIndex = 0;

export function getCurrentSoundEffect(): string {
  return SoundEffectNames[currentSoundEffectIndex];
}

const playSoundEffect = (button: ButtonEvent): void => {
  const soundEffect = getPlayerState(button.controller).getSoundEffect(button.button);
  if (soundEffect) {
    const audio = new Audio(soundEffectMap[soundEffect].path);
    audio.play().catch((error) => {
      console.error(`Failed to play sound effect "${soundEffectMap[soundEffect].path}":`, error);
    });
  }
};
