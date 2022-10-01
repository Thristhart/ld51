import { useSignalEffect } from "@preact/signals";
import type { RefObject } from "preact";
import { useEffect, useRef } from "preact/hooks";

interface CanvasProps {
    readonly width: number;
    readonly height: number;
    readonly tick?: (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => void;
    readonly canvasRef?: RefObject<HTMLCanvasElement>;
    readonly className?: string;
}
export const Canvas = ({ width, height, tick, canvasRef, className }: CanvasProps) => {
    const internalRef = useRef<HTMLCanvasElement>(null);
    const ref = canvasRef ?? internalRef;
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (canvas) {
            contextRef.current = canvas.getContext("2d");
        }
    }, []);

    useSignalEffect(() => {
        if (contextRef.current) {
            tick?.(ref.current!, contextRef.current);
        }
    });

    return <canvas ref={ref} width={width} height={height} className={className} />;
};
