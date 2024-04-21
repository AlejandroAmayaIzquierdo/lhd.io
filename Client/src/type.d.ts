declare namespace GAME {
  interface Scene {
    id: string;
    load(): void;
    init(): void;
  }

  interface EmitUserData {
    userID: string;
    x: number;
    y: number;
    visibleArea?: { width: number; height: number };
  }

  interface PlayerData {
    userID: number;
    x: number;
    y: number;
  }

  interface PayLoadUpdateEvent {
    players: PlayerData[];
    entities?: { x: number; y: number }[];
  }
}
