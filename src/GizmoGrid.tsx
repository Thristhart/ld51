import { useSignalEffect } from "@preact/signals";
import { useGameTimeSeconds, useGizmoList } from "~/Game";
import "./GizmoGrid.css";
import { Timer } from "./gizmos/Timer";

export const GizmoGrid = () => {
    const gizmos = useGizmoList();

    const gameTimeSeconds = useGameTimeSeconds();

    useSignalEffect(() => {
        if (gameTimeSeconds.value / 10 >= gizmos.value.length) {
            gizmos.value = [...gizmos.value, Timer];
        }
    });

    return (
        <div class="gizmoGrid">
            {gizmos.value.map((GizmoComponent, index) => {
                return <GizmoComponent key={index} />;
            })}
        </div>
    );
};
