import { useSignal, useSignalEffect } from "@preact/signals";
import { HelpButton } from "~/components/HelpButton";
import { GizmoProps } from "~/Game";
import "./Button.css";
import ButtonHelp from "./ButtonHelp.mdx";

export const Button = ({ level }: GizmoProps) => {
    const clicks = useSignal(0);
    useSignalEffect(() => {
        if (clicks.value >= Math.pow(10, level.peek() - 1)) {
            level.value = level.peek() + 1;
            clicks.value = 0;
        }
    });

    return (
        <div class="bigRedButton">
            <HelpButton>
                <ButtonHelp />
            </HelpButton>
            <button
                class="buttonGizmo"
                onClick={() => {
                    clicks.value++;
                }}>
                {clicks} / {level}
            </button>
        </div>
    );
};
