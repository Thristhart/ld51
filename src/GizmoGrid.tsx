import { signal, Signal, useSignal, useSignalEffect } from "@preact/signals";
import { Howl } from "howler";
import { useMemo } from "preact/hooks";
import { Gizmo, useGameTimeSeconds, useGizmoList } from "~/Game";
import { useLevelUpSound } from "./components/AudioContext";
import "./GizmoGrid.css";
import { WireOtherGizmoContext, Wires } from "./gizmos/Wires";

import classNames from "classnames";
import yaySoundPath from "~/assets/audio/yay.mp3";
import { Button } from "./gizmos/Button";
import { Maze } from "./gizmos/Maze";
import { Minesweeper } from "./gizmos/Minesweeper";
import { Numbers } from "./gizmos/Numbers";
import { Rhythm } from "./gizmos/Rhythm";
import { Stacker } from "./gizmos/Stacker";
import { Wordle } from "./gizmos/Wordle";
const yaySound = new Howl({ src: yaySoundPath, volume: 0.4 });
interface GizmoWrapperProps {
    readonly gizmo: Gizmo;
    readonly completedCount: Signal<number>;
}

const moduleOrder = [
    {
        component: Button,
        id: "button",
    },
    {
        component: Numbers,
        id: "numbers",
    },
    {
        component: Wordle,
        id: "wordle",
    },
    {
        component: Maze,
        id: "maze",
    },
    {
        component: Rhythm,
        id: "rhythm",
    },
    {
        component: Wires,
        id: "wires",
    },
    {
        component: Minesweeper,
        id: "minesweeper",
    },
    {
        component: Stacker,
        id: "stacker",
    },
];
const GizmoWrapper = ({ gizmo, completedCount }: GizmoWrapperProps) => {
    const { Component, level } = gizmo;
    const previousLevel = useSignal(level.peek());
    const levelUpSound = useLevelUpSound();
    useSignalEffect(() => {
        if (level.value > previousLevel.peek() && gizmo.id !== "timer") {
            levelUpSound.play();
        }
        previousLevel.value = level.peek();
    });
    useSignalEffect(() => {
        if (completed.value) {
            yaySound.play();
            completedCount.value = completedCount.peek() + 1;
        }
    });
    const completed = useSignal(false);
    return <Component level={level} completed={completed} />;
};

export const GizmoGrid = () => {
    const gizmos = useGizmoList();

    const gameTimeSeconds = useGameTimeSeconds();

    useSignalEffect(() => {
        const realGizmos = gizmos.value.filter((x) => x.id != "blank");
        if (gameTimeSeconds.value / 10 >= realGizmos.length && realGizmos.length < 9) {
            if (moduleOrder.length > 0) {
                const nextModule = moduleOrder.splice(0, 1)[0];
                gizmos.value.splice(realGizmos.length, 1, {
                    Component: nextModule.component,
                    level: signal(1),
                    id: nextModule.id,
                });
                gizmos.value = [...gizmos.value];
            }
        }
    });

    const completedCount = useSignal(0);

    useSignalEffect(() => {
        const timer = gizmos.value.find((g) => g.id === "timer");
        if (timer) {
            timer.level.value = completedCount.value + 1;
            if (timer.level.value >= 8) {
                gizmos.value = [];
            }
        }
    });

    return (
        <div class={classNames("gizmoGrid", gizmos.value.length === 0 && "win")}>
            <WireOtherGizmoContext.Provider
                value={useMemo(
                    () => ({
                        wordleWord: "",
                        minesweeperCorner: false,
                        buttonNumber: 0,
                    }),
                    []
                )}>
                {gizmos.value.map((gizmo, index) => {
                    return <GizmoWrapper key={index} gizmo={gizmo} completedCount={completedCount} />;
                })}
            </WireOtherGizmoContext.Provider>
        </div>
    );
};
