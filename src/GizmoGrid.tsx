import { signal, useSignal, useSignalEffect } from "@preact/signals";
import { Gizmo, useGameTimeSeconds, useGizmoList } from "~/Game";
import { useLevelUpSound } from "./components/AudioContext";
import "./GizmoGrid.css";
import { Wordle } from "./gizmos/Wordle";

interface GizmoWrapperProps {
    readonly gizmo: Gizmo;
}
const GizmoWrapper = ({ gizmo }: GizmoWrapperProps) => {
    const { Component, level } = gizmo;
    const previousLevel = useSignal(level.peek());
    const levelUpSound = useLevelUpSound();
    useSignalEffect(() => {
        if (level.value > previousLevel.peek()) {
            levelUpSound.play();
        }
        previousLevel.value = level.peek();
    });
    return <Component level={level} />;
};

export const GizmoGrid = () => {
    const gizmos = useGizmoList();

    const gameTimeSeconds = useGameTimeSeconds();

    useSignalEffect(() => {
        if (gameTimeSeconds.value / 10 >= gizmos.value.length && gizmos.value.length < 9) {
            gizmos.value = [...gizmos.value, { Component: Wordle, level: signal(1) }];
        }
    });

    return (
        <div class="gizmoGrid">
            {gizmos.value.map((gizmo, index) => {
                return <GizmoWrapper key={index} gizmo={gizmo} />;
            })}
        </div>
    );
};
