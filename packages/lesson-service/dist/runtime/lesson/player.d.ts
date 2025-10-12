export type PlayerStatus = 'idle' | 'playing' | 'paused' | 'completed';
interface PlayerContext {
    index: number;
    total: number;
    status: PlayerStatus;
}
export type PlayerEvent = {
    type: 'PLAY';
} | {
    type: 'PAUSE';
} | {
    type: 'STOP';
} | {
    type: 'COMPLETE';
} | {
    type: 'NEXT';
} | {
    type: 'PREV';
} | {
    type: 'SET_INDEX';
    index: number;
};
export declare const createLessonPlayerMachine: (totalSegments: number) => import("xstate").StateMachine<PlayerContext, {
    type: "PLAY";
} | {
    type: "PAUSE";
} | {
    type: "STOP";
} | {
    type: "COMPLETE";
} | {
    type: "NEXT";
} | {
    type: "PREV";
} | {
    type: "SET_INDEX";
    index: number;
}, Record<string, import("xstate").AnyActorRef>, import("xstate").ProvidedActor, import("xstate").ParameterizedObject, import("xstate").ParameterizedObject, string, import("xstate").StateValue, string, unknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, any>;
export {};
//# sourceMappingURL=player.d.ts.map