export type ButtonName = 'buzz' | 'blue' | 'orange' | 'green' | 'yellow';

export const GAME_STATE_TUTORIAL = 0;
export const GAME_STATE_SOUND_SELECT = 1;
export const GAME_STATE_GAME = 2;
export const GAME_STATE_RESULTS = 3;

let gameState = GAME_STATE_TUTORIAL;
export const getGameState = () => gameState;

type SceneInitCallback = () => void;
const sceneInitCallbacks: Map<number, SceneInitCallback> = new Map();

export const registerSceneInit = (state: number, callback: SceneInitCallback) => {
  sceneInitCallbacks.set(state, callback);
};

export const setGameState = (state: number) => {
  gameState = state;
  const initCallback = sceneInitCallbacks.get(state);
  if (initCallback) {
    initCallback();
  }
};
