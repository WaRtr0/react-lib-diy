import type { VirtualNode } from "./component";

declare global {
    interface HTMLElement {
        __virtualNode?: VirtualNode;
    }
}