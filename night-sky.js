/* Native WebGL: one background pass, local NASA texture, no external dependencies. */
(() => {
  'use strict';
  const canvas = document.getElementById('night-canvas');
  const toggle = document.getElementById('sky-toggle');
  if (!canvas || !toggle) return;
  const sky = canvas.parentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let gl;
  try { gl = canvas.getContext('webgl', { alpha:false, antialias:false, depth:false, powerPreference:'low-power' }); }
  catch { return; }
  if (!gl) return; // Static local lunar image is already visible.
  const vertex = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
  const fragment = `
    precision mediump float;
    uniform vec2 resolution;
    uniform vec3 moon;
    uniform float time;
    uniform sampler2D lunarMap;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+7.1;a*=.5;}return v;}
    void main(){
      vec2 uv=gl_FragCoord.xy/resolution;
      vec2 p=gl_FragCoord.xy;
      vec2 center=moon.xy + vec2(sin(time*.003)*resolution.x*.08, sin(time*.002)*resolution.y*.035);
      float radius=moon.z;
      float dist=length(p-center)/radius;
      vec3 color=mix(vec3(.038,.049,.09),vec3(.024,.035,.07),uv.y);
      color+=vec3(.032,.025,.045)*fbm(uv*3.+vec2(time*.001,0.));
      float halo=exp(-dist*dist*.35);
      color+=vec3(.075,.091,.12)*halo;
      // Stable sky coordinates; only brightness changes slightly over time.
      vec2 cell=floor(p/37.);
      vec2 f=fract(p/37.);
      vec2 star=vec2(.2+.6*hash(cell),.2+.6*hash(cell+19.));
      float seed=hash(cell+43.);
      float twinkle=.8+.2*sin(time*.35+seed*50.);
      float point=1.-smoothstep(.008,.035,length(f-star));
      color+=vec3(.68,.73,.85)*point*step(.72,seed)*twinkle*(1.-halo*.95)*.7;
      if(dist<1.005){
        vec2 nxy=(p-center)/radius;
        float z=sqrt(max(0.,1.-dot(nxy,nxy)));
        vec2 tex=vec2(.5+atan(nxy.x,z)/6.2831853,.5-asin(clamp(nxy.y,-1.,1.))/3.14159265);
        vec3 lunar=texture2D(lunarMap,tex).rgb*(.77+.23*z)*1.15;
        color=mix(color,lunar,1.-smoothstep(.995,1.005,dist));
      }
      // Thin terrestrial cloud veil; deliberately low contrast.
      float cloud=smoothstep(.49,.79,fbm(vec2(uv.x*3.5-time*.004,uv.y*7.+time*.001)));
      color=mix(color,vec3(.12,.14,.18),cloud*.22);
      gl_FragColor=vec4(color,1.);
    }`;
  let program, buffer, texture, uniforms;
  let ready=false, lost=false, paused=reduce.matches, frame=0, elapsed=0, last=0, lastDraw=0;
  function compile(type, source){
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source); gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {gl.deleteShader(shader);throw Error('Sky shader unavailable');}
    return shader;
  }
  function setup(image){
    const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
    program=gl.createProgram(); gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    gl.deleteShader(vs);gl.deleteShader(fs);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw Error('Sky unavailable');
    gl.useProgram(program);
    buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position');
    gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
    uniforms={resolution:gl.getUniformLocation(program,'resolution'),moon:gl.getUniformLocation(program,'moon'),time:gl.getUniformLocation(program,'time')};
    gl.uniform1i(gl.getUniformLocation(program,'lunarMap'),0);
    ready=true;lost=false;resize();sky.classList.add('is-ready');toggle.hidden=false;updateToggle();start();
  }
  function draw(){
    if(!ready||lost)return;
    gl.uniform1f(uniforms.time,elapsed);
    gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function resize(){
    if(!ready||lost)return;
    const width=canvas.clientWidth,height=canvas.clientHeight;
    // Cap render pixels even on high-DPI phones and large displays.
    const scale=Math.min(devicePixelRatio||1,1.25,Math.sqrt(1500000/(width*height)));
    canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);
    const mobile=width<=760;
    const radius=mobile?56:Math.min(85,Math.max(60,width*.065));
    gl.uniform3f(uniforms.moon,width*(mobile?.76:.78)*scale,(height-(mobile?146:105+radius))*scale,radius*scale);
    draw();
  }
  function tick(now){
    frame=0;
    if(paused||document.hidden||lost||!ready)return;
    if(last)elapsed+=Math.min((now-last)/1000,.1);
    last=now;
    if(now-lastDraw>=1000/30){draw();lastDraw=now;}
    frame=requestAnimationFrame(tick);
  }
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
  function start(){if(!frame&&!paused&&!document.hidden&&!lost&&ready)frame=requestAnimationFrame(tick);}
  function updateToggle(){toggle.textContent=paused?'Animar cielo':'Pausar cielo';toggle.setAttribute('aria-pressed',String(paused));}
  toggle.addEventListener('click',()=>{paused=!paused;updateToggle();if(paused)stop();else start();});
  reduce.addEventListener('change',()=>{paused=reduce.matches;updateToggle();if(paused)stop();else start();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();});
  window.addEventListener('pagehide',stop);
  window.addEventListener('pageshow',start);
  window.addEventListener('resize',resize,{passive:true});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;stop();sky.classList.remove('is-ready');toggle.hidden=true;});
  const image=new Image();
  image.onload=()=>{try{setup(image);}catch{sky.classList.remove('is-ready');toggle.hidden=true;}};
  image.onerror=()=>{toggle.hidden=true;};
  canvas.addEventListener('webglcontextrestored',()=>{try{setup(image);}catch{sky.classList.remove('is-ready');toggle.hidden=true;}});
  image.src='assets/luna-color-nasa.jpg';
})();
