import BufferBackedObject from "buffer-backed-object";
import { GameStateDescription } from "~/models/gameStateDescription";

export const gameWorker = new ComlinkWorker<typeof import("./gameWorker")>(new URL("./gameWorker", import.meta.url));
export async function getGameState() {
    return new BufferBackedObject(await gameWorker.gameStateBuffer, GameStateDescription);
}
