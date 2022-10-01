import { signal, Signal, useSignal, useSignalEffect } from "@preact/signals";
import cn from "classnames";
import { useMemo } from "preact/hooks";
import { GizmoProps } from "~/Game";
import "./Numbers.css";

let sizes = [
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
    const [x, y] = size;
    const availableValues = Array.from({ length: x * y }, (_, index) => index);
    let rows = [];
    for (let posY = 0; posY < y || posY < x; posY++) {
        let cells = [];
        let real = posY < y;
        for (let posX = 0; posX < x; posX++) {
            if (real) {
                const cellValue =
                    availableValues.splice(
                        availableValues.indexOf(Math.floor(Math.random() * availableValues.length)),
                        1
                    )[0] + 1;
                cells.push(
                    <NumberButton
                        className="numberButton"
                        nextValue={nextValue}
                        value={cellValue}
                        resetGrid={resetGrid}
                    />
                );
            } else {
                cells.push(<div class="emptyNumber"></div>);
            }
        }
        rows.push(<span class="numberRow">{cells}</span>);
    }
    console.log(rows);
    return (
        <div class="numberGizmo" key={gridID.value}>
            {rows}
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
                console.log(nextValue.value, value);
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
            size.value = sizes[level.value - 1];
            resetGrid();
        }
    });

    return gridSignal.value;
};
