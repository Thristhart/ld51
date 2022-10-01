import { signal, useSignalEffect } from "@preact/signals";
import { useGameTimeSeconds, useGizmoList } from "~/Game";
import "./GizmoGrid.css";
import { Wordle } from "./gizmos/Wordle";

export const GizmoGrid = () => {
    const gizmos = useGizmoList();

    const gameTimeSeconds = useGameTimeSeconds();

    useSignalEffect(() => {
        if (gameTimeSeconds.value / 10 >= gizmos.value.length) {
            gizmos.value = [...gizmos.value, { Component: Wordle, level: signal(1) }];
        }
    });

    return (
        <div class="gizmoGrid">
            {gizmos.value.map(({ Component, level }, index) => {
                return <Component key={index} level={level} />;
            })}
        </div>
    );
};
