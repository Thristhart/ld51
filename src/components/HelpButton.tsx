import { useSignal } from "@preact/signals";
import { ComponentChildren } from "preact";
import "./HelpButton.css";
import { HelpDialog } from "./HelpDialog";

interface HelpButtonProps {
    readonly children: ComponentChildren;
}
export const HelpButton = ({ children }: HelpButtonProps) => {
    const showingHelp = useSignal(false);

    return (
        <>
            <button
                class="helpButton"
                onClick={() => {
                    showingHelp.value = !showingHelp.value;
                }}>
                ?
            </button>
            <HelpDialog open={showingHelp}>{children}</HelpDialog>
        </>
    );
};
