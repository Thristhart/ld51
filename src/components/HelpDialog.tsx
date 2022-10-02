import { Signal, useSignal, useSignalEffect } from "@preact/signals";
import { ComponentChildren } from "preact";
import { useEffect, useRef } from "preact/hooks";
import "./HelpDialog.css";

interface HelpDialogProps {
    readonly open: Signal<boolean>;
    readonly children: ComponentChildren;
    readonly buttonPosition: Signal<{ x: number; y: number } | undefined>;
}
export const HelpDialog = ({ open, children, buttonPosition }: HelpDialogProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const dragHandlePos = useSignal<{ x: number; y: number } | undefined>(undefined);
    const x = useSignal(0);
    const y = useSignal(0);
    useSignalEffect(() => {
        if (x.value === 0 && y.value === 0) {
            const buttonPos = buttonPosition.value;
            if (buttonPos) {
                const dialogRect = dialogRef.current?.getBoundingClientRect();
                x.value = buttonPos.x - (dialogRect?.width ?? 0) / 2;
                y.value = buttonPos.y - (dialogRect?.height ?? 0);
            }
        }
    });

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (dragHandlePos.value) {
                x.value = e.clientX - dragHandlePos.value.x;
                y.value = e.clientY - dragHandlePos.value.y;
            }
        };
        const onMouseLeave = () => {
            dragHandlePos.value = undefined;
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseleave", onMouseLeave);
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseleave", onMouseLeave);
        };
    }, []);

    const rect = dialogRef.current?.getBoundingClientRect();

    return (
        <dialog
            class="helpDialog"
            open={open.value}
            ref={dialogRef}
            onMouseDown={(e) => {
                if (e.target === dialogRef.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    dragHandlePos.value = { x: e.clientX - rect!.left, y: e.clientY - rect!.top };
                }
            }}
            onMouseUp={() => {
                dragHandlePos.value = undefined;
            }}
            style={{
                transform: `translate(${Math.max(
                    0,
                    Math.min(window.innerWidth - (rect?.width ?? 0), x.value)
                )}px, ${Math.max(0, Math.min(window.innerHeight - (rect?.height ?? 0), y.value))}px)`,
            }}>
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
