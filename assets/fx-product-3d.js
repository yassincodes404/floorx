/*
 * FX Product 3D Viewer
 * 6 KG  → data-glb-6kg  (finalback.glb)
 * 1.5 KG → data-glb-1-5kg (must be a DIFFERENT bottle mesh)
 */

(function FXProduct3D() {
  'use strict';

  var container = document.getElementById('fx-product-3d-container');
  var canvas = document.getElementById('fx-product-3d-canvas');
  if (!container || !canvas) return;

  var isMobile = window.innerWidth < 768;
  /* Camera distance = zoom (smaller Z = closer / zoomed in) */
  var CAM_BASE_Z = isMobile ? 4.15 : 3.85;
  var CAM_BASE_Y = isMobile ? 0.28 : 0.35;
  var ZOOM_MIN = isMobile ? 2.35 : 1.95; /* max zoom in */
  var ZOOM_MAX = isMobile ? 5.6 : 5.9; /* max zoom out */

  var S = {
    activeSize: '6 KG',
    pendingSize: null,
    isTransitioning: false,
    ready: false,
    /* Shared 360° orbit — applies to whichever size is active (6 KG / 1.5 KG) */
    targetRotX: 0,
    targetRotY: 0,
    rotX: 0,
    rotY: 0,
    dragging: false,
    pinching: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    userHasDragged: false,
    autoSpin: true,
    /* Zoom (camera dolly) */
    camZ: CAM_BASE_Z,
    targetCamZ: CAM_BASE_Z,
    camY: CAM_BASE_Y,
    targetCamY: CAM_BASE_Y,
    /* Visibility */
    isVisible: true
  };

  var renderer, scene, camera;
  var models = { '6 KG': null, '1.5 KG': null };
  var loadState = { '6 KG': 'pending', '1.5 KG': 'pending' };
  var lights = {};
  var GROUND_Y = -1.15;
  var SIZE_KEYS = ['6 KG', '1.5 KG'];
  var activePointers = {};

  /* ---------- public API (shop UI can call this directly) ---------- */
  window.FloorXProduct3D = {
    setSize: function (size) {
      applySize(size, true);
    },
    getActiveSize: function () {
      return S.activeSize;
    },
    isReady: function () {
      return S.ready;
    }
  };

  function normalizeSize(raw) {
    if (raw == null || raw === '') return null;
    var t = String(raw).toLowerCase().replace(/,/g, '.').replace(/\s+/g, ' ').trim();

    /* Explicit canonical keys */
    if (t === '1.5 kg' || t === '1.5kg' || t === '15kg' || t === '1_5 kg') return '1.5 KG';
    if (t === '6 kg' || t === '6kg') return '6 KG';

    /* Prefer 1.5 over 6 (so "1.5" wins if both somehow present) */
    if (t.indexOf('1.5') !== -1 || t.indexOf('1_5') !== -1) return '1.5 KG';
    if (/\b1\s*[,.]?\s*5\s*k/.test(t)) return '1.5 KG';
    if (t.indexOf('small') !== -1 || t.indexOf('mini') !== -1) return '1.5 KG';

    if (t.indexOf('6') !== -1 || t.indexOf('large') !== -1 || t.indexOf('big') !== -1) {
      return '6 KG';
    }
    return null;
  }

  function init() {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance'
    });

    var w = Math.max(container.clientWidth, 1);
    var h = Math.max(container.clientHeight, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 0.75 : 2));
    renderer.setSize(w, h, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
    if (!isMobile) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(isMobile ? 34 : 32, w / h, 0.1, 100);
    camera.position.set(0, CAM_BASE_Y, CAM_BASE_Z);
    camera.lookAt(0, -0.15, 0);

    setupLights();
    setupFloor();

    window.addEventListener('resize', onWindowResize);
    setupOrbitControls();
    setupZoomButtons();

    window.addEventListener('floorx:size-change', function (e) {
      var d = e.detail || {};
      applySize(d.size || d.title || d.sizeKey, true);
    });

    if (isMobile) container.classList.add('is-mobile');
    container.setAttribute(
      'aria-label',
      '3D product — drag to rotate 360 degrees, pinch or use buttons to zoom'
    );
    container.setAttribute('role', 'img');

    var modelsLoaded = false;
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          S.isVisible = entry.isIntersecting;
          if (entry.isIntersecting && !modelsLoaded) {
            modelsLoaded = true;
            loadModels();
          }
        });
      }, { threshold: 0.01, rootMargin: '800px' });
      observer.observe(container);
    } else {
      loadModels();
    }

    requestAnimationFrame(animate);
  }

  function clampZoom(z) {
    return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
  }

  function setZoom(z, markUser) {
    S.targetCamZ = clampZoom(z);
    /* Slight lift when zoomed in so bottle stays framed */
    var t = (ZOOM_MAX - S.targetCamZ) / (ZOOM_MAX - ZOOM_MIN); /* 0 out → 1 in */
    S.targetCamY = CAM_BASE_Y + t * (isMobile ? 0.08 : 0.12);
    if (markUser) {
      S.autoSpin = false;
      S.userHasDragged = true;
    }
  }

  function zoomBy(delta) {
    setZoom(S.targetCamZ + delta, true);
  }

  function pointerCount() {
    var n = 0;
    for (var k in activePointers) {
      if (Object.prototype.hasOwnProperty.call(activePointers, k)) n++;
    }
    return n;
  }

  function pinchDistance() {
    var pts = [];
    for (var k in activePointers) {
      if (Object.prototype.hasOwnProperty.call(activePointers, k)) {
        pts.push(activePointers[k]);
      }
    }
    if (pts.length < 2) return 0;
    var dx = pts[0].x - pts[1].x;
    var dy = pts[0].y - pts[1].y;
    return Math.sqrt(dx * dx + dy * dy) || 1;
  }

  /**
   * Drag / touch orbit + zoom
   * - 1 finger / mouse drag: full 360° Y spin (both sizes)
   * - Pinch (2 fingers): zoom in/out
   * - Wheel: zoom (desktop)
   * - +/- buttons: zoom (mobile-friendly)
   */
  function setupOrbitControls() {
    var el = container;
    var pinchStartDist = 0;
    var pinchStartZoom = CAM_BASE_Z;

    el.style.touchAction = 'none';
    el.style.cursor = 'grab';
    el.setAttribute('tabindex', '0');
    if (canvas) {
      canvas.style.touchAction = 'none';
      canvas.style.cursor = 'grab';
    }

    function onPointerDown(e) {
      if (e.button != null && e.button !== 0) return;
      if (e.target && e.target.closest && e.target.closest('button, a, input, select, textarea')) {
        return;
      }

      activePointers[e.pointerId] = { x: e.clientX, y: e.clientY };

      if (pointerCount() >= 2) {
        /* Enter pinch zoom — stop single-finger drag */
        S.dragging = false;
        S.pinching = true;
        S.pointerId = null;
        pinchStartDist = pinchDistance();
        pinchStartZoom = S.targetCamZ;
        S.autoSpin = false;
        S.userHasDragged = true;
        container.classList.add('is-pinching');
        container.classList.remove('is-dragging');
        el.style.cursor = 'grab';
        if (canvas) canvas.style.cursor = 'grab';
      } else {
        S.dragging = true;
        S.pinching = false;
        S.pointerId = e.pointerId;
        S.lastX = e.clientX;
        S.lastY = e.clientY;
        S.autoSpin = false;
        S.userHasDragged = true;
        el.style.cursor = 'grabbing';
        if (canvas) canvas.style.cursor = 'grabbing';
        container.classList.add('is-dragging');
      }

      try {
        el.setPointerCapture(e.pointerId);
      } catch (_) {}
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!activePointers[e.pointerId] && !S.dragging) return;
      if (activePointers[e.pointerId]) {
        activePointers[e.pointerId].x = e.clientX;
        activePointers[e.pointerId].y = e.clientY;
      }

      if (S.pinching && pointerCount() >= 2) {
        var dist = pinchDistance();
        if (pinchStartDist > 0 && dist > 0) {
          /* Fingers apart → zoom in (smaller cam Z) */
          var scale = pinchStartDist / dist;
          setZoom(pinchStartZoom * scale, true);
        }
        e.preventDefault();
        return;
      }

      if (!S.dragging) return;
      if (S.pointerId != null && e.pointerId !== S.pointerId) return;

      var dx = e.clientX - S.lastX;
      var dy = e.clientY - S.lastY;
      S.lastX = e.clientX;
      S.lastY = e.clientY;

      var sensY = isMobile ? 0.012 : 0.0085;
      var sensX = isMobile ? 0.007 : 0.005;
      S.targetRotY += dx * sensY;
      S.targetRotX += dy * sensX;

      var maxPitch = Math.PI * 0.3;
      if (S.targetRotX > maxPitch) S.targetRotX = maxPitch;
      if (S.targetRotX < -maxPitch) S.targetRotX = -maxPitch;

      e.preventDefault();
    }

    function onPointerUp(e) {
      delete activePointers[e.pointerId];

      if (pointerCount() < 2) {
        S.pinching = false;
        container.classList.remove('is-pinching');
        pinchStartDist = 0;
      }

      if (S.pointerId != null && e.pointerId === S.pointerId) {
        S.dragging = false;
        S.pointerId = null;
        el.style.cursor = 'grab';
        if (canvas) canvas.style.cursor = 'grab';
        container.classList.remove('is-dragging');
      }

      /* If one finger remains after pinch, re-arm drag from that finger */
      if (pointerCount() === 1 && !S.pinching) {
        for (var id in activePointers) {
          if (!Object.prototype.hasOwnProperty.call(activePointers, id)) continue;
          S.dragging = true;
          S.pointerId = Number(id);
          S.lastX = activePointers[id].x;
          S.lastY = activePointers[id].y;
          container.classList.add('is-dragging');
          el.style.cursor = 'grabbing';
          if (canvas) canvas.style.cursor = 'grabbing';
          break;
        }
      }

      try {
        if (e.pointerId != null) el.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    el.addEventListener('pointerdown', onPointerDown, { passive: false });
    el.addEventListener('pointermove', onPointerMove, { passive: false });
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('lostpointercapture', function (e) {
      delete activePointers[e.pointerId];
    });

    /* Desktop scroll wheel zoom */
    el.addEventListener(
      'wheel',
      function (e) {
        e.preventDefault();
        var delta = e.deltaY;
        /* Normalize trackpad vs mouse wheel */
        if (e.deltaMode === 1) delta *= 16;
        if (e.deltaMode === 2) delta *= 40;
        zoomBy(delta * 0.0035);
      },
      { passive: false }
    );

    /* Keyboard: arrows rotate, +/− zoom */
    el.addEventListener('keydown', function (e) {
      var step = 0.18;
      var zoomStep = 0.28;
      if (e.key === 'ArrowLeft') {
        S.targetRotY -= step;
        S.autoSpin = false;
        S.userHasDragged = true;
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        S.targetRotY += step;
        S.autoSpin = false;
        S.userHasDragged = true;
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        S.targetRotX = Math.max(-Math.PI * 0.3, S.targetRotX - step * 0.6);
        S.autoSpin = false;
        S.userHasDragged = true;
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        S.targetRotX = Math.min(Math.PI * 0.3, S.targetRotX + step * 0.6);
        S.autoSpin = false;
        S.userHasDragged = true;
        e.preventDefault();
      } else if (e.key === '+' || e.key === '=' || e.key === 'Add') {
        zoomBy(-zoomStep);
        e.preventDefault();
      } else if (e.key === '-' || e.key === '_' || e.key === 'Subtract') {
        zoomBy(zoomStep);
        e.preventDefault();
      } else if (e.key === '0' || e.key === 'Home') {
        setZoom(CAM_BASE_Z, true);
        e.preventDefault();
      }
    });
  }

  function setupZoomButtons() {
    var wrap = container.querySelector('[data-fx-3d-zoom]');
    if (!wrap) return;
    var btnIn = wrap.querySelector('[data-fx-zoom="in"]');
    var btnOut = wrap.querySelector('[data-fx-zoom="out"]');
    var btnReset = wrap.querySelector('[data-fx-zoom="reset"]');

    function bind(btn, fn) {
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        fn();
      });
      /* Prevent orbit drag when pressing zoom controls */
      btn.addEventListener('pointerdown', function (e) {
        e.stopPropagation();
      });
    }

    bind(btnIn, function () {
      zoomBy(isMobile ? -0.38 : -0.32);
    });
    bind(btnOut, function () {
      zoomBy(isMobile ? 0.38 : 0.32);
    });
    bind(btnReset, function () {
      setZoom(CAM_BASE_Z, true);
      S.targetRotX = 0;
    });
  }

  function setupLights() {
    scene.add(new THREE.AmbientLight(0x8a9bb8, 0.4));
    scene.add(new THREE.HemisphereLight(0x4a6a9a, 0x050810, 0.3));

    lights.key = new THREE.DirectionalLight(0xd8e4f5, 0.9);
    lights.key.position.set(2, 4, 3);
    if (!isMobile) {
      lights.key.castShadow = true;
      lights.key.shadow.mapSize.set(1024, 1024);
      lights.key.shadow.bias = -0.001;
    }
    scene.add(lights.key);

    lights.fill = new THREE.PointLight(0x3d6db8, 0.4, 10);
    lights.fill.position.set(-2.5, 0.2, 2);
    scene.add(lights.fill);

    lights.rimA = new THREE.PointLight(0x7df9ff, 0.7, 10);
    lights.rimA.position.set(-1.2, 1, -1.8);
    if (!isMobile) scene.add(lights.rimA);

    lights.rimB = new THREE.PointLight(0x1e4a9a, 0.5, 10);
    lights.rimB.position.set(1.5, 0.3, -1.5);
    if (!isMobile) scene.add(lights.rimB);

    lights.top = new THREE.SpotLight(0xc8d8ec, 0.4, 10, Math.PI / 8, 0.6, 1);
    lights.top.position.set(0.3, 3.0, 1.0);
    lights.top.target.position.set(0, 0, 0);
    if (!isMobile) {
      scene.add(lights.top);
      scene.add(lights.top.target);
    }
  }

  function setupFloor() {
    var shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });
    var contactShadow = new THREE.Mesh(new THREE.CircleGeometry(0.85, 48), shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = GROUND_Y + 0.01;
    scene.add(contactShadow);

    var floor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        metalness: 0.15,
        roughness: 0.85,
        transparent: true,
        opacity: 0.35
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = GROUND_Y;
    floor.receiveShadow = true;
    scene.add(floor);
  }

  function attrUrl() {
    /* Read every known attribute spelling */
    return {
      six:
        container.getAttribute('data-glb-6kg') ||
        container.getAttribute('data-glb-6-kg') ||
        '',
      fifteen:
        container.getAttribute('data-glb-1-5kg') ||
        container.getAttribute('data-glb-1_5kg') ||
        container.getAttribute('data-glb-15kg') ||
        container.getAttribute('data-glb-1.5kg') ||
        ''
    };
  }

  function loadModels() {
    if (!THREE.GLTFLoader) {
      console.error('[FloorX 3D] GLTFLoader missing');
      hideLoader();
      return;
    }

    var urls = attrUrl();

    if (!urls.six && !urls.fifteen) {
      console.error('[FloorX 3D] No GLB URLs found on container');
      hideLoader();
      return;
    }

    /* Same URL for both = guaranteed identical look */
    if (urls.six && urls.fifteen && urls.six === urls.fifteen) {
      console.error(
        '[FloorX 3D] 6 KG and 1.5 KG point to the SAME file URL. 1.5 will look identical (just scaled).'
      );
    }

    var loader = new THREE.GLTFLoader();
    var pending = 0;

    function doneOne() {
      pending--;
      if (pending <= 0) onAllSettled();
    }

    function loadOne(url, sizeKey, scaleTarget) {
      if (!url) {
        loadState[sizeKey] = 'missing-url';
        console.warn('[FloorX 3D] No URL for', sizeKey);
        return;
      }
      pending++;
      loadState[sizeKey] = 'loading';
      loader.load(
        url,
        function (gltf) {
          try {
            processModel(gltf, sizeKey, scaleTarget, url);
            loadState[sizeKey] = 'ok';
          } catch (err) {
            console.error('[FloorX 3D] process failed', sizeKey, err);
            loadState[sizeKey] = 'error';
          }
          doneOne();
        },
        undefined,
        function (err) {
          console.error('[FloorX 3D] load failed', sizeKey, url, err);
          loadState[sizeKey] = 'error';
          doneOne();
        }
      );
    }

    /* Real-world mass ratio ~1.5/6 → linear ~0.63; keep 1.5 clearly smaller */
    loadOne(urls.six, '6 KG', isMobile ? 1.35 : 1.85);
    loadOne(urls.fifteen, '1.5 KG', isMobile ? 0.88 : 1.15);

    if (pending === 0) onAllSettled();
  }

  function processModel(gltf, sizeKey, scaleTarget, sourceUrl) {
    /* Always use a deep-cloned independent graph */
    var model = gltf.scene.clone(true);

    model.traverse(function (node) {
      if (!node.isMesh || !node.material) return;
      if (Array.isArray(node.material)) {
        node.material = node.material.map(function (m) {
          return m && m.clone ? m.clone() : m;
        });
      } else if (node.material.clone) {
        node.material = node.material.clone();
      }
    });

    /* Reset transforms before measuring */
    model.position.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    model.updateMatrixWorld(true);

    var bbox = new THREE.Box3().setFromObject(model);
    var bSize = bbox.getSize(new THREE.Vector3());
    var maxDim = Math.max(bSize.x, bSize.y, bSize.z) || 1;
    var scl = scaleTarget / maxDim;

    model.scale.setScalar(scl);
    model.updateMatrixWorld(true);

    bbox.setFromObject(model);
    var center = bbox.getCenter(new THREE.Vector3());
    model.position.x = -center.x;
    model.position.y = -center.y;
    model.position.z = -center.z;
    model.updateMatrixWorld(true);

    bbox.setFromObject(model);
    model.position.y += GROUND_Y - bbox.min.y;

    model.userData.baseScale = scl;
    model.userData.groundY = model.position.y;
    model.userData.sizeKey = sizeKey;
    model.userData.sourceUrl = sourceUrl;
    model.userData.geomMaxDim = maxDim;
    model.userData.geomSize = { x: bSize.x, y: bSize.y, z: bSize.z };

    model.traverse(function (node) {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
      var mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach(function (m) {
        if (!m) return;
        /* Keep opaque — visibility flag does the show/hide (no ghost materials) */
        m.transparent = false;
        m.opacity = 1;
        if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
          if (m.color && m.color.isColor) m.color.multiplyScalar(0.78);
          if (m.emissive && m.emissive.isColor) m.emissive.multiplyScalar(0.35);
          m.metalness = THREE.MathUtils.clamp((m.metalness || 0.12) * 0.7, 0.05, 0.22);
          m.roughness = THREE.MathUtils.clamp(Math.max(m.roughness || 0, 0.42) * 1.05, 0.38, 0.72);
          if (m.envMapIntensity != null) m.envMapIntensity = 0.45;
          m.needsUpdate = true;
        }
      });
    });

    model.visible = false;
    scene.add(model);
    models[sizeKey] = model;
  }

  function onAllSettled() {
    S.ready = true;
    hideLoader();

    /* Detect identical meshes (same native size) — the real root cause of "same bottle smaller" */
    var a = models['6 KG'];
    var b = models['1.5 KG'];
    if (a && b) {
      var da = a.userData.geomMaxDim;
      var db = b.userData.geomMaxDim;
      if (Math.abs(da - db) < 0.0001) {
        console.error(
          '[FloorX 3D] CRITICAL: 6 KG and 1.5 KG GLBs have IDENTICAL geometry dimensions (' +
            da.toFixed(4) +
            '). ' +
            'oil bottle / floorx-1-5kg is the same mesh as finalback — only textures/file size differ. ' +
            'Replace floorx-1-5kg.glb with a real 1.5 KG bottle model.'
        );
      }
      if (a.userData.sourceUrl && a.userData.sourceUrl === b.userData.sourceUrl) {
        console.error('[FloorX 3D] CRITICAL: both sizes loaded from the exact same URL');
      }
    }

    initHotspots();
    window.dispatchEvent(
      new CustomEvent('floorx:3d-ready', {
        detail: { has6: !!models['6 KG'], has15: !!models['1.5 KG'], loadState: loadState }
      })
    );

    var want = S.pendingSize || S.activeSize || '6 KG';
    S.pendingSize = null;
    showSizeHard(want);
  }

  function hideLoader() {
    var el = container.querySelector('.fx-product-3d__loader');
    if (el) el.classList.add('is-hidden');
  }

  /* Hard visibility swap — no opacity/GSAP required */
  function showSizeHard(sizeKey) {
    sizeKey = normalizeSize(sizeKey) || sizeKey;
    if (SIZE_KEYS.indexOf(sizeKey) === -1) return;

    for (var i = 0; i < SIZE_KEYS.length; i++) {
      var key = SIZE_KEYS[i];
      var m = models[key];
      if (!m) continue;
      var on = key === sizeKey;
      m.visible = on;
      /* Keep orbit angle when switching 6 KG ↔ 1.5 KG */
      m.rotation.x = S.rotX;
      m.rotation.y = S.rotY;
      if (on) {
        m.scale.setScalar(m.userData.baseScale);
        if (m.userData.groundY != null) m.position.y = m.userData.groundY;
      }
    }

    S.activeSize = sizeKey;
    S.isTransitioning = false;
    container.setAttribute('data-active-size', sizeKey);
    var badge = container.querySelector('[data-fx-3d-badge]');
    if (badge) badge.textContent = sizeKey;
  }

  function applySize(raw, animate) {
    var newSize = normalizeSize(raw);
    if (!newSize) {
      console.warn('[FloorX 3D] Could not parse size from', raw);
      return;
    }

    if (!S.ready) {
      S.pendingSize = newSize;
      return;
    }

    if (newSize === S.activeSize) return;

    if (!models[newSize]) {
      console.warn('[FloorX 3D] No model loaded for', newSize, loadState);
      return;
    }

    /* Prefer instant hard swap — reliable. Optional short scale pop if gsap exists. */
    if (animate && typeof gsap !== 'undefined' && models[S.activeSize]) {
      softSwap(S.activeSize, newSize);
    } else {
      showSizeHard(newSize);
    }
  }

  function softSwap(fromKey, toKey) {
    var curr = models[fromKey];
    var next = models[toKey];
    if (!curr || !next) {
      showSizeHard(toKey);
      return;
    }

    S.isTransitioning = true;
    S.activeSize = toKey;
    container.setAttribute('data-active-size', toKey);

    var hotspots = container.querySelectorAll('.fx-hotspot');
    hotspots.forEach(function (h) {
      h.classList.remove('is-visible');
    });

    var tl = gsap.timeline({
      onComplete: function () {
        showSizeHard(toKey);
        hotspots.forEach(function (h) {
          h.classList.add('is-visible');
        });
      }
    });

    tl.to(
      curr.scale,
      {
        x: curr.userData.baseScale * 0.92,
        y: curr.userData.baseScale * 0.92,
        z: curr.userData.baseScale * 0.92,
        duration: 0.12,
        ease: 'power2.in'
      },
      0
    );

    tl.call(function () {
      curr.visible = false;
      next.visible = true;
      next.position.y = next.userData.groundY != null ? next.userData.groundY : next.position.y;
      next.scale.setScalar(next.userData.baseScale * 0.92);
    });

    tl.to(next.scale, {
      x: next.userData.baseScale,
      y: next.userData.baseScale,
      z: next.userData.baseScale,
      duration: 0.28,
      ease: 'power2.out'
    });

    if (lights.rimA) {
      tl.to(lights.rimA, { intensity: 1.15, duration: 0.12 }, 0);
      tl.to(lights.rimA, { intensity: 0.7, duration: 0.25 }, '>');
    }
  }

  function onWindowResize() {
    var w = Math.max(container.clientWidth, 1);
    var h = Math.max(container.clientHeight, 1);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function initHotspots() {
    var wrapper = container.querySelector('.fx-product-3d__hotspots');
    if (!wrapper) return;
    var spotsData = [
      { id: 'cap', title: 'Child-safe cap', posY: 0.45 },
      { id: 'handle', title: 'Easy grip', posX: -0.15, posY: 0.1 },
      { id: 'label', title: 'Professional formula', posY: -0.1, posZ: 0.2 }
    ];
    spotsData.forEach(function (s) {
      var el = document.createElement('div');
      el.className = 'fx-hotspot is-visible';
      el.id = 'fx-hs-' + s.id;
      var tt = document.createElement('div');
      tt.className = 'fx-hotspot-tooltip';
      tt.textContent = s.title;
      el.appendChild(tt);
      wrapper.appendChild(el);
      s.element = el;
    });
    S.hotspots = spotsData;
  }

  function updateHotspots() {
    if (!S.hotspots || !models[S.activeSize]) return;
    var model = models[S.activeSize];
    var scale = model.userData.baseScale || 1;
    S.hotspots.forEach(function (s) {
      if (!s.element) return;
      var pos3D = new THREE.Vector3((s.posX || 0) * scale, (s.posY || 0) * scale, (s.posZ || 0) * scale);
      pos3D.applyMatrix4(model.matrixWorld);
      pos3D.project(camera);
      s.element.style.left = (pos3D.x * 0.5 + 0.5) * container.clientWidth + 'px';
      s.element.style.top = (-(pos3D.y * 0.5) + 0.5) * container.clientHeight + 'px';
      s.element.style.opacity = pos3D.z > 1 || S.isTransitioning ? '0' : '1';
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!S.isVisible) return; // Pause GPU work when offscreen
    
    var model = models[S.activeSize];

    /* Slow idle spin until the shopper starts dragging / zooming */
    if (S.autoSpin && !S.dragging && !S.pinching && !S.userHasDragged && !S.isTransitioning) {
      S.targetRotY += isMobile ? 0.001 : 0.004;
    }

    /* Smooth damp toward targets (shared for 6 KG + 1.5 KG) */
    var damp = S.dragging || S.pinching ? 0.45 : 0.12;
    S.rotX += (S.targetRotX - S.rotX) * damp;
    S.rotY += (S.targetRotY - S.rotY) * damp;

    /* Smooth camera zoom */
    var zDamp = S.pinching ? 0.35 : 0.14;
    S.camZ += (S.targetCamZ - S.camZ) * zDamp;
    S.camY += (S.targetCamY - S.camY) * zDamp;
    if (camera) {
      camera.position.z = S.camZ;
      camera.position.y = S.camY;
      camera.lookAt(0, -0.15, 0);
    }

    if (model && !S.isTransitioning) {
      if (model.userData.groundY != null) model.position.y = model.userData.groundY;
      model.rotation.x = S.rotX;
      model.rotation.y = S.rotY;
    }

    /* Keep the inactive size in sync so switching sizes keeps the same angle */
    SIZE_KEYS.forEach(function (key) {
      var m = models[key];
      if (!m || key === S.activeSize) return;
      m.rotation.x = S.rotX;
      m.rotation.y = S.rotY;
    });

    updateHotspots();
    renderer.render(scene, camera);
  }

  function tryInit() {
    if (typeof THREE !== 'undefined' && typeof THREE.GLTFLoader !== 'undefined') {
      init();
      return true;
    }
    return false;
  }

  if (!tryInit()) {
    var checkTimer = setInterval(function () {
      if (tryInit()) clearInterval(checkTimer);
    }, 80);
    setTimeout(function () {
      clearInterval(checkTimer);
    }, 20000);
  }
})();
