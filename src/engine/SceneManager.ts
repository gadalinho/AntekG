import * as THREE from 'three';

export interface Scene {
  camera: THREE.PerspectiveCamera;
  threeScene: THREE.Scene;
  update(delta: number): void;
  onResize(width: number, height: number): void;
}

export class SceneManager {
  private renderer: THREE.WebGLRenderer;
  private current: Scene | null = null;

  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
  }

  load(scene: Scene): void {
    this.current = scene;
    this.onResize(window.innerWidth, window.innerHeight);
  }

  update(delta: number): void {
    this.current?.update(delta);
  }

  render(): void {
    if (!this.current) return;
    this.renderer.render(this.current.threeScene, this.current.camera);
  }

  onResize(width: number, height: number): void {
    if (!this.current) return;
    this.current.camera.aspect = width / height;
    this.current.camera.updateProjectionMatrix();
    this.current.onResize(width, height);
  }
}
