import * as PIXI from 'pixi.js';
import { Node } from '../worker/heap-profile-parser';
import { circle, GLState, Circle } from './circle';
import { color, hexToColor, padHex } from './colors';

interface NodeCircleProps {
    node: Node;
}

function createNodeColor(t: string, a: number) {
    return color(t).concat(a);
}

function createHitColor(i: number) {
    const base = i.toString(16);
    return padHex(base);
}

export default class NodeCircle {
    node: Node;
    retainedSize: Circle;
    selfSize: Circle;
    hitCircle: Circle;
    hitColor: string;
    locked = false;

    constructor(node: Node, canvasState: GLState, hitCanvasState: GLState) {
        this.node = node;
        const {x, y, r, t, i, s, v} = node;
        this.retainedSize = this.createSprite(r, x, y, createNodeColor(t, 0.6), canvasState);
        this.hitColor = createHitColor(i);
        const color = hexToColor(this.hitColor).concat(1);
        this.hitCircle = this.createSprite(r, x, y, color, hitCanvasState);

        const selfSize = r * s / v;

        //Need to guard against undrawable circles
        if (selfSize) {
            this.selfSize = this.createSprite(selfSize, x, y, createNodeColor(t, 0.8), canvasState);
        }
    }

    createSprite(size: number, x: number, y: number, c: number[], state: GLState) {
        const sprite = circle(size, 32, c, state);
        sprite.t = [x,y,0];
        return sprite;
    }

    highlight(active: boolean) {
        this.retainedSize.c[3] = active ? 0.8 : 0.6;

        if (this.selfSize) {
            this.selfSize.c[3] = active ? 1 : 0.8;
        }

        // this.outline = this.createSprite()
    }

    createOutlines() {
        // const {node} = this;
        // if (!this.outline && !this.outlineInner) {
        //     this.outline = this.createSprite((node.r + 1) * 2, node.x, node.y, textures['0xF08080']);
        //     this.outlineInner = this.createSprite(node.r * 2, node.x, node.y, textures['0xFFFFFF']);
        // }
    }

    intersects(x: number, y: number) {
        const dx = Math.abs(x - this.node.x);
        const dy = Math.abs(y - this.node.y);
        const r = this.node.r;

        if (dx > r || dy > r) return false;
        if (dx + dy <= r) return true;
        if (dx * dx + dy * dy <= r * r) return true;
    }
}