import { MeshStandardMaterial } from "three";

export class EmissionByFreq{

    private analyser: AnalyserNode
    private ctx: AudioContext
    private data: Uint8Array
    private material: MeshStandardMaterial

    constructor(material:MeshStandardMaterial,stream:MediaStream){
      this.material = material
      this.ctx = new AudioContext();
      const mic = this.ctx.createMediaStreamSource(stream!);
      this.analyser = this.ctx.createAnalyser();

      mic.connect(this.analyser); 

      this.data = new Uint8Array(this.analyser.frequencyBinCount);
      
    }

    public render(){
        this.analyser.getByteFrequencyData(this.data);
        // get fullest bin
        let idx = 0;
        for (var j=0; j < this.analyser.frequencyBinCount; j++) {
            if (this.data[j] > this.data[idx]) {
                idx = j;
            }
        }
        let frequency = idx * this.ctx.sampleRate / this.analyser.fftSize;
        frequency = this.data[idx]
        if(frequency > 175){
          this.material.emissiveIntensity = 10
        }
        else{
        this.material.emissiveIntensity = 1
        }
    }
}