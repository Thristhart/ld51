import { Signal, signal, useComputed, useSignal } from "@preact/signals";
import { ComponentChildren, createContext, FunctionComponent } from "preact";
import { useContext, useState } from "preact/hooks";
import { GizmoGrid } from "~/GizmoGrid";
import { Timer } from "~/gizmos/Timer";
import { AudioProvider } from "./components/AudioContext";
import { Button } from "./gizmos/Button";
import { Maze } from "./gizmos/Maze";
import { Minesweeper } from "./gizmos/Minesweeper";
import { Numbers } from "./gizmos/Numbers";
import { Rhythm } from "./gizmos/Rhythm";
import { Wires } from "./gizmos/Wires";
import { Wordle } from "./gizmos/Wordle";

export interface GizmoProps {
    readonly level: Signal<number>;
}
export interface Gizmo {
    readonly Component: FunctionComponent<GizmoProps>;
    readonly level: Signal<number>;
    readonly id: string;
}

let lastTick = performance.now();
let gameTime = signal(0);
function updateGameTime(now: number) {
    const delta = now - lastTick;
    gameTime.value += delta;
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
    const gizmos = useSignal<Gizmo[]>([
        { Component: Timer, level: signal(1), id: "timer" },
        { Component: Numbers, level: signal(1), id: "numbers" },
        { Component: Button, level: signal(1), id: "button" },
        { Component: Wordle, level: signal(1), id: "wordle" },
        { Component: Wires, level: signal(6), id: "wires" },
        { Component: Rhythm, level: signal(1), id: "rhythm" },
        { Component: Maze, level: signal(1), id: "maze" },
        { Component: Minesweeper, level: signal(1), id: "minesweeper" },
    ]);

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

export const useGameTime = () => useGameState().gameTime;

export const useGameTimeSeconds = () => {
    const time = useGameTime();
    return useComputed(() => Math.floor(time.value / 1000));
};

export const Game = () => {
    return (
        <GameStateProvider>
            <AudioProvider>
                <GizmoGrid />
            </AudioProvider>
        </GameStateProvider>
    );
};
