import { signal, Signal, useSignal, useSignalEffect } from "@preact/signals";
import cn from "classnames";
import { useMemo } from "preact/hooks";
import { GizmoProps } from "~/Game";
import "./Numbers.css";

const sizes = [
    [1, 1],
    [2, 1],
    [2, 2],
    [3, 2],
    [3, 3],
    [4, 3],
    [4, 4],
];

const gridID = signal(0);

function drawGrid(size: number[], nextValue: Signal<number>, resetGrid: () => void) {
    const count = size[0] * size[1];
    const availableValues = Array.from({ length: count }, (_, index) => index);
    const buttons = [];
    for (let i = 0; i < count; i++) {
        const cellValue =
            availableValues.splice(availableValues.indexOf(Math.floor(Math.random() * availableValues.length)), 1)[0] +
            1;
        buttons.push(
            <NumberButton className="numberButton" nextValue={nextValue} value={cellValue} resetGrid={resetGrid} />
        );
    }
    return (
        <div class="numberGizmo" key={gridID.value} style={{ "--column-count": size[0], "--row-count": size[1] }}>
            {buttons}
        </div>
    );
}

export interface NumberButtonProps {
    readonly value: number;
    readonly className: string;
    readonly nextValue: Signal<number>;
    readonly resetGrid: () => void;
}

export const NumberButton = ({ className, value, nextValue, resetGrid }: NumberButtonProps) => {
    const isPressed = useSignal(false);
    return (
        <button
            class={cn(className, isPressed.value && "pressed")}
            onClick={() => {
                if (nextValue.value === value) {
                    nextValue.value++;
                    isPressed.value = true;
                } else {
                    resetGrid();
                }
            }}>
            {value}
        </button>
    );
};

export const Numbers = ({ level }: GizmoProps) => {
    function resetGrid() {
        gridID.value++;
        nextValue.value = 1;
        gridSignal.value = drawGrid(size.value, nextValue, resetGrid);
    }

    const nextValue = useSignal(1);
    const size = useSignal(sizes[0]);
    let grid = useMemo(() => drawGrid(size.value, nextValue, resetGrid), []);
    const gridSignal = useSignal(grid);
    useSignalEffect(() => {
        if (nextValue.value > size.value[0] * size.value[1]) {
            level.value = level.peek() + 1;
            const nextSize = sizes[level.value - 1];
            if (nextSize === undefined) {
                // you win
                return;
            }
            size.value = nextSize;
            resetGrid();
        }
    });

    return gridSignal.value;
};
