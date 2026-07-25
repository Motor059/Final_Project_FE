const NL = '\n';

// 정점 셰이더
const VS = [
  'precision highp float;',
  'attribute vec3 aPos;',
  'uniform mat4 uMVP;',
  'uniform float uTime,uBlend,uAmp,uDPR;',
  'varying vec3 vCol;',
  'varying float vAlpha;',
  'vec3 mod289v3(vec3 x){return x-floor(x*(1./289.))*289.;}',
  'vec4 mod289v4(vec4 x){return x-floor(x*(1./289.))*289.;}',
  'vec4 permute(vec4 x){return mod289v4(((x*34.)+1.)*x);}',
  'vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}',
  'float snoise(vec3 v){',
  '  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);',
  '  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);',
  '  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;',
  '  vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);',
  '  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;',
  '  i=mod289v3(i);',
  '  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));',
  '  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;',
  '  vec4 j=p-49.*floor(p*ns.z*ns.z);',
  '  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);',
  '  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);',
  '  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);',
  '  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;',
  '  vec4 sh=-step(h,vec4(0.));',
  '  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;',
  '  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);',
  '  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));',
  '  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;',
  '  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;',
  '  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));',
  '}',
  'void main(){',
  '  float n1=snoise(aPos*2.5+uTime*0.35)*0.045;',
  '  float n2=snoise(aPos*7.0+uTime*0.68)*0.015;',
  '  float noiseD=n1+n2;',
  '  float amp=max(uAmp,0.20);',
  '  float p1=sin(uTime*8.5)*0.13;',
  '  float p2=sin(uTime*14.2)*0.05;',
  '  float p3=sin(uTime*5.3)*0.08;',
  '  float radPulse=p1+p2+p3;',
  '  float rip1=snoise(aPos*3.5+uTime*1.4)*0.07;',
  '  float rip2=snoise(aPos*7.0-uTime*2.1)*0.04;',
  '  float rip3=snoise(aPos*1.8+vec3(uTime*0.9,0.,0.))*0.05;',
  '  float surface=rip1+rip2+rip3;',
  '  float waveD=(radPulse+surface)*(0.28+amp*0.30);',
  '  float disp=mix(noiseD,waveD,uBlend);',
  '  vec3 dp=aPos*(1.0+disp);',
  '  gl_Position=uMVP*vec4(dp,1.0);',
  '  float w=max(gl_Position.w,0.5);',
  '  float baseSize=(3.8+abs(disp)*14.0)*uDPR;',
  '  gl_PointSize=clamp(baseSize/w,1.0,18.0);',
  '  vec3 purpleHi=vec3(0.667,0.392,1.000);',
  '  vec3 orangeMid=vec3(1.000,0.627,0.353);',
  '  vec3 tealLow=vec3(0.314,0.824,0.608);',
  '  float ty=aPos.y*0.5+0.5;',
  '  float tx=aPos.x*0.5+0.5;',
  '  vec3 c=mix(tealLow,orangeMid,clamp(ty*2.0,0.0,1.0));',
  '  c=mix(c,purpleHi,clamp((ty-0.5)*2.0,0.0,1.0));',
  '  c+=(tx-0.5)*vec3(0.06,-0.03,0.08);',
  '  c=c*0.80+vec3(0.20);',
  '  c=c+vec3(max(disp,0.0)*0.70);',
  '  vCol=clamp(c,0.0,1.0);',
  '  float depthA=clamp(2.2/w,0.12,1.0);',
  '  vAlpha=clamp((0.90+abs(disp)*3.0)*depthA,0.0,1.0);',
  '}'
].join(NL);

// 프래그먼트 셰이더
const FS = [
  'precision mediump float;',
  'varying vec3 vCol;varying float vAlpha;',
  'uniform float uOpacity;',
  'void main(){',
  '  vec2 c=gl_PointCoord-vec2(0.5);',
  '  float d=length(c)*2.0;',
  '  float a=smoothstep(1.0,0.2,d);',
  '  gl_FragColor=vec4(vCol,clamp(vAlpha*a*uOpacity,0.0,1.0));',
  '}'
].join(NL);

