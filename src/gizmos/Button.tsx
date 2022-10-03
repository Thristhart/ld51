import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import cn from "classnames";
import { GizmoProps } from "~/Game";
import "./Button.css";
import { useWireOtherGizmoContext } from "./Wires";

function getClicksForLevel(level: number) {
    return 3 ** (level - 1);
}

export const Button = ({ level, completed }: GizmoProps) => {
    const clicks = useSignal(0);
    const targetClicks = useComputed(() => getClicksForLevel(level.value));
    useSignalEffect(() => {
        if (clicks.value >= targetClicks.value) {
            if (level.peek() === 5) {
                completed.value = true;
                return;
            }
            level.value = level.peek() + 1;
            clicks.value = 0;
        }
    });
    const wireOtherGizmo = useWireOtherGizmoContext();
    useSignalEffect(() => {
        wireOtherGizmo.buttonNumber = clicks.value;
    });

    return (
        <div class={cn("bigRedButton", completed.value && "completed")}>
            <button
                class="buttonGizmo"
                onClick={() => {
                    if (completed.value) {
                        return;
                    }
                    clicks.value++;
                }}
                style={{ "--target": targetClicks.value, "--clicks": clicks.value }}>
                {targetClicks.value > 1 && clicks}
            </button>
        </div>
    );
};
