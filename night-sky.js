/* Native WebGL night sky.
   - Full Moon uses the local NASA texture already bundled in /assets.
   - Bright-star positions use J2000 RA/Dec and are projected for Santiago, Chile.
   - The Moon follows an artistic accelerated rise-to-set arc; it is intentionally
     kept full and is not a simulation of the current lunar phase. */
(() => {
  'use strict';

  const canvas = document.getElementById('night-canvas');
  const toggle = document.getElementById('sky-toggle');
  if (!canvas || !toggle) return;

  const sky = canvas.parentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const DEG = Math.PI / 180;
  const TWO_PI = Math.PI * 2;

  // Santiago de Chile reference point requested for the sky.
  const OBSERVER = { lat: -33.4489 * DEG, lon: -70.6693 };

  // [name, right ascension hours (J2000), declination degrees (J2000), visual mag]
  // Bright-star positional reference follows HYG/Hipparcos-style J2000 data.
  // Attribution is written to assets/STAR-CREDITOS.txt by the update script.
  // Only stars above Santiago's horizon are painted.
  const STAR_CATALOG = [
    ["Sirius",6.75333,-16.71667,-1.44],
    ["Canopus",6.39833,-52.68333,-0.62],
    ["Rigil Kentaurus",14.66,-60.83333,-0.29],
    ["Arcturus",14.26167,19.18333,-0.05],
    ["Vega",18.615,38.78333,0.03],
    ["Capella",5.27833,46.0,0.08],
    ["Rigel",5.24167,-8.2,0.18],
    ["Procyon",7.655,5.23333,0.4],
    ["Betelgeuse",5.92,7.4,0.45],
    ["Achernar",1.62667,-57.23333,0.45],
    ["Hadar",14.06333,-60.36667,0.61],
    ["Altair",19.84667,8.86667,0.76],
    ["Acrux",12.44333,-63.1,0.77],
    ["Aldebaran",4.59833,16.51667,0.87],
    ["Spica",13.42,-11.16667,0.98],
    ["Antares",16.49,-26.43333,1.06],
    ["Pollux",7.755,28.03333,1.16],
    ["Fomalhaut",22.96167,-29.61667,1.17],
    ["Deneb",20.69,45.28333,1.25],
    ["Mimosa",12.795,-59.68333,1.25],
    ["Regulus",10.14,11.96667,1.36],
    ["Adhara",6.97667,-28.96667,1.5],
    ["Castor",7.57667,31.88333,1.58],
    ["Gacrux",12.52,-57.11667,1.59],
    ["Shaula",17.56,-37.1,1.62],
    ["Bellatrix",5.41833,6.35,1.64],
    ["Elnath",5.43833,28.6,1.65],
    ["Miaplacidus",9.22,-69.71667,1.67],
    ["Alnilam",5.60333,-1.2,1.69],
    ["Alnair",22.13667,-46.96667,1.73],
    ["Alnitak",5.68,-1.95,1.74],
    ["Gamma Velorum",8.15833,-47.33333,1.75],
    ["Alioth",12.9,55.96667,1.76],
    ["Mirfak",3.405,49.86667,1.79],
    ["Kaus Australis",18.40333,-34.38333,1.79],
    ["Dubhe",11.06167,61.75,1.81],
    ["Wezen",7.14,-26.38333,1.83],
    ["Alkaid",13.79167,49.31667,1.85],
    ["Avior",8.375,-59.51667,1.86],
    ["Sargas",17.62167,-43.0,1.86],
    ["Menkalinan",5.99167,44.95,1.9],
    ["Atria",16.81167,-69.03333,1.91],
    ["Delta Velorum",8.745,-54.71667,1.93],
    ["Alhena",6.62833,16.4,1.93],
    ["Peacock",20.42667,-56.73333,1.94],
    ["Mirzam",6.37833,-17.95,1.98],
    ["Alphard",9.46,-8.65,1.99],
    ["Algieba",10.33333,19.83333,2.01],
    ["Hamal",2.12,23.46667,2.01],
    ["Diphda",0.72667,-17.98333,2.04],
    ["Nunki",18.92167,-26.3,2.05],
    ["Al Dhanab",22.71167,-46.88333,2.06],
    ["Menkent",14.11167,-36.36667,2.06],
    ["Alpheratz",0.14,29.08333,2.07],
    ["Mirach",1.16167,35.61667,2.07],
    ["Saiph",5.79667,-9.66667,2.07],
    ["Rasalhague",17.58167,12.56667,2.08],
    ["Algol",3.13667,40.95,2.09],
    ["Almach",2.065,42.33333,2.1],
    ["Denebola",11.81833,14.56667,2.14],
    ["Beta Centauri?",12.69167,-48.96667,2.2],
    ["Naos",8.06,-40.0,2.21],
    ["Aspidiske",9.285,-59.28333,2.21],
    ["Alphecca",15.57833,26.71667,2.22],
    ["Kappa Velorum",9.13333,-43.43333,2.23],
    ["Mintaka",5.53333,-0.3,2.25],
    ["Epsilon Scorpii",16.83667,-34.3,2.29],
    ["Alpha Lupi",14.69833,-47.38333,2.29],
    ["Eta Centauri",13.665,-53.46667,2.29],
    ["Dschubba",16.005,-22.61667,2.29],
    ["Zeta Centauri",14.59167,-42.16667,2.33],
    ["Enif",21.73667,9.86667,2.38],
    ["Lesath",17.70833,-39.03333,2.39],
    ["Ankaa",0.43833,-42.3,2.4],
    ["Sabik",17.17333,-15.71667,2.43],
    ["Aludra",7.40167,-29.3,2.45],
    ["Delta Cygni?",20.77,33.96667,2.48],
    ["Markab",23.08,15.2,2.49],
    ["Menkar",3.03833,4.08333,2.54],
    ["Epsilon Centauri",13.925,-47.28333,2.54],
    ["Zeta Ophiuchi",16.62,-10.56667,2.54],
    ["Acrab",16.09,-19.8,2.56]
  ];

  let gl;
  try {
    gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: 'low-power'
    });
  } catch {
    return;
  }
  if (!gl) return; // Static fallback remains visible.

  const vertex = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragment = `
    precision mediump float;
    uniform vec2 resolution;
    uniform float time;
    uniform sampler2D lunarMap;
    uniform sampler2D starMap;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = p * 2.03 + 7.1;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution;

      // A complete accelerated lunar transit in ~3.5 minutes.
      // Starts just outside the left side, rises naturally, culminates high,
      // then sets beyond the right side.
      float cycle = 210.0;
      float phase = fract((time + 10.0) / cycle);
      float radius = clamp(resolution.x * 0.065, 60.0, 92.0);
      if (resolution.x < 760.0) radius = 56.0;

      float moonX = mix(-radius * 1.35, resolution.x + radius * 1.35, phase);
      float arc = sin(phase * 3.14159265359);
      float moonY = resolution.y * (0.12 + 0.62 * arc);
      vec2 center = vec2(moonX, moonY);

      vec2 p = gl_FragCoord.xy;
      float dist = length(p - center) / radius;

      vec3 color = mix(vec3(.038, .049, .09), vec3(.024, .035, .07), uv.y);
      color += vec3(.032, .025, .045) * fbm(uv * 3.0 + vec2(time * .001, 0.0));

      float halo = exp(-dist * dist * .35);
      color += vec3(.075, .091, .12) * halo;

      // Real bright-star map for Santiago. The map is regenerated on the CPU
      // from J2000 RA/Dec using current sidereal time.
      float stars = texture2D(starMap, uv).r;
      color += vec3(.72, .76, .88) * stars * (1.0 - halo * .96);

      if (dist < 1.005) {
        vec2 nxy = (p - center) / radius;
        float z = sqrt(max(0.0, 1.0 - dot(nxy, nxy)));
        vec2 tex = vec2(
          .5 + atan(nxy.x, z) / 6.2831853,
          .5 - asin(clamp(nxy.y, -1.0, 1.0)) / 3.14159265
        );
        vec3 lunar = texture2D(lunarMap, tex).rgb * (.77 + .23 * z) * 1.15;
        color = mix(color, lunar, 1.0 - smoothstep(.995, 1.005, dist));
      }

      // Thin terrestrial cloud veil; deliberately low contrast.
      float cloud = smoothstep(
        .49, .79,
        fbm(vec2(uv.x * 3.5 - time * .004, uv.y * 7.0 + time * .001))
      );
      color = mix(color, vec3(.12, .14, .18), cloud * .22);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  let program, buffer, lunarTexture, starTexture, uniforms;
  let ready = false;
  let lost = false;
  let paused = reduce.matches;
  let frame = 0;
  let elapsed = 0;
  let last = 0;
  let lastDraw = 0;
  let lastStarMinute = -1;

  const starCanvas = document.createElement('canvas');
  starCanvas.width = 1024;
  starCanvas.height = 512;
  const starCtx = starCanvas.getContext('2d');

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'Sky shader unavailable';
      gl.deleteShader(shader);
      throw Error(message);
    }
    return shader;
  }

  function wrap(value, range) {
    return ((value % range) + range) % range;
  }

  function julianDate(date) {
    return date.getTime() / 86400000 + 2440587.5;
  }

  function localSiderealHours(date) {
    const d = julianDate(date) - 2451545.0;
    const gmst = wrap(18.697374558 + 24.06570982441908 * d, 24);
    return wrap(gmst + OBSERVER.lon / 15, 24);
  }

  function horizontalPosition(raHours, decDegrees, date) {
    const dec = decDegrees * DEG;
    const hourAngle = wrap((localSiderealHours(date) - raHours) * 15 + 180, 360) * DEG - Math.PI;
    const sinAlt =
      Math.sin(dec) * Math.sin(OBSERVER.lat) +
      Math.cos(dec) * Math.cos(OBSERVER.lat) * Math.cos(hourAngle);
    const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt)));

    const east = -Math.cos(dec) * Math.sin(hourAngle);
    const north =
      Math.sin(dec) * Math.cos(OBSERVER.lat) -
      Math.cos(dec) * Math.cos(hourAngle) * Math.sin(OBSERVER.lat);
    const azimuth = wrap(Math.atan2(east, north), TWO_PI);
    return { altitude, azimuth };
  }

  function rebuildStarMap(date = new Date()) {
    if (!starCtx || !starTexture || lost) return;
    const w = starCanvas.width;
    const h = starCanvas.height;
    starCtx.clearRect(0, 0, w, h);

    for (const [, ra, dec, mag] of STAR_CATALOG) {
      const pos = horizontalPosition(ra, dec, date);
      if (pos.altitude <= 0) continue;

      // South is centered (azimuth 180Â° => u=.5); horizon bottom, zenith top.
      const u = pos.azimuth / TWO_PI;
      const v = Math.min(1, pos.altitude / (Math.PI / 2));
      const x = u * w;
      const y = (1 - v) * h;

      const brightness = Math.max(.28, Math.min(1, 1.08 - (mag + 1.5) * .15));
      const size = Math.max(1.05, 3.2 - Math.max(-1.5, mag) * .48);
      const gradient = starCtx.createRadialGradient(x, y, 0, x, y, size * 2.7);
      gradient.addColorStop(0, `rgba(255,255,255,${brightness})`);
      gradient.addColorStop(.22, `rgba(235,242,255,${brightness * .88})`);
      gradient.addColorStop(1, 'rgba(220,232,255,0)');
      starCtx.fillStyle = gradient;
      starCtx.beginPath();
      starCtx.arc(x, y, size * 2.7, 0, TWO_PI);
      starCtx.fill();
    }

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, starTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, starCanvas);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.activeTexture(gl.TEXTURE0);
  }

  function setup(image) {
    const vs = compile(gl.VERTEX_SHADER, vertex);
    const fs = compile(gl.FRAGMENT_SHADER, fragment);
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error('Sky unavailable');

    gl.useProgram(program);

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
      gl.STATIC_DRAW
    );
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    lunarTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, lunarTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    starTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, starTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    uniforms = {
      resolution: gl.getUniformLocation(program, 'resolution'),
      time: gl.getUniformLocation(program, 'time')
    };
    gl.uniform1i(gl.getUniformLocation(program, 'lunarMap'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'starMap'), 1);

    ready = true;
    lost = false;
    rebuildStarMap();
    resize();
    sky.classList.add('is-ready');
    toggle.hidden = false;
    updateToggle();
    start();
  }

  function draw() {
    if (!ready || lost) return;
    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, lunarTexture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, starTexture);
    gl.uniform1f(uniforms.time, elapsed);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function resize() {
    if (!ready || lost) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const scale = Math.min(
      devicePixelRatio || 1,
      1.25,
      Math.sqrt(1500000 / Math.max(1, width * height))
    );
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    draw();
  }

  function tick(now) {
    frame = 0;
    if (paused || document.hidden || lost || !ready) return;

    if (last) elapsed += Math.min((now - last) / 1000, .1);
    last = now;

    const minute = Math.floor(Date.now() / 60000);
    if (minute !== lastStarMinute) {
      lastStarMinute = minute;
      rebuildStarMap(new Date());
    }

    if (now - lastDraw >= 1000 / 30) {
      draw();
      lastDraw = now;
    }
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  }

  function start() {
    if (!frame && !paused && !document.hidden && !lost && ready) {
      frame = requestAnimationFrame(tick);
    }
  }

  function updateToggle() {
    toggle.textContent = paused ? 'Animar cielo' : 'Pausar cielo';
    toggle.setAttribute('aria-pressed', String(paused));
  }

  toggle.addEventListener('click', () => {
    paused = !paused;
    updateToggle();
    if (paused) {
      stop();
      draw();
    } else {
      start();
    }
  });

  reduce.addEventListener('change', () => {
    paused = reduce.matches;
    updateToggle();
    if (paused) {
      stop();
      draw();
    } else {
      start();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', start);
  window.addEventListener('resize', resize, { passive: true });

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    lost = true;
    stop();
    sky.classList.remove('is-ready');
    toggle.hidden = true;
  });

  const image = new Image();
  image.onload = () => {
    try {
      setup(image);
    } catch {
      sky.classList.remove('is-ready');
      toggle.hidden = true;
    }
  };
  image.onerror = () => {
    toggle.hidden = true;
  };

  canvas.addEventListener('webglcontextrestored', () => {
    try {
      setup(image);
    } catch {
      sky.classList.remove('is-ready');
      toggle.hidden = true;
    }
  });

  image.src = 'assets/luna-color-nasa.jpg';
})();
