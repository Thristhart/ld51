import { useSignal } from "@preact/signals";
import { ComponentChildren } from "preact";
import "./HelpButton.css";
import { HelpDialog } from "./HelpDialog";

interface HelpButtonProps {
    readonly children: ComponentChildren;
}
export const HelpButton = ({ children }: HelpButtonProps) => {
    const showingHelp = useSignal(false);
    const buttonPosition = useSignal<{ x: number; y: number } | undefined>(undefined);

    return (
        <>
            <button
                class="helpButton"
                onClick={(e) => {
                    showingHelp.value = !showingHelp.value;
                    const rect = e.currentTarget.getBoundingClientRect();
                    buttonPosition.value = { x: rect.left, y: rect.top };
                }}>
                ?
            </button>
            <HelpDialog open={showingHelp} buttonPosition={buttonPosition}>
                {children}
            </HelpDialog>
        </>
    );
};
