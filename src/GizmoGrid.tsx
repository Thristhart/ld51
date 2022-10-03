import { Signal, useSignal, useSignalEffect } from "@preact/signals";
import { Howl } from "howler";
import { useMemo } from "preact/hooks";
import { Gizmo, useGameTimeSeconds, useGizmoList } from "~/Game";
import { useLevelUpSound } from "./components/AudioContext";
import "./GizmoGrid.css";
import { WireOtherGizmoContext } from "./gizmos/Wires";

import classNames from "classnames";
import yaySoundPath from "~/assets/audio/yay.mp3";
const yaySound = new Howl({ src: yaySoundPath, volume: 0.4 });
interface GizmoWrapperProps {
    readonly gizmo: Gizmo;
    readonly completedCount: Signal<number>;
}
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

    // useSignalEffect(() => {
    //     if (gameTimeSeconds.value / 10 >= gizmos.value.length && gizmos.value.length < 9) {
    //         gizmos.value = [...gizmos.value, { Component: Wordle, level: signal(1), id: "wordle" }];
    //     }
    // });

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
