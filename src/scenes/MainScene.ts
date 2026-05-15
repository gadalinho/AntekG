import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Scene } from '@/engine/SceneManager';
import { PhysicsWorld } from '@/engine/PhysicsWorld';
import { InputManager } from '@/engine/InputManager';

export class MainScene implements Scene {
  camera: THREE.PerspectiveCamera;
  threeScene: THREE.Scene;

  private physics: PhysicsWorld;
  private input: InputManager;

  private ball: THREE.Mesh;
  private ballBody: CANNON.Body;
  private platform: THREE.Mesh;

  constructor(physics: PhysicsWorld, input: InputManager) {
    this.physics = physics;
    this.input = input;

    this.threeScene = new THREE.Scene();
    this.threeScene.background = new THREE.Color(0x1a1a2e);
    this.threeScene.fog = new THREE.Fog(0x1a1a2e, 20, 60);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 8, 12);
    this.camera.lookAt(0, 0, 0);

    this.setupLights();
    this.platform = this.createPlatform();
    this.ball = this.createBall();
    this.ball = this.ball;
    this.ballBody = this.createBallPhysics();
  }

  private setupLights(): void {
    const ambient = new THREE.AmbientLight(0x404070, 0.6);
    this.threeScene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 10, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 10;
    sun.shadow.camera.bottom = -10;
    this.threeScene.add(sun);

    const fill = new THREE.PointLight(0x4444ff, 0.5, 20);
    fill.position.set(-5, 3, -5);
    this.threeScene.add(fill);
  }

  private createPlatform(): THREE.Mesh {
    const geo = new THREE.BoxGeometry(10, 0.5, 10);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x16213e,
      roughness: 0.8,
      metalness: 0.2,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    mesh.position.set(0, -0.25, 0);
    this.threeScene.add(mesh);

    const body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(5, 0.25, 5)),
      position: new CANNON.Vec3(0, -0.25, 0),
    });
    this.physics.addBody(body);

    return mesh;
  }

  private createBall(): THREE.Mesh {
    const geo = new THREE.SphereGeometry(0.5, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xe94560,
      roughness: 0.3,
      metalness: 0.6,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.position.set(0, 3, 0);
    this.threeScene.add(mesh);
    return mesh;
  }

  private createBallPhysics(): CANNON.Body {
    const body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(0.5),
      position: new CANNON.Vec3(0, 3, 0),
      linearDamping: 0.3,
      angularDamping: 0.3,
    });
    this.physics.addBody(body);
    return body;
  }

  update(delta: number): void {
    // Sync Three.js mesh with physics body
    this.ball.position.copy(this.ballBody.position as unknown as THREE.Vector3);
    this.ball.quaternion.copy(this.ballBody.quaternion as unknown as THREE.Quaternion);

    // Tilt controls from swipe/mouse drag
    const swipe = this.input.swipeDelta;
    if (swipe.length() > 0.5) {
      const force = new CANNON.Vec3(swipe.x * 0.3, 0, swipe.y * 0.3);
      this.ballBody.applyForce(force);
    }

    // Tap to jump
    if (this.input.tapThisFrame) {
      this.ballBody.applyImpulse(new CANNON.Vec3(0, 6, 0));
    }

    // Keep ball on screen — respawn if fallen off
    if (this.ballBody.position.y < -10) {
      this.ballBody.position.set(0, 3, 0);
      this.ballBody.velocity.set(0, 0, 0);
      this.ballBody.angularVelocity.set(0, 0, 0);
    }

    // Smooth camera follow
    const targetX = this.ball.position.x * 0.5;
    const targetZ = this.ball.position.z * 0.5 + 12;
    this.camera.position.x += (targetX - this.camera.position.x) * delta * 3;
    this.camera.position.z += (targetZ - this.camera.position.z) * delta * 3;
    this.camera.lookAt(this.ball.position);
  }

  onResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
