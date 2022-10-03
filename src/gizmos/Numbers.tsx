import { signal, Signal, useSignal, useSignalEffect } from "@preact/signals";
import cn from "classnames";
import { Howl } from "howler";
import { useMemo } from "preact/hooks";
import { GizmoProps } from "~/Game";
import numbers1 from "../assets/audio/numbers_1.ogg";
import numbers10 from "../assets/audio/numbers_10.ogg";
import numbers11 from "../assets/audio/numbers_11.ogg";
import numbers12 from "../assets/audio/numbers_12.ogg";
import numbers13 from "../assets/audio/numbers_13.ogg";
import numbers14 from "../assets/audio/numbers_14.ogg";
import numbers15 from "../assets/audio/numbers_15.ogg";
import numbers16 from "../assets/audio/numbers_16.ogg";
import numbers2 from "../assets/audio/numbers_2.ogg";
import numbers3 from "../assets/audio/numbers_3.ogg";
import numbers4 from "../assets/audio/numbers_4.ogg";
import numbers5 from "../assets/audio/numbers_5.ogg";
import numbers6 from "../assets/audio/numbers_6.ogg";
import numbers7 from "../assets/audio/numbers_7.ogg";
import numbers8 from "../assets/audio/numbers_8.ogg";
import numbers9 from "../assets/audio/numbers_9.ogg";
import wrongNumberPath from "../assets/audio/numbers_WRONG.ogg";
import "./Numbers.css";

const sizes = [
    [2, 2],
    [3, 2],
    [3, 3],
    [4, 3],
    [4, 4],
];

const sounds = [
    undefined,
    new Howl({ src: numbers1, volume: 0.4 }),
    new Howl({ src: numbers2, volume: 0.4 }),
    new Howl({ src: numbers3, volume: 0.4 }),
    new Howl({ src: numbers4, volume: 0.4 }),
    new Howl({ src: numbers5, volume: 0.4 }),
    new Howl({ src: numbers6, volume: 0.4 }),
    new Howl({ src: numbers7, volume: 0.4 }),
    new Howl({ src: numbers8, volume: 0.4 }),
    new Howl({ src: numbers9, volume: 0.4 }),
    new Howl({ src: numbers10, volume: 0.4 }),
    new Howl({ src: numbers11, volume: 0.4 }),
    new Howl({ src: numbers12, volume: 0.4 }),
    new Howl({ src: numbers13, volume: 0.4 }),
    new Howl({ src: numbers14, volume: 0.4 }),
    new Howl({ src: numbers15, volume: 0.4 }),
    new Howl({ src: numbers16, volume: 0.4 }),
];
const wrongNumber = new Howl({ src: wrongNumberPath, volume: 0.3 });
const gridID = signal(0);

const getGridNumbers = (size: number[]) => {
    const count = size[0] * size[1];
    const availableValues = Array.from({ length: count }, (_, index) => index);
    const numbers = [];
    for (let i = 0; i < count; i++) {
        numbers.push(
            availableValues.splice(availableValues.indexOf(Math.floor(Math.random() * availableValues.length)), 1)[0] +
                1
        );
    }
    return numbers;
};

interface GridProps {
    size: number[];
    numbers: number[];
    nextValue: Signal<number>;
    resetGrid: () => void;
    completed: Signal<boolean>;
}
function Grid({ size, numbers, nextValue, resetGrid, completed }: GridProps) {
    const buttons = [];
    for (const cellValue of numbers) {
        buttons.push(
            <NumberButton className="numberButton" nextValue={nextValue} value={cellValue} resetGrid={resetGrid} />
        );
    }
    return (
        <div
            class={cn("numberGizmo", completed.value && "completed")}
            key={gridID.value}
            style={{ "--column-count": size[0], "--row-count": size[1] }}>
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
                    sounds[value]?.play();
                } else {
                    wrongNumber.play();
                    resetGrid();
                }
            }}>
            {value}
        </button>
    );
};

export const Numbers = ({ level, completed }: GizmoProps) => {
    function resetGrid() {
        gridID.value++;
        nextValue.value = 1;
        gridSignal.value = getGridNumbers(size.value);
    }

    const nextValue = useSignal(1);
    const size = useSignal(sizes[0]);
    const gridMemo = useMemo(() => getGridNumbers(size.value), []);
    const gridSignal = useSignal<number[]>(gridMemo);
    useSignalEffect(() => {
        if (nextValue.value > size.value[0] * size.value[1]) {
            level.value = level.peek() + 1;
            const nextSize = sizes[level.value - 1];
            if (nextSize === undefined) {
                completed.value = true;
                return;
            }
            size.value = nextSize;
            resetGrid();
        }
    });

    return (
        <Grid
            numbers={gridSignal.value}
            size={size.value}
            nextValue={nextValue}
            resetGrid={resetGrid}
            completed={completed}
        />
    );
};
