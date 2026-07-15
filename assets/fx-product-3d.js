/*
 * FX Product 3D Viewer Engine
 * ES5 compatible Three.js integration for FloorX interactive product page
 */

(function FXProduct3D() {
  'use strict';

  var container = document.getElementById('fx-product-3d-container');
  var canvas = document.getElementById('fx-product-3d-canvas');
  if (!container || !canvas) return;

  var S = {
    activeSize: '6 KG',
    isTransitioning: false,
    modelsLoaded: 0,
    mouseX: 0,
    mouseY: 0,
    targetRotX: 0,
    targetRotY: 0,
    pulseInt: 0.7,
    glowRadius: 1
  };

  var renderer, scene, camera;
  var models = { '6 KG': null, '1.5 KG': null };
  var lights = {};
  var contactShadow, floorGlow;
  var isMobile = window.innerWidth < 768;

  function init() {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance'
    });

    var w = container.clientWidth;
    var h = container.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    if (!isMobile) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    camera.position.set(0, 0.1, 3.5);

    setupLights();
    setupFloor();
    loadModels();

    window.addEventListener('resize', onWindowResize);
    container.addEventListener('mousemove', onMouseMove);
    
    // Custom events from variant selector
    window.addEventListener('floorx:size-change', onSizeChange);
    window.addEventListener('floorx:size-hover', onSizeHover);
    container.addEventListener('mouseleave', function() {
      S.targetRotX = 0;
      S.targetRotY = 0;
    });

    requestAnimationFrame(animate);
  }

  function setupLights() {
    lights.ambient = new THREE.AmbientLight(0x8a9bb8, 0.4);
    scene.add(lights.ambient);

    lights.hemi = new THREE.HemisphereLight(0x4a6a9a, 0x050810, 0.3);
    scene.add(lights.hemi);

    lights.key = new THREE.DirectionalLight(0xd8e4f5, 0.9);
    lights.key.position.set(2, 4, 3);
    if (!isMobile) {
      lights.key.castShadow = true;
      lights.key.shadow.mapSize.width = 1024;
      lights.key.shadow.mapSize.height = 1024;
      lights.key.shadow.bias = -0.001;
    }
    scene.add(lights.key);

    lights.fill = new THREE.PointLight(0x3d6db8, 0.4, 10);
    lights.fill.position.set(-2.5, 0.2, 2);
    scene.add(lights.fill);

    lights.rimA = new THREE.PointLight(0x7DF9FF, 0.7, 10);
    lights.rimA.position.set(-1.2, 1, -1.8);
    scene.add(lights.rimA);

    lights.rimB = new THREE.PointLight(0x1e4a9a, 0.5, 10);
    lights.rimB.position.set(1.5, 0.3, -1.5);
    scene.add(lights.rimB);

    lights.top = new THREE.SpotLight(0xc8d8ec, 0.4, 10, Math.PI/8, 0.6, 1);
    lights.top.position.set(0.3, 3.0, 1.0);
    lights.top.target.position.set(0, 0, 0);
    scene.add(lights.top);
    scene.add(lights.top.target);
  }

  function setupFloor() {
    var shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    });
    contactShadow = new THREE.Mesh(new THREE.CircleGeometry(0.6, 32), shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -1.2;
    scene.add(contactShadow);

    var floorMat = new THREE.MeshStandardMaterial({
      color: 0x040810,
      metalness: 0.1,
      roughness: 0.9,
      transparent: true,
      opacity: 0.2
    });
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.21;
    floor.receiveShadow = true;
    scene.add(floor);
  }

  function loadModels() {
    var loader = new THREE.GLTFLoader();
    var url6kg = container.getAttribute('data-glb-6kg');
    var url15kg = container.getAttribute('data-glb-1_5kg');

    function processModel(gltf, sizeKey, scaleTarget) {
      var model = gltf.scene;
      var bbox = new THREE.Box3().setFromObject(model);
      var bSize = bbox.getSize(new THREE.Vector3());
      var maxDim = Math.max(bSize.x, bSize.y, bSize.z);
      var scl = scaleTarget / maxDim;
      
      model.scale.setScalar(scl);
      model.userData.baseScale = scl;

      var bCentre = bbox.getCenter(new THREE.Vector3());
      model.position.sub(bCentre.multiplyScalar(scl));
      
      model.traverse(function(node) {
        if (!node.isMesh) return;
        node.castShadow = true;
        node.receiveShadow = true;
        var mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.forEach(function(m) {
          m.transparent = true;
          if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
            if (m.color && m.color.isColor) m.color.multiplyScalar(0.78);
            if (m.emissive && m.emissive.isColor) m.emissive.multiplyScalar(0.35);
            m.metalness = THREE.MathUtils.clamp((m.metalness || 0.12) * 0.7, 0.05, 0.22);
            m.roughness = THREE.MathUtils.clamp(Math.max(m.roughness || 0, 0.42) * 1.05, 0.38, 0.72);
            m.envMapIntensity = 0.45;
            m.needsUpdate = true;
          }
        });
      });

      model.position.y = 0;
      if (sizeKey !== S.activeSize) {
        model.visible = false;
        model.traverse(function(child) {
          if (child.isMesh) child.material.opacity = 0;
        });
      }

      scene.add(model);
      models[sizeKey] = model;
      S.modelsLoaded++;

      if (S.modelsLoaded === 2) {
        onAllLoaded();
      }
    }

    if (url6kg) {
      loader.load(url6kg, function(gltf) {
        processModel(gltf, '6 KG', isMobile ? 1.4 : 2.0);
      });
    }
    if (url15kg) {
      loader.load(url15kg, function(gltf) {
        processModel(gltf, '1.5 KG', isMobile ? 1.1 : 1.5);
      });
    }
  }

  function onAllLoaded() {
    var loaderEl = container.querySelector('.fx-product-3d__loader');
    if (loaderEl) loaderEl.classList.add('is-hidden');
    window.dispatchEvent(new CustomEvent('floorx:3d-ready'));
    initHotspots();
  }

  function onWindowResize() {
    var w = container.clientWidth;
    var h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function onMouseMove(e) {
    if (isMobile) return;
    var rect = container.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    
    // Normalize -1 to 1
    var nx = (x / rect.width) * 2 - 1;
    var ny = -(y / rect.height) * 2 + 1;
    
    // Target rotation (±5 deg yaw, ±3.5 deg pitch)
    S.targetRotY = nx * (Math.PI / 36); 
    S.targetRotX = -ny * (Math.PI / 50);
  }

  function onSizeHover(e) {
    var size = e.detail && e.detail.size;
    if (size && size !== S.activeSize && !S.isTransitioning) {
      S.targetRotY = (size === '6 KG') ? -0.05 : 0.05;
    }
  }

  function onSizeChange(e) {
    var newSize = e.detail && e.detail.size;
    if (!newSize || newSize === S.activeSize || S.isTransitioning || S.modelsLoaded < 2) return;
    
    var currModel = models[S.activeSize];
    var newModel = models[newSize];
    if (!currModel || !newModel) return;

    S.isTransitioning = true;
    S.activeSize = newSize;

    // Hide hotspots during transition
    var hotspots = container.querySelectorAll('.fx-hotspot');
    hotspots.forEach(function(h) { h.classList.remove('is-visible'); });

    var tl = gsap.timeline({
      onComplete: function() {
        S.isTransitioning = false;
        hotspots.forEach(function(h) { h.classList.add('is-visible'); });
      }
    });

    // 1. Current bottle out
    tl.to(currModel.scale, {
      x: currModel.userData.baseScale * 0.95,
      y: currModel.userData.baseScale * 0.95,
      z: currModel.userData.baseScale * 0.95,
      duration: 0.15,
      ease: 'power2.in'
    }, 0);
    
    var currMats = [];
    currModel.traverse(function(c) { if (c.isMesh) currMats.push(c.material); });
    tl.to(currMats, { opacity: 0, duration: 0.15 }, 0);

    // 2. Swap visibility
    tl.call(function() {
      currModel.visible = false;
      newModel.visible = true;
      // Reset new model start state
      newModel.position.y = -0.1;
      newModel.rotation.y = S.targetRotY - 0.1;
      var ns = newModel.userData.baseScale * 0.92;
      newModel.scale.set(ns, ns, ns);
    }, null, "+=0.01");

    // 3. New bottle in
    var newMats = [];
    newModel.traverse(function(c) { if (c.isMesh) newMats.push(c.material); });
    tl.to(newMats, { opacity: 1, duration: 0.2 }, "+=0");

    tl.to(newModel.position, {
      y: 0,
      duration: 0.4,
      ease: 'back.out(1.5)'
    }, "-=0.2");

    tl.to(newModel.scale, {
      x: newModel.userData.baseScale,
      y: newModel.userData.baseScale,
      z: newModel.userData.baseScale,
      duration: 0.4,
      ease: 'back.out(1.5)'
    }, "-=0.4");

    // Camera push in/out
    tl.to(camera.position, {
      z: 3.35,
      duration: 0.2,
      ease: 'power2.out'
    }, 0);
    tl.to(camera.position, {
      z: 3.5,
      duration: 0.3,
      ease: 'power2.inOut'
    }, "+=0");

    // Lights pulse
    tl.to(lights.rimA, { intensity: 1.1, duration: 0.2 }, 0);
    tl.to(lights.rimA, { intensity: 0.7, duration: 0.3 }, "+=0");

    // CSS Glow pulse
    var glow = container.querySelector('.fx-product-3d__glow');
    if (glow) {
      tl.call(function() { glow.classList.add('is-active'); }, null, 0);
      tl.call(function() { glow.classList.remove('is-active'); }, null, 0.3);
    }
  }

  function initHotspots() {
    var wrapper = container.querySelector('.fx-product-3d__hotspots');
    if (!wrapper) return;

    var spotsData = [
      { id: 'cap', title: 'Child-safe cap', posY: 0.45 },
      { id: 'handle', title: 'Easy grip', posX: -0.15, posY: 0.1 },
      { id: 'label', title: 'Professional formula', posY: -0.1, posZ: 0.2 }
    ];

    spotsData.forEach(function(s) {
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
    var scale = model.userData.baseScale;
    
    S.hotspots.forEach(function(s) {
      if (!s.element) return;
      
      var pos3D = new THREE.Vector3(
        (s.posX || 0) * scale,
        (s.posY || 0) * scale,
        (s.posZ || 0) * scale
      );
      
      // Apply model transform
      pos3D.applyMatrix4(model.matrixWorld);
      
      // Project to 2D
      pos3D.project(camera);
      
      var x = (pos3D.x * 0.5 + 0.5) * container.clientWidth;
      var y = (-(pos3D.y * 0.5) + 0.5) * container.clientHeight;
      
      s.element.style.left = x + 'px';
      s.element.style.top = y + 'px';
      
      // Hide if behind object
      if (pos3D.z > 1) {
        s.element.style.opacity = '0';
      } else if (!S.isTransitioning) {
        s.element.style.opacity = '1';
      }
    });
  }

  function animate() {
    requestAnimationFrame(animate);

    var t = performance.now() * 0.001;

    if (models[S.activeSize] && !S.isTransitioning) {
      var model = models[S.activeSize];
      
      // Idle float
      model.position.y = Math.sin(t * 0.8) * 0.006;
      
      // Mouse/Hover lerp
      model.rotation.x += (S.targetRotX - model.rotation.x) * 0.05;
      model.rotation.y += (S.targetRotY + t * 0.05 - model.rotation.y) * 0.05; // Base rotation + target
    }

    updateHotspots();

    renderer.render(scene, camera);
  }

  // Load dependency checks
  if (typeof THREE !== 'undefined' && typeof THREE.GLTFLoader !== 'undefined' && typeof gsap !== 'undefined') {
    init();
  } else {
    var checkTimer = setInterval(function() {
      if (typeof THREE !== 'undefined' && typeof THREE.GLTFLoader !== 'undefined' && typeof gsap !== 'undefined') {
        clearInterval(checkTimer);
        init();
      }
    }, 100);
  }

})();