function perspMat(fov: number, n: number, f: number): Float32Array {
  const t = 1.0 / Math.tan(fov / 2);
  return new Float32Array([t, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]);
}

function rotYMat(a: number): Float32Array {
  const c = Math.cos(a), s = Math.sin(a);
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
}

function transMat(x: number, y: number, z: number): Float32Array {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
}

function mulMat(a: Float32Array, b: Float32Array): Float32Array {
  const r = new Float32Array(16);
  for (let col = 0; col < 4; col++)
    for (let row = 0; row < 4; row++)
      r[col * 4 + row] = a[row] * b[col * 4] + a[4 + row] * b[col * 4 + 1] + a[8 + row] * b[col * 4 + 2] + a[12 + row] * b[col * 4 + 3];
  return r;
}

function fibSphere(n: number): Float32Array {
  const pts = new Float32Array(n * 3), g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = g * i;
    pts[i * 3] = r * Math.cos(th); pts[i * 3 + 1] = y; pts[i * 3 + 2] = r * Math.sin(th);
  }
  return pts;
}

export type OrbState = 'idle' | 'asking' | 'recording' | 'thinking';

export class OrbEngine {
  private canvas: HTMLCanvasElement;
  private bgEl: HTMLElement | null;
  private gl: WebGLRenderingContext | null = null;
  private prog: WebGLProgram | null = null;
  private vbo: WebGLBuffer | null = null;
  private u: Record<string, WebGLUniformLocation | null> = {};
  
  private reqId: number = 0;
  private DPR = 1;
  private S = 160;
  private N_PTS = 1200;

  private orbAgentState: 'talking' | 'listening' | 'thinking' | null = null;
  private orbBlend = 0;
  private orbAmp = 0;
  private orbRotY = 0;
  private orbOpacity = 0;
  private orbTime = 0;
  private orbLast = 0;

  constructor(canvas: HTMLCanvasElement, bgEl: HTMLElement | null) {
    this.canvas = canvas;
    this.bgEl = bgEl;
    this.DPR = Math.min(window.devicePixelRatio || 1, 2);
    this.initGL();
  }

