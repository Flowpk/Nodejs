import { MainScene } from "./scene"

async function main(){
    const video = document.getElementById('camera')! as HTMLVideoElement
    const canvas = document.getElementById('canvas')! as HTMLCanvasElement
    const scene = new MainScene(video,canvas);
    await scene.load()
    scene.render()

}

main()