import { DoubleSide, Material, Mesh, MeshStandardMaterial, Object3D, Side, Texture, TextureLoader } from "three";

export class TextureSwitcher{
    private textureArray: Array<Texture>
    private currentIndex: number
    private object:Mesh
    
    constructor(object:Mesh){
        this.currentIndex = 0
        this.object = object
        this.textureArray = new Array<Texture>()
    }
    public async load(){
        let texture = new TextureLoader().load( 'ForBG/1.png' );
        const material1 = new MeshStandardMaterial({map: texture})
        material1.side = DoubleSide
        material1.roughness = 1
        material1.metalness = 1
        this.textureArray.push(texture)

        texture = new TextureLoader().load( 'ForBG/2.png' );
        const material2 = new MeshStandardMaterial({map: texture})
        material2.side = DoubleSide
        material2.roughness = 1
        material2.metalness = 1
        this.textureArray.push(texture)

        texture = new TextureLoader().load( 'ForBG/3.png' );
        const material3 = new MeshStandardMaterial({map: texture})
        material3.side = DoubleSide
        material3.roughness = 1
        material3.metalness = 1
        this.textureArray.push(texture)

        texture = new TextureLoader().load( 'ForBG/4.png' );
        const material4 = new MeshStandardMaterial({map: texture})
        material4.side = DoubleSide
        material4.roughness = 1
        material4.metalness = 1
        this.textureArray.push(texture)

        texture = new TextureLoader().load( 'ForBG/5.png' );
        const material5 = new MeshStandardMaterial({map: texture})
        material5.side = DoubleSide
        material5.roughness = 1
        material5.metalness = 1
        this.textureArray.push(texture)
    }

    public nextTexture(){
        (this.object.material as MeshStandardMaterial).map  = this.textureArray[this.currentIndex]
        this.currentIndex++;
        if(this.currentIndex >= this.textureArray.length){this.currentIndex = 0}
    }
    public nextTextureAndAlpha(){
        (this.object.material as MeshStandardMaterial).map  = this.textureArray[this.currentIndex];
        (this.object.material as MeshStandardMaterial).alphaMap  = this.textureArray[this.currentIndex]
        this.currentIndex++;
        if(this.currentIndex >= this.textureArray.length){this.currentIndex = 0}
    }
}