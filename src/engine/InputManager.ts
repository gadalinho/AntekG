import * as THREE from 'three';

export interface Touch {
  id: number;
  position: THREE.Vector2;
  delta: THREE.Vector2;
  startPosition: THREE.Vector2;
}

export class InputManager {
  private touches: Map<number, Touch> = new Map();
  private _tapThisFrame = false;
  private _swipeDelta = new THREE.Vector2();

  constructor(canvas: HTMLCanvasElement) {
    canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });

    // Mouse fallback for desktop dev
    canvas.addEventListener('mousedown', e => this.simulateTouch('start', e));
    canvas.addEventListener('mousemove', e => this.simulateTouch('move', e));
    canvas.addEventListener('mouseup', e => this.simulateTouch('end', e));
  }

  get activeTouches(): Touch[] {
    return Array.from(this.touches.values());
  }

  get tapThisFrame(): boolean {
    return this._tapThisFrame;
  }

  get swipeDelta(): THREE.Vector2 {
    return this._swipeDelta.clone();
  }

  reset(): void {
    this._tapThisFrame = false;
    this._swipeDelta.set(0, 0);
    this.touches.forEach(t => t.delta.set(0, 0));
  }

  private onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    Array.from(e.changedTouches).forEach(t => {
      const pos = new THREE.Vector2(t.clientX, t.clientY);
      this.touches.set(t.identifier, {
        id: t.identifier,
        position: pos.clone(),
        delta: new THREE.Vector2(),
        startPosition: pos.clone(),
      });
    });
  }

  private onTouchMove(e: TouchEvent): void {
    e.preventDefault();
    Array.from(e.changedTouches).forEach(t => {
      const touch = this.touches.get(t.identifier);
      if (!touch) return;
      const newPos = new THREE.Vector2(t.clientX, t.clientY);
      touch.delta.copy(newPos).sub(touch.position);
      this._swipeDelta.add(touch.delta);
      touch.position.copy(newPos);
    });
  }

  private onTouchEnd(e: TouchEvent): void {
    e.preventDefault();
    Array.from(e.changedTouches).forEach(t => {
      const touch = this.touches.get(t.identifier);
      if (touch) {
        const dist = touch.position.distanceTo(touch.startPosition);
        if (dist < 10) this._tapThisFrame = true;
      }
      this.touches.delete(t.identifier);
    });
  }

  private mouseDown = false;
  private simulateTouch(phase: 'start' | 'move' | 'end', e: MouseEvent): void {
    if (phase === 'start') {
      this.mouseDown = true;
      const pos = new THREE.Vector2(e.clientX, e.clientY);
      this.touches.set(0, { id: 0, position: pos.clone(), delta: new THREE.Vector2(), startPosition: pos.clone() });
    } else if (phase === 'move' && this.mouseDown) {
      const touch = this.touches.get(0);
      if (!touch) return;
      const newPos = new THREE.Vector2(e.clientX, e.clientY);
      touch.delta.copy(newPos).sub(touch.position);
      this._swipeDelta.add(touch.delta);
      touch.position.copy(newPos);
    } else if (phase === 'end') {
      this.mouseDown = false;
      const touch = this.touches.get(0);
      if (touch && touch.position.distanceTo(touch.startPosition) < 10) this._tapThisFrame = true;
      this.touches.delete(0);
    }
  }
}
