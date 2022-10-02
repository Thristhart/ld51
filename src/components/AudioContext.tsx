import { Signal, useSignal, useSignalEffect } from "@preact/signals";
import { Howl } from "howler";
import { ComponentChildren, createContext } from "preact";
import { useContext, useState } from "preact/hooks";
import levelUpPath from "../assets/audio/level_up.ogg";

interface AudioState {
    levelUp: Signal<Howl>;
    muted: Signal<boolean>;
}

const AudioContext = createContext<AudioState | null>(null);

interface AudioProviderProps {
    readonly children: ComponentChildren;
}
export const AudioProvider = ({ children }: AudioProviderProps) => {
    const levelUp = useSignal(new Howl({ src: levelUpPath, volume: 0.03 }));
    const muted = useSignal(false);
    useSignalEffect(() => {
        Howler.mute(muted.value);
    });

    return <AudioContext.Provider value={useState(() => ({ levelUp, muted }))[0]}>{children}</AudioContext.Provider>;
};

export const useAudioContext = () => {
    const value = useContext(AudioContext);
    if (!value) {
        throw new Error("AudioContext is not available");
    }
    return value;
};

export const useLevelUpSound = () => useAudioContext().levelUp.value;
