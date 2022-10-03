import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import { GizmoProps } from "~/Game";
import "./Button.css";
import { useWireOtherGizmoContext } from "./Wires";

function getClicksForLevel(level: number) {
    return 3 ** (level - 1);
}

export const Button = ({ level }: GizmoProps) => {
    const clicks = useSignal(0);
    const targetClicks = useComputed(() => getClicksForLevel(level.value));
    useSignalEffect(() => {
        if (clicks.value >= targetClicks.value) {
            level.value = level.peek() + 1;
            clicks.value = 0;
        }
    });
    const wireOtherGizmo = useWireOtherGizmoContext();
    useSignalEffect(() => {
        wireOtherGizmo.buttonNumber = clicks.value;
    });

    return (
        <div class="bigRedButton">
            <button
                class="buttonGizmo"
                onClick={() => {
                    clicks.value++;
                }}
                style={{ "--target": targetClicks.value, "--clicks": clicks.value }}>
                {targetClicks.value > 1 && clicks}
            </button>
        </div>
    );
};
