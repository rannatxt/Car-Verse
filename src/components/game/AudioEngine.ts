// Advanced Web Audio API Engine for Bengaluru Drive Supercar
// Features: Multi-harmonic V8 synthesized roar, saturation distortion, twin-turbo spool whistle,
// wastegate blow-off flutter, exhaust backfire pops, tire screech, and dual-tone Italian horn.

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private isMuted = false;
  private masterGain: GainNode | null = null;

  // Engine audio nodes
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private screamOsc: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private distortionNode: WaveShaperNode | null = null;
  private engineGain: GainNode | null = null;

  // Turbo whistle nodes
  private turboOsc: OscillatorNode | null = null;
  private turboFilter: BiquadFilterNode | null = null;
  private turboGain: GainNode | null = null;

  // Tire screech nodes
  private skidNoise: AudioBufferSourceNode | null = null;
  private skidFilter: BiquadFilterNode | null = null;
  private skidGain: GainNode | null = null;

  // Horn nodes
  private hornOsc1: OscillatorNode | null = null;
  private hornOsc2: OscillatorNode | null = null;
  private hornGain: GainNode | null = null;
  private isHornPlaying = false;

  // State tracking
  private lastThrottle = 0;
  private lastGear = 1;
  private popCooldown = 0;

  // Generate distortion curve for warm analog exhaust saturation
  private makeDistortionCurve(amount = 25): Float32Array {
    const k = amount;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  public init() {
    if (this.isInitialized) return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master Volume
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // --- 1. Supercar V8 Combustion Synthesis ---
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.distortionNode = this.ctx.createWaveShaper();
      this.distortionNode.curve = this.makeDistortionCurve(18) as unknown as Float32Array<ArrayBuffer>;
      this.distortionNode.oversample = '4x';

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
      this.engineFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

      // Primary V8 Firing Tone (Sawtooth)
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sawtooth';
      this.osc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      // Secondary Harmonic (Triangle for mechanical cylinder punch)
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(110, this.ctx.currentTime);

      // Deep Sub-Bass Exhaust Thrum (Sine)
      this.subOsc = this.ctx.createOscillator();
      this.subOsc.type = 'sine';
      this.subOsc.frequency.setValueAtTime(28, this.ctx.currentTime);

      // High-RPM V8 Scream Overstone
      this.screamOsc = this.ctx.createOscillator();
      this.screamOsc.type = 'sawtooth';
      this.screamOsc.frequency.setValueAtTime(220, this.ctx.currentTime);

      this.osc1.connect(this.distortionNode);
      this.osc2.connect(this.distortionNode);
      this.subOsc.connect(this.distortionNode);
      this.screamOsc.connect(this.distortionNode);

      this.distortionNode.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      this.osc1.start();
      this.osc2.start();
      this.subOsc.start();
      this.screamOsc.start();

      // --- 2. Twin-Turbo Whistle Synthesis ---
      this.turboOsc = this.ctx.createOscillator();
      this.turboOsc.type = 'sine';
      this.turboOsc.frequency.setValueAtTime(1200, this.ctx.currentTime);

      this.turboFilter = this.ctx.createBiquadFilter();
      this.turboFilter.type = 'bandpass';
      this.turboFilter.frequency.setValueAtTime(2800, this.ctx.currentTime);
      this.turboFilter.Q.setValueAtTime(6.0, this.ctx.currentTime);

      this.turboGain = this.ctx.createGain();
      this.turboGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.turboOsc.connect(this.turboFilter);
      this.turboFilter.connect(this.turboGain);
      this.turboGain.connect(this.masterGain);
      this.turboOsc.start();

      // --- 3. Tire Screech (Procedural Noise) ---
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.skidGain = this.ctx.createGain();
      this.skidGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.skidFilter = this.ctx.createBiquadFilter();
      this.skidFilter.type = 'bandpass';
      this.skidFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      this.skidFilter.Q.setValueAtTime(4.5, this.ctx.currentTime);

      this.skidNoise = this.ctx.createBufferSource();
      this.skidNoise.buffer = noiseBuffer;
      this.skidNoise.loop = true;
      this.skidNoise.connect(this.skidFilter);
      this.skidFilter.connect(this.skidGain);
      this.skidGain.connect(this.masterGain);
      this.skidNoise.start();

      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioEngine initialization error:', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public update(
    rpm: number,
    throttle: number,
    speedKmh: number,
    slipRatio: number,
    gear: number | string
  ) {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;

    const time = this.ctx.currentTime;
    const numericGear = typeof gear === 'number' ? gear : 1;

    // Detect gear shift pop
    if (numericGear !== this.lastGear) {
      this.playGearShiftPop();
      this.lastGear = numericGear;
    }

    // Detect sudden throttle lift at high RPM -> Turbo blow-off flutter
    if (this.lastThrottle > 0.65 && throttle < 0.2 && rpm > 4200) {
      this.playTurboWhoosh();
      this.playExhaustCrackles();
    }
    this.lastThrottle = throttle;

    // --- V8 Engine Pitch & Harmonics ---
    // Idle 1100 RPM -> ~48Hz; Redline 8500 RPM -> ~520Hz
    const rpmNorm = Math.min(1.0, Math.max(0, (rpm - 1000) / 7500));
    const baseFreq = 46 + rpmNorm * 420;

    this.osc1?.frequency.setTargetAtTime(baseFreq, time, 0.035);
    this.osc2?.frequency.setTargetAtTime(baseFreq * 1.5, time, 0.035);
    this.subOsc?.frequency.setTargetAtTime(baseFreq * 0.5, time, 0.04);
    this.screamOsc?.frequency.setTargetAtTime(baseFreq * 2.0, time, 0.035);

    // Resonant Filter opens wide with throttle load
    const filterCutoff = 380 + throttle * 3200 + rpmNorm * 2400;
    this.engineFilter?.frequency.setTargetAtTime(filterCutoff, time, 0.04);

    // Engine volume: deep roar under throttle, subtle throaty purr at idle
    const targetGain = 0.22 + throttle * 0.48 + rpmNorm * 0.25;
    this.engineGain?.gain.setTargetAtTime(targetGain, time, 0.04);

    // --- Turbocharger Spool Whistle ---
    if (this.turboOsc && this.turboGain && this.turboFilter) {
      const turboBoost = throttle * (0.3 + rpmNorm * 0.7);
      const turboFreq = 1800 + turboBoost * 3200;
      this.turboOsc.frequency.setTargetAtTime(turboFreq, time, 0.06);
      this.turboFilter.frequency.setTargetAtTime(turboFreq, time, 0.06);
      this.turboGain.gain.setTargetAtTime(turboBoost * 0.16, time, 0.08);
    }

    // --- Tire Skid Screech ---
    if (this.skidGain && this.skidFilter) {
      if (slipRatio > 0.18 && speedKmh > 10) {
        const skidVol = Math.min(0.65, (slipRatio - 0.18) * 1.4);
        this.skidGain.gain.setTargetAtTime(skidVol, time, 0.04);
        this.skidFilter.frequency.setTargetAtTime(1050 + Math.min(700, speedKmh * 5), time, 0.04);
      } else {
        this.skidGain.gain.setTargetAtTime(0, time, 0.07);
      }
    }
  }

  // Gear shift ignition cut pop
  private playGearShiftPop() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      const popFilter = this.ctx.createBiquadFilter();

      popOsc.type = 'sawtooth';
      popOsc.frequency.setValueAtTime(160, this.ctx.currentTime);
      popOsc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.11);

      popFilter.type = 'bandpass';
      popFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

      popGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.13);

      popOsc.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(this.masterGain);

      popOsc.start();
      popOsc.stop(this.ctx.currentTime + 0.14);
    } catch {
      // Ignore
    }
  }

  // Turbo blow-off valve flutter ("psssh-tsu-tsu")
  private playTurboWhoosh() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const dur = 0.45;
      const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
      const out = noiseBuffer.getChannelData(0);
      for (let i = 0; i < out.length; i++) {
        // Modulated flutter envelope
        const flutter = Math.sin((i / this.ctx.sampleRate) * 45) * 0.35 + 0.65;
        out[i] = (Math.random() * 2 - 1) * flutter;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3200, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1100, this.ctx.currentTime + dur * 0.9);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start();
      noise.stop(this.ctx.currentTime + dur + 0.02);
    } catch {
      // Ignore
    }
  }

  // Exhaust crackles on deceleration / overrun
  private playExhaustCrackles() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const numPops = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numPops; i++) {
      const delay = 0.06 + i * 0.08 + Math.random() * 0.04;
      setTimeout(() => {
        if (!this.ctx || !this.masterGain || this.isMuted) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180 + Math.random() * 80, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.06);

          gain.gain.setValueAtTime(0.32, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.08);
        } catch {
          // Ignore
        }
      }, delay * 1000);
    }
  }

  // Italian twin-tone air horn
  public startHorn() {
    if (!this.ctx || !this.masterGain || this.isHornPlaying || this.isMuted) return;

    try {
      this.hornOsc1 = this.ctx.createOscillator();
      this.hornOsc2 = this.ctx.createOscillator();
      this.hornGain = this.ctx.createGain();

      this.hornOsc1.type = 'sawtooth';
      this.hornOsc2.type = 'sawtooth';
      this.hornOsc1.frequency.setValueAtTime(420, this.ctx.currentTime);
      this.hornOsc2.frequency.setValueAtTime(510, this.ctx.currentTime);

      const hornFilter = this.ctx.createBiquadFilter();
      hornFilter.type = 'lowpass';
      hornFilter.frequency.setValueAtTime(2400, this.ctx.currentTime);

      this.hornGain.gain.setValueAtTime(0.55, this.ctx.currentTime);

      this.hornOsc1.connect(hornFilter);
      this.hornOsc2.connect(hornFilter);
      hornFilter.connect(this.hornGain);
      this.hornGain.connect(this.masterGain);

      this.hornOsc1.start();
      this.hornOsc2.start();
      this.isHornPlaying = true;
    } catch {
      // Ignore
    }
  }

  public stopHorn() {
    if (!this.isHornPlaying || !this.hornGain || !this.ctx) return;

    try {
      this.hornGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04);
      setTimeout(() => {
        try {
          this.hornOsc1?.stop();
          this.hornOsc2?.stop();
          this.hornOsc1?.disconnect();
          this.hornOsc2?.disconnect();
          this.hornGain?.disconnect();
        } catch {
          // Ignore
        }
        this.isHornPlaying = false;
      }, 50);
    } catch {
      this.isHornPlaying = false;
    }
  }

  public playBump() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.38, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch {
      // Ignore
    }
  }

  // Metallic & heavy impact collision sound
  public playCrash(intensity = 1.0) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const time = this.ctx.currentTime;
      const vol = Math.min(0.85, 0.45 * intensity);

      // 1. Heavy low-end impact punch
      const punchOsc = this.ctx.createOscillator();
      const punchGain = this.ctx.createGain();
      punchOsc.type = 'triangle';
      punchOsc.frequency.setValueAtTime(140, time);
      punchOsc.frequency.exponentialRampToValueAtTime(28, time + 0.22);
      punchGain.gain.setValueAtTime(vol, time);
      punchGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
      punchOsc.connect(punchGain);
      punchGain.connect(this.masterGain);
      punchOsc.start(time);
      punchOsc.stop(time + 0.26);

      // 2. Metallic barrier / crumple noise burst
      const dur = 0.28;
      const noiseBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.22));
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, time);
      filter.frequency.exponentialRampToValueAtTime(350, time + dur);
      filter.Q.setValueAtTime(3.0, time);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(vol * 0.7, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noiseSource.start(time);
      noiseSource.stop(time + dur + 0.02);
    } catch {
      // Ignore
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.75, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public cleanup() {
    try {
      this.osc1?.stop();
      this.osc2?.stop();
      this.subOsc?.stop();
      this.screamOsc?.stop();
      this.turboOsc?.stop();
      this.skidNoise?.stop();
      this.ctx?.close();
    } catch {
      // Ignore
    }
    this.isInitialized = false;
  }
}

export const audioEngine = new AudioEngine();
