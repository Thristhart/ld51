import { Signal } from "@preact/signals";
import { ComponentChildren } from "preact";
import "./HelpDialog.css";

interface HelpDialogProps {
    readonly open: Signal<boolean>;
    readonly children: ComponentChildren;
}
export const HelpDialog = ({ open, children }: HelpDialogProps) => {
    return (
        <dialog class="helpDialog" open={open.value}>
            <button
                class="closeButton"
                onClick={() => {
                    open.value = false;
                }}>
                X
            </button>
            {children}
        </dialog>
    );
};
