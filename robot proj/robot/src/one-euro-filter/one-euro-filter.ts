class LowPassFilter {
    y: number | null;

    s: number | null;

    alpha = 0;

    constructor (alpha: number) {
      this.setAlpha(alpha)
      this.y = null
      this.s = null
    }

    setAlpha (alpha: number) {
      if (alpha <= 0 || alpha > 1.0) {
        throw new Error()
      }
      this.alpha = alpha
    }

    filter (value: number, alpha: number) {
      if (alpha) {
        this.setAlpha(alpha)
      }
      let s
      if (!this.y || !this.s) {
        s = value
      } else {
        s = this.alpha * value + (1.0 - this.alpha) * this.s
      }
      this.y = value
      this.s = s
      return s
    }

    lastValue () {
      return this.y
    }
}

export default class OneEuroFilter {
    freq: number;

    minCutOff: number;

    beta: number;

    dCutOff: number;

    x: LowPassFilter;

    dx: LowPassFilter;

    lastTime: number | null;

    constructor (
      freq: number,
      minCutOff = 1.0,
      beta = 0.0,
      dCutOff = 1.0
    ) {
      if (freq <= 0 || minCutOff <= 0 || dCutOff <= 0) {
        throw new Error()
      }
      this.freq = freq
      this.minCutOff = minCutOff
      this.beta = beta
      this.dCutOff = dCutOff
      this.x = new LowPassFilter(this.alpha(this.minCutOff))
      this.dx = new LowPassFilter(this.alpha(this.dCutOff))
      this.lastTime = null
    }

    private alpha (cutOff: number) {
      const te = 1.0 / this.freq
      const tau = 1.0 / (2 * Math.PI * cutOff)
      return 1.0 / (1.0 + tau / te)
    }

    public filter (x: number, timestamp: number | null = null) {
      if (this.lastTime && timestamp) {
        this.freq = 1.0 / (timestamp - this.lastTime)
      }
      this.lastTime = timestamp
      const prevX = this.x.lastValue()
      const dx = !prevX ? 0.0 : (x - prevX) * this.freq
      const edx = this.dx.filter(dx, this.alpha(this.dCutOff))
      const cutOff = this.minCutOff + this.beta * Math.abs(edx)
      return this.x.filter(x, this.alpha(cutOff))
    }
}
