import type { VirtualNode } from "../core/component";


declare global {
    interface HTMLElement {
        __virtualNode?: VirtualNode;
    }
}

declare const DEBUG: boolean;