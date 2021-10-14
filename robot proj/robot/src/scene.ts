import {
  AmbientLight,
  DirectionalLight, Group,
  Layers,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D, PerspectiveCamera,
  PMREMGenerator, ReinhardToneMapping, Scene,
  ShaderMaterial, Vector2,
  WebGLRenderer
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
//import { UnrealBloomPass } from './TransparentBackgroundFixedUnrealBloomPass';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EmissionByFreq } from './emission-by-freq';
import { FaceTracking } from './face-tracking';
import { Micro } from './micro-utils';
import { RotationCalculator } from './rotation-calculator';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';
import { TextureSwitcher } from './texture-switcher';
//import { isAndroid } from './camera-utils';

const ENTIRE_SCENE = 0, BLOOM_SCENE = 1;

const bloomLayer = new Layers();
bloomLayer.set( BLOOM_SCENE );

const  materials:any = {};
const darkMaterial = new MeshBasicMaterial( { color: "black" } );

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;


export class MainScene{

    private scene: Scene
    private faceTracking: FaceTracking
    private rotationCalculator:RotationCalculator
    private sceneCamera: PerspectiveCamera
    private renderer: WebGLRenderer
    private head?:Object3D
    private backgroundObject?:Object3D
    private body?:Object3D
    private bloomComposer: EffectComposer;
    private finalComposer: EffectComposer;
    private textureSwitcher?: TextureSwitcher
    private emissionByFreq?: EmissionByFreq
    private bloomPass: UnrealBloomPass
    private renderScene: RenderPass
    private finalPass: ShaderPass;
    
	

    constructor(video: HTMLVideoElement, canvas:HTMLCanvasElement){
        this.faceTracking = new FaceTracking(video,canvas)
        this.rotationCalculator = new RotationCalculator(this.faceTracking)

        this.renderer = new WebGLRenderer({ antialias: true, canvas });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(SCREEN_WIDTH , SCREEN_HEIGHT)
        this.renderer.toneMapping = ReinhardToneMapping

        this.scene = new Scene();
        //this.scene.add(this.createLight())
        //this.scene.add( new AmbientLight( 0x404040 ) );

        const aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        this.sceneCamera = new PerspectiveCamera(60, aspect , 0.1 , 10000)
        this.sceneCamera.setFocalLength(70)
        this.sceneCamera.updateProjectionMatrix()

        this.scene.add(this.sceneCamera)

        const pmrem = new PMREMGenerator(this.renderer)
        this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.01).texture

        this.renderScene = new RenderPass( this.scene, this.sceneCamera );
        
        this.bloomPass = new UnrealBloomPass( new Vector2( SCREEN_WIDTH , SCREEN_HEIGHT ), 4, 1, 0 );
        this.bloomPass.strength = 4
        this.bloomPass.radius = 1
        this.bloomPass.threshold = 0

        
        this.renderer.toneMappingExposure = Math.pow( 1 , 4.0 );

        this.bloomComposer = new EffectComposer( this.renderer );
        this.bloomComposer.renderToScreen = false;
        this.bloomComposer.addPass( this.renderScene );
        this.bloomComposer.addPass( this.bloomPass );

        this.finalPass = new ShaderPass(
            new ShaderMaterial( {
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                defines: {}
            } ), "baseTexture"
        );
        this.finalPass.needsSwap = true;

        this.finalComposer = new EffectComposer( this.renderer );
        this.finalComposer.addPass( this.renderScene );
        this.finalComposer.addPass( this.finalPass );
        
        
        this.resize()
    }
    
    public async load(){
        const loaded = (await new GLTFLoader().loadAsync('robot.glb')).scene
        this.head = loaded.getObjectByName('head')
        const visor = (this.head as Group).getObjectByName("Mesh002_3")!
        visor.layers.toggle(BLOOM_SCENE)

        this.backgroundObject = loaded.getObjectByName('background')
        this.backgroundObject!.layers.toggle( BLOOM_SCENE );

        this.body = loaded.getObjectByName('body')
        this.scene.add(loaded)

        this.textureSwitcher = new TextureSwitcher(this.backgroundObject as Mesh)
        await this.textureSwitcher.load()
        setInterval(()=>this.textureSwitcher?.nextTexture(),0.3)

        await this.faceTracking.init()

        const audioStream = await Micro.setupMicro(()=>{})
        
        const emissionMat = (visor as Mesh).material
        this.emissionByFreq = new EmissionByFreq(emissionMat as MeshStandardMaterial,audioStream!)
        
    }

    public async render() {
        

        const degree = await this.rotationCalculator.calculateRotation()
        if(this.head && degree && this.backgroundObject && this.body){
            this.head.rotation.x = degree[0] * (Math.PI / 180.0)
            this.head.rotation.y = degree[1] * (Math.PI / 180.0)
            this.backgroundObject.rotation.x =  degree[0] * (Math.PI / 180.0)
            this.backgroundObject.rotation.y = degree[1] * (Math.PI / 180.0)
            this.body.rotation.z = -degree[1] * (Math.PI / 180.0) /50
            this.body.rotation.y = degree[1] * (Math.PI / 180.0) /50
            this.body.rotation.x = degree[0] * (Math.PI / 180.0) /10
        }

        this.emissionByFreq?.render()

        this.resizeRendererToDisplaySize();
        this.scene.traverse( this.darkenNonBloomed );
        this.bloomComposer.render();
        this.scene.traverse( this.restoreMaterial );

        this.finalComposer.render()
        requestAnimationFrame(() => this.render());
    }

    private resizeRendererToDisplaySize () {
        const needResize = window.innerWidth !== SCREEN_WIDTH || window.innerHeight !== SCREEN_HEIGHT;
        if (needResize) {
          
            SCREEN_WIDTH = window.innerWidth
            SCREEN_HEIGHT = window.innerHeight
          
          this.resize()
        }
        return needResize
    }

    private resize(){
        const screenAspect  = SCREEN_WIDTH / SCREEN_HEIGHT;
        
        this.sceneCamera.aspect = screenAspect
        this.sceneCamera.updateProjectionMatrix();

        this.sceneCamera.position.z = screenAspect < 1 ? 13 *  screenAspect: 15 / screenAspect
        this.sceneCamera.position.y = screenAspect < 1 ? 0.5:0

        this.sceneCamera.updateMatrix();

        this.renderer.setSize( SCREEN_WIDTH , SCREEN_HEIGHT, true);
        
        this.bloomPass.setSize(
          SCREEN_WIDTH , 
          SCREEN_HEIGHT 
          )
        this.finalComposer.setSize(
          SCREEN_WIDTH , 
          SCREEN_HEIGHT
          )
    }


    private createLight () {
        const color = 0xffffff
        const intensity = 0
        const light = new DirectionalLight(color, intensity)
        light.position.set(10, 2, 10)
        return light
    }

    private darkenNonBloomed( obj:any ) {
        if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {
            materials[ obj.uuid ] = obj.material;
            obj.material = darkMaterial;
        }
    }

    private restoreMaterial( obj:any ) {
        if ( materials[ obj.uuid ] ) {
            obj.material = materials[ obj.uuid ];
            delete materials[ obj.uuid ];
        }
    }
}