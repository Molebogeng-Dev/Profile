/**
 * INTERACTIVE 3D PLANET ENGINE WITH 4 INTEGRATED PHOTOS & CLEAR GLASS GLOW
 * - Seamlessly wraps 4 photos around the rotating 3D sphere:
 *   1. Professional suit portrait (profile.jpg)
 *   2. Brown jacket portrait (photo2.jpg)
 *   3. Whiteboard Java presentation (photo3.jpg)
 *   4. Team collaboration & mentoring (photo4.jpg)
 * - Clear, clean lighting (NO blue tint, 100% natural photo fidelity)
 * - Transparent glass rim reflection defining spherical planet form
 * - Full responsive auto-resizing across all devices
 * - Touch & mouse drag to spin with smooth continuous auto-rotation
 */

class CosmicPlanet {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.gl = this.canvas.getContext('webgl', { antialias: true, alpha: true }) ||
              this.canvas.getContext('experimental-webgl', { antialias: true, alpha: true });

    if (!this.gl) {
      console.error('WebGL is not supported in this browser.');
      return;
    }

    // Rotation & Physics
    // Initial rotY of 45 degrees (PI/4) brings Photo 1 (Suit portrait) directly to the front
    this.rotX = 0;
    this.rotY = Math.PI / 4;
    this.targetRotX = 0;
    this.targetRotY = Math.PI / 4;
    this.autoRotateSpeed = 0.004; // Smooth continuous planetary spin
    this.autoRotate = true;

    // Drag interaction (Mouse & Touch)
    this.isDragging = false;
    this.previousPointerPosition = { x: 0, y: 0 };
    this.dragVelocity = { x: 0, y: 0 };

    // Mouse/Touch Parallax Tilt
    this.parallaxTilt = { x: 0, y: 0 };

    this.init();
  }

  init() {
    this.setupCanvas();
    this.initShaders();
    this.createSphereMesh(64, 64);
    this.loadAllPhotosTexture();
    this.setupInteractions();

    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('orientationchange', () => this.onResize());

    // Start render loop
    requestAnimationFrame((t) => this.render(t));
  }

  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const size = rect.width || 300;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);

    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);
  }

  onResize() {
    this.setupCanvas();
  }

  initShaders() {
    const vsSource = `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      attribute vec2 aTexCoord;

      uniform mat4 uModelMatrix;
      uniform mat4 uViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform mat3 uNormalMatrix;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vTexCoord;

      void main(void) {
        vec4 pos = uModelMatrix * vec4(aPosition, 1.0);
        vPosition = pos.xyz;
        vNormal = normalize(uNormalMatrix * aNormal);
        vTexCoord = aTexCoord;
        gl_Position = uProjectionMatrix * uViewMatrix * pos;
      }
    `;

    // Fragment Shader: Pure crystal-clear photo fidelity (ZERO white mask, 100% natural photo clarity)
    const fsSource = `
      precision highp float;

      varying vec2 vTexCoord;

      uniform sampler2D uTexture;

      void main(void) {
        // Direct true-color photo sample with zero white mask or glow washing out clarity
        vec4 texColor = texture2D(uTexture, vTexCoord);
        gl_FragColor = vec4(texColor.rgb, 1.0);
      }
    `;

    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fsSource);

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error('Shader program link failed: ' + this.gl.getProgramInfoLog(this.program));
      return;
    }

    this.attribs = {
      position: this.gl.getAttribLocation(this.program, 'aPosition'),
      normal: this.gl.getAttribLocation(this.program, 'aNormal'),
      texCoord: this.gl.getAttribLocation(this.program, 'aTexCoord')
    };

    this.uniforms = {
      modelMatrix: this.gl.getUniformLocation(this.program, 'uModelMatrix'),
      viewMatrix: this.gl.getUniformLocation(this.program, 'uViewMatrix'),
      projectionMatrix: this.gl.getUniformLocation(this.program, 'uProjectionMatrix'),
      normalMatrix: this.gl.getUniformLocation(this.program, 'uNormalMatrix'),
      texture: this.gl.getUniformLocation(this.program, 'uTexture')
    };
  }

  compileShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error: ' + this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  createSphereMesh(latBands, lonBands) {
    const radius = 1.0;
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let lat = 0; lat <= latBands; lat++) {
      const theta = (lat * Math.PI) / latBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let lon = 0; lon <= lonBands; lon++) {
        const phi = (lon * 2 * Math.PI) / lonBands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;

        // u: longitude [0, 1]
        // v: lat=0 (North Pole, y=+1) maps to v=1.0 (upright images)
        const u = lon / lonBands;
        const v = 1.0 - (lat / latBands);

        normals.push(x, y, z);
        uvs.push(u, v);
        positions.push(radius * x, radius * y, radius * z);
      }
    }

    for (let lat = 0; lat < latBands; lat++) {
      for (let lon = 0; lon < lonBands; lon++) {
        const first = lat * (lonBands + 1) + lon;
        const second = first + lonBands + 1;

        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }

    this.indexCount = indices.length;

    this.posBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.posBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

    this.normBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);

    this.uvBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.uvBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(uvs), this.gl.STATIC_DRAW);

    this.idxBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.idxBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
  }

  loadAllPhotosTexture() {
    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

    // Initial 1x1 black placeholder
    this.gl.texImage2D(
      this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0,
      this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255])
    );

    const imagePaths = [
      'assets/images/profile.jpg', // Photo 1: Suit portrait
      'assets/images/photo2.jpg',  // Photo 2: Brown jacket portrait
      'assets/images/photo3.jpg',  // Photo 3: Whiteboard Java presentation
      'assets/images/photo4.jpg'   // Photo 4: Collaboration & teamwork
    ];

    const loadedImages = [];
    let loadedCount = 0;

    imagePaths.forEach((src, idx) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        loadedImages[idx] = img;
        loadedCount++;
        if (loadedCount === imagePaths.length) {
          this.buildEquirectangularComposite(loadedImages);
        }
      };
      img.onerror = () => {
        console.warn('Could not load image: ' + src);
        loadedCount++;
        if (loadedCount === imagePaths.length) {
          this.buildEquirectangularComposite(loadedImages);
        }
      };
    });
  }

  buildEquirectangularComposite(images) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const totalW = canvas.width;
    const totalH = canvas.height;
    const count = images.length;
    const sectorW = totalW / count; // 512px per photo

    // Stretch each photo to fill its entire sector and pole-to-pole height
    // 0 black borders, 100% full spherical coverage around the entire planet
    images.forEach((img, i) => {
      if (!img) return;
      const x = i * sectorW;
      ctx.drawImage(img, x, 0, sectorW, totalH);
    });

    // Upload composite texture to WebGL
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    // Anisotropic filtering for maximum sharpness across spherical curvature
    const ext = this.gl.getExtension('EXT_texture_filter_anisotropic') ||
                this.gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
                this.gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
    if (ext) {
      const maxAnisotropy = this.gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      this.gl.texParameterf(this.gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, maxAnisotropy);
    }
  }

  setupInteractions() {
    const stage = this.canvas.parentElement;

    const onPointerDown = (e) => {
      this.isDragging = true;
      this.previousPointerPosition = { x: e.clientX, y: e.clientY };
      this.dragVelocity = { x: 0, y: 0 };
    };

    const onPointerMove = (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.previousPointerPosition.x;
        const deltaY = e.clientY - this.previousPointerPosition.y;

        this.dragVelocity = { x: deltaX * 0.006, y: deltaY * 0.006 };
        this.targetRotY += this.dragVelocity.x;
        this.targetRotX += this.dragVelocity.y;

        // Clamp X tilt
        this.targetRotX = Math.max(-0.85, Math.min(0.85, this.targetRotX));
        this.previousPointerPosition = { x: e.clientX, y: e.clientY };
      }

      // Parallax tilt from screen center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      this.parallaxTilt.y = (e.clientX - centerX) * 0.00018;
      this.parallaxTilt.x = (e.clientY - centerY) * 0.00018;
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    stage.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  render(currentTime) {
    // Continuous planetary auto-orbit
    if (this.autoRotate && !this.isDragging) {
      this.targetRotY += this.autoRotateSpeed;
    }

    // Drag inertia
    if (!this.isDragging) {
      this.targetRotY += this.dragVelocity.x;
      this.targetRotX += this.dragVelocity.y;
      this.dragVelocity.x *= 0.92;
      this.dragVelocity.y *= 0.92;
    }

    this.rotX += (this.targetRotX - this.rotX) * 0.08;
    this.rotY += (this.targetRotY - this.rotY) * 0.08;

    // Clear buffer
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.useProgram(this.program);

    // Matrix calculations
    const aspect = this.canvas.width / this.canvas.height;
    const projMatrix = this.createPerspectiveMatrix(45, aspect, 0.1, 100.0);
    const viewMatrix = this.createTranslationMatrix(0, 0, -2.65);

    const totalRotX = this.rotX + this.parallaxTilt.x;
    const totalRotY = this.rotY + this.parallaxTilt.y;

    const rotXMat = this.createRotationXMatrix(totalRotX);
    const rotYMat = this.createRotationYMatrix(totalRotY);
    const modelMatrix = this.multiplyMatrices(rotXMat, rotYMat);
    const normalMatrix = this.createNormalMatrix(modelMatrix);

    // Upload Uniforms
    this.gl.uniformMatrix4fv(this.uniforms.projectionMatrix, false, projMatrix);
    this.gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, viewMatrix);
    this.gl.uniformMatrix4fv(this.uniforms.modelMatrix, false, modelMatrix);
    this.gl.uniformMatrix3fv(this.uniforms.normalMatrix, false, normalMatrix);

    // Bind Composite Photo Texture
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.uniform1i(this.uniforms.texture, 0);

    // Bind Geometry Attributes
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.posBuffer);
    this.gl.vertexAttribPointer(this.attribs.position, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.attribs.position);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normBuffer);
    this.gl.vertexAttribPointer(this.attribs.normal, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.attribs.normal);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.uvBuffer);
    this.gl.vertexAttribPointer(this.attribs.texCoord, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.attribs.texCoord);

    // Render Sphere
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.idxBuffer);
    this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame((t) => this.render(t));
  }

  // --- Matrix Utility Helpers ---
  createPerspectiveMatrix(fovDegrees, aspect, near, far) {
    const fov = (fovDegrees * Math.PI) / 180;
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ]);
  }

  createTranslationMatrix(x, y, z) {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ]);
  }

  createRotationXMatrix(rad) {
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    return new Float32Array([
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1
    ]);
  }

  createRotationYMatrix(rad) {
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    return new Float32Array([
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1
    ]);
  }

  multiplyMatrices(a, b) {
    const out = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        out[j * 4 + i] =
          a[i] * b[j * 4] +
          a[i + 4] * b[j * 4 + 1] +
          a[i + 8] * b[j * 4 + 2] +
          a[i + 12] * b[j * 4 + 3];
      }
    }
    return out;
  }

  createNormalMatrix(m) {
    return new Float32Array([
      m[0], m[1], m[2],
      m[4], m[5], m[6],
      m[8], m[9], m[10]
    ]);
  }
}

window.CosmicPlanet = CosmicPlanet;
