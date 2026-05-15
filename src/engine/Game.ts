import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import { InputManager } from './InputManager';
import { PhysicsWorld } from './PhysicsWorld';
import { MainScene } from '@/scenes/MainScene';

export class Game {
  private renderer: THREE.WebGLRenderer;
  private sceneManager: SceneManager;
  private inputManager: InputManager;
  private physicsWorld: PhysicsWorld;
  private lastTime = 0;
  private animFrameId = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.physicsWorld = new PhysicsWorld();
    this.inputManager = new InputManager(canvas);
    this.sceneManager = new SceneManager(this.renderer);

    this.sceneManager.load(new MainScene(this.physicsWorld, this.inputManager));

    window.addEventListener('resize', this.onResize.bind(this));
  }

  start(): void {
    this.animFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  stop(): void {
    cancelAnimationFrame(this.animFrameId);
  }

  private loop(time: number): void {
    const delta = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;

    this.physicsWorld.step(delta);
    this.sceneManager.update(delta);
    this.sceneManager.render();
    this.inputManager.reset();

    this.animFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  private onResize(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.sceneManager.onResize(window.innerWidth, window.innerHeight);
  }
}
