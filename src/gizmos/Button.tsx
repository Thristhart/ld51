import { useSignal, useSignalEffect } from "@preact/signals";
import { GizmoProps } from "~/Game";
import "./Button.css";

export const Button = ({ level }: GizmoProps) => {
    const clicks = useSignal(0);
    useSignalEffect(() => {
        if (clicks.value > Math.pow(10, level.value - 1)) {
            level.value++;
        }
    });

    return (
        <button
            class="buttonGizmo"
            onClick={() => {
                clicks.value++;
            }}>
            {clicks} / {level}
        </button>
    );
};
