import { Signal, useSignal } from "@preact/signals";
import { ComponentChildren, createContext, FunctionComponent } from "preact";
import { useContext, useState } from "preact/hooks";
import { GizmoGrid } from "~/GizmoGrid";
import { Timer } from "~/gizmos/Timer";

interface Gizmo extends FunctionComponent {}

let lastTick = performance.now();
let gameTimeNumber = 0;
function updateGameTime(now: number) {
    const delta = now - lastTick;
    gameTimeNumber += delta;
    lastTick = now;

    requestAnimationFrame(updateGameTime);
}
requestAnimationFrame(updateGameTime);

interface GameState {
    gizmos: Signal<Gizmo[]>;
    gameTime: Signal<number>;
}
const GameStateContext = createContext<GameState | null>(null);
const GameStateProvider = ({ children }: { children: ComponentChildren }) => {
    const gizmos = useSignal<Gizmo[]>([Timer]);
    const gameTime = useSignal<number>(gameTimeNumber);

    return <GameStateContext.Provider value={useState({ gizmos, gameTime })[0]}>{children}</GameStateContext.Provider>;
};

export const useGameState = () => {
    const state = useContext(GameStateContext);
    if (!state) {
        throw new Error("useGameState must be used within a GameStateProvider");
    }
    return state;
};

export const useGizmoList = () => useGameState().gizmos;

export const Game = () => {
    return (
        <GameStateProvider>
            <GizmoGrid />
        </GameStateProvider>
    );
};