  private mkShader(type: number, src: string): WebGLShader | null {
    if (!this.gl) return null;
    const sh = this.gl.createShader(type);
    if (!sh) return null;
    this.gl.shaderSource(sh, src);
    this.gl.compileShader(sh);
    if (!this.gl.getShaderParameter(sh, this.gl.COMPILE_STATUS)) {
      console.error('[OrbEngine]', this.gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }

  private initGL() {
    this.canvas.width = this.S * this.DPR;
    this.canvas.height = this.S * this.DPR;
    this.canvas.style.width = this.S + 'px';
    this.canvas.style.height = this.S + 'px';
    
    this.gl = this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true }) ||
              this.canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false }) as WebGLRenderingContext;
    
    if (!this.gl) {
      console.warn('[OrbEngine] no WebGL');
      return;
    }

    const vs = this.mkShader(this.gl.VERTEX_SHADER, VS);
    const fs = this.mkShader(this.gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;

    this.prog = this.gl.createProgram();
    if (!this.prog) return;

    this.gl.attachShader(this.prog, vs);
    this.gl.attachShader(this.prog, fs);
    this.gl.linkProgram(this.prog);

    if (!this.gl.getProgramParameter(this.prog, this.gl.LINK_STATUS)) return;

    this.vbo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, fibSphere(this.N_PTS), this.gl.STATIC_DRAW);

    this.u.uMVP = this.gl.getUniformLocation(this.prog, 'uMVP');
    this.u.uTime = this.gl.getUniformLocation(this.prog, 'uTime');
    this.u.uBlend = this.gl.getUniformLocation(this.prog, 'uBlend');
    this.u.uAmp = this.gl.getUniformLocation(this.prog, 'uAmp');
    this.u.uDPR = this.gl.getUniformLocation(this.prog, 'uDPR');
    this.u.uOpacity = this.gl.getUniformLocation(this.prog, 'uOpacity');
    this.u.aPos = this.gl.getAttribLocation(this.prog, 'aPos');

    this.gl.clearColor(0, 0, 0, 0);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.viewport(0, 0, this.S * this.DPR, this.S * this.DPR);
    
    this.orbLast = performance.now();
    this.renderLoop(this.orbLast);
  }

  private renderLoop = (ts: number) => {
    if (!this.gl || !this.prog) return;
    this.reqId = requestAnimationFrame(this.renderLoop);

    const dt = Math.min((ts - this.orbLast) / 1000, 0.05);
    this.orbLast = ts;
    this.orbTime += dt;
    
    if (this.orbOpacity < 1.0) this.orbOpacity = Math.min(1.0, this.orbOpacity + dt * 2.0);
    
    let blendTgt = 0, ampTgt = 0, rotSpd = 0.10;
    const t = this.orbTime;

    if (this.orbAgentState === 'talking') {
      blendTgt = 0.45 + Math.sin(t * 7.0) * 0.20 + Math.sin(t * 13.2) * 0.05;
      ampTgt = 0.48 + Math.sin(t * 5.2) * 0.18;
      rotSpd = 0.20;
    } else if (this.orbAgentState === 'listening') {
      blendTgt = 0.0; ampTgt = 0.0; rotSpd = 0.13;
    } else if (this.orbAgentState === 'thinking') {
      blendTgt = 0.10 + Math.sin(t * 1.6) * 0.10;
      ampTgt = 0.14 + Math.sin(t * 1.6) * 0.12;
      rotSpd = 0.06;
    } else {
      blendTgt = 0.0; ampTgt = 0.0; rotSpd = 0.08;
    }

    this.orbBlend += (blendTgt - this.orbBlend) * 0.28;
    this.orbAmp += (ampTgt - this.orbAmp) * 0.28;
    this.orbRotY += dt * rotSpd;

    // 배경 CSS Glow 요소 팽창 효과 동기화
    if (this.bgEl) {
      if (this.orbAgentState === 'talking') {
        const _rp = Math.sin(t * 8.5) * 0.13 + Math.sin(t * 14.2) * 0.05 + Math.sin(t * 5.3) * 0.08;
        const _wd = _rp * (0.28 + this.orbAmp * 0.30);
        const _s = (1.0 + _wd * this.orbBlend).toFixed(4);
        this.bgEl.style.transform = `translate(-50%, -50%) scale(${_s})`;
      } else {
        this.bgEl.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    }

    const proj = perspMat(Math.PI / 4.2, 0.1, 20);
    const mv = mulMat(transMat(0, 0, -2.8), rotYMat(this.orbRotY));
    const mvp = mulMat(proj, mv);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.prog);
    this.gl.uniformMatrix4fv(this.u.uMVP, false, mvp);
    this.gl.uniform1f(this.u.uTime, this.orbTime);
    this.gl.uniform1f(this.u.uBlend, this.orbBlend);
    this.gl.uniform1f(this.u.uAmp, this.orbAmp);
    this.gl.uniform1f(this.u.uDPR, this.DPR);
    this.gl.uniform1f(this.u.uOpacity, this.orbOpacity);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
    this.gl.enableVertexAttribArray(this.u.aPos!);
    this.gl.vertexAttribPointer(this.u.aPos!, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.drawArrays(this.gl.POINTS, 0, this.N_PTS);
  };

  // 외부에서 상태를 주입하는 메서드
  public setState(state: OrbState) {
    if (state === 'asking') this.orbAgentState = 'talking';
    else if (state === 'recording') this.orbAgentState = 'listening';
    else if (state === 'thinking') this.orbAgentState = 'thinking';
    else this.orbAgentState = null;
  }

  // 메모리 누수 방지를 위한 클린업 메서드
  public destroy() {
    cancelAnimationFrame(this.reqId);
    if (this.gl) {
      this.gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  }
}