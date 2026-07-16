/*
 * FloorX About Us — dual 3D bottles (6 KG + 1.5 KG)
 * Same GLBs as shop / FAQ:
 *   6 KG  → finalback.glb
 *   1.5 KG → floorx-1-5kg.glb
 * Layout matches design: large 6kg left-center, 1.5kg mini on the right.
 */
(function FXAbout3D() {
  'use strict';

  function bootAll() {
    var roots = document.querySelectorAll('[data-fx-about]');
    if (!roots.length) return;
    roots.forEach(bootOne);
  }

  function bootOne(root) {
    if (root.__fxAboutReady) return;
    root.__fxAboutReady = true;

    var stage = root.querySelector('[data-fx-about-stage]');
    var canvas = root.querySelector('[data-fx-about-canvas]');
    var loader = root.querySelector('[data-fx-about-loader]');
    if (!stage || !canvas) {
      if (loader) loader.classList.add('is-hidden');
      return;
    }

    function waitForThree(attempt) {
      attempt = attempt || 0;
      if (typeof THREE !== 'undefined' && THREE.GLTFLoader) {
        setupObserver();
        return;
      }
      if (attempt > 80) {
        if (loader) loader.classList.add('is-hidden');
        return;
      }
      setTimeout(function () {
        waitForThree(attempt + 1);
      }, 50);
    }

    var isVisible = false;
    function setupObserver() {
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (en) {
              isVisible = en.isIntersecting;
              if (en.isIntersecting && !started) {
                init3d();
              }
            });
          },
          { rootMargin: '160px' }
        );
        io.observe(root);
      } else {
        isVisible = true;
        init3d();
      }
    }

    var isMobile = window.innerWidth < 768;
    var renderer, scene, camera, disc;
    var group = null;
    var idleT = 0;
    var targetRotY = 0.06;
    var targetRotX = 0;
    var curRotY = 0.06;
    var curRotX = 0;
    var loaded = 0;
    var need = 0;
    var groupBaseY = 0;
    var started = false;

    function frameBottles() {
      if (!group || !camera) return;

      group.position.set(0, 0, 0);
      group.updateMatrixWorld(true);

      var box = new THREE.Box3().setFromObject(group);
      if (box.isEmpty()) return;

      var size = box.getSize(new THREE.Vector3());
      var center = box.getCenter(new THREE.Vector3());

      group.position.x = -center.x;
      group.position.y = -center.y;
      group.position.z = -center.z;
      groupBaseY = group.position.y;

      group.updateMatrixWorld(true);
      box.setFromObject(group);
      size = box.getSize(new THREE.Vector3());

      var fitH = size.y * 1.22;
      var fitW = size.x * 1.28;
      var aspect = Math.max(0.45, camera.aspect || 1);
      var vFov = (camera.fov * Math.PI) / 180;
      var distH = (fitH * 0.5) / Math.tan(vFov * 0.5);
      var distW = (fitW * 0.5) / (Math.tan(vFov * 0.5) * aspect);
      var dist = Math.max(distH, distW, 2.8);

      camera.position.set(0, size.y * 0.02, dist);
      camera.near = 0.05;
      camera.far = dist + 40;
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      if (disc) {
        disc.position.y = box.min.y - 0.012;
        var s = Math.max(size.x * 0.62, 0.9);
        disc.scale.set(s, s, s);
      }
    }

    function onModelReady() {
      loaded += 1;
      if (loaded >= need) {
        frameBottles();
        if (loader) loader.classList.add('is-hidden');
      }
    }

    function placeBottle(gltf, x, scaleTarget, yaw) {
      var model = gltf.scene;
      var bbox = new THREE.Box3().setFromObject(model);
      var size = bbox.getSize(new THREE.Vector3());
      var maxDim = Math.max(size.x, size.y, size.z) || 1;
      var scl = scaleTarget / maxDim;
      model.scale.setScalar(scl);

      var center = bbox.getCenter(new THREE.Vector3());
      model.position.sub(center.multiplyScalar(scl));

      bbox.setFromObject(model);
      model.position.y -= bbox.min.y;
      model.position.x = x;
      model.rotation.y = yaw;

      model.traverse(function (node) {
        if (!node.isMesh) return;
        var mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.forEach(function (m) {
          if (!m) return;
          if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
            if (m.color && m.color.isColor) m.color.multiplyScalar(0.84);
            m.metalness = THREE.MathUtils.clamp(
              (m.metalness != null ? m.metalness : 0.15) * 0.72,
              0.05,
              0.24
            );
            m.roughness = THREE.MathUtils.clamp(
              Math.max(m.roughness != null ? m.roughness : 0.4, 0.4) * 1.04,
              0.36,
              0.74
            );
            if (m.envMapIntensity != null) m.envMapIntensity = 0.48;
            m.needsUpdate = true;
          }
        });
      });

      group.add(model);
      onModelReady();
    }

    function init3d() {
      if (started) return;
      started = true;

      var w = Math.max(stage.clientWidth, 2);
      var h = Math.max(stage.clientHeight, 2);

      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: !isMobile,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
      renderer.setSize(w, h, false);
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.14;
      if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(34, w / h, 0.05, 60);
      camera.position.set(0, 0.2, 4.6);
      camera.lookAt(0, 0, 0);

      /* Brand lights — Electric Blue #00AAFF + Cyan #00CFFF */
      scene.add(new THREE.AmbientLight(0xb0c4d8, 0.42));
      scene.add(new THREE.HemisphereLight(0x00aaff, 0x0a0a0a, 0.38));

      var key = new THREE.DirectionalLight(0xe8f4ff, 1.05);
      key.position.set(2.0, 3.6, 2.6);
      scene.add(key);

      var fill = new THREE.PointLight(0x00aaff, 0.55, 14);
      fill.position.set(-2.2, 0.5, 2.0);
      scene.add(fill);

      var rim = new THREE.PointLight(0x00cfff, 1.25, 16);
      rim.position.set(-1.2, 1.3, -2.0);
      scene.add(rim);

      var rimB = new THREE.PointLight(0x00aaff, 0.75, 14);
      rimB.position.set(1.6, 0.6, -1.5);
      scene.add(rimB);

      disc = new THREE.Mesh(
        new THREE.CircleGeometry(1, 48),
        new THREE.MeshBasicMaterial({
          color: 0x00cfff,
          transparent: true,
          opacity: 0.14,
          depthWrite: false
        })
      );
      disc.rotation.x = -Math.PI / 2;
      disc.position.y = -1.15;
      scene.add(disc);

      group = new THREE.Group();
      scene.add(group);

      var url6 = root.getAttribute('data-glb-6kg');
      var url15 =
        root.getAttribute('data-glb-1_5kg') ||
        root.getAttribute('data-glb-1-5kg') ||
        root.getAttribute('data-glb-15kg');
      var loader3d = new THREE.GLTFLoader();

      /*
       * Design pair: large 6 KG left-center, 1.5 KG mini on the right
       * (matches About mockup product presentation)
       */
      if (url6) {
        need += 1;
        loader3d.load(
          url6,
          function (gltf) {
            placeBottle(gltf, isMobile ? -0.28 : -0.32, isMobile ? 1.32 : 1.58, -0.1);
          },
          undefined,
          onModelReady
        );
      }
      if (url15) {
        need += 1;
        loader3d.load(
          url15,
          function (gltf) {
            placeBottle(gltf, isMobile ? 0.34 : 0.4, isMobile ? 0.92 : 1.12, 0.18);
          },
          undefined,
          onModelReady
        );
      }
      if (!need && loader) loader.classList.add('is-hidden');

      if (!isMobile) {
        stage.addEventListener('mousemove', function (e) {
          var r = stage.getBoundingClientRect();
          var nx = ((e.clientX - r.left) / r.width) * 2 - 1;
          var ny = ((e.clientY - r.top) / r.height) * 2 - 1;
          targetRotY = 0.06 + nx * 0.16;
          targetRotX = ny * 0.05;
        });
        stage.addEventListener('mouseleave', function () {
          targetRotY = 0.06;
          targetRotX = 0;
        });
      }

      window.addEventListener('resize', onResize, { passive: true });
      requestAnimationFrame(frame);
    }

    function onResize() {
      if (!renderer || !camera || !stage) return;
      var w = stage.clientWidth;
      var h = stage.clientHeight;
      if (w < 2 || h < 2) return;
      isMobile = window.innerWidth < 768;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      if (loaded >= need && need > 0) frameBottles();
    }

    function frame(t) {
      requestAnimationFrame(frame);
      if (!isVisible) return;
      idleT = t * 0.001;
      curRotY += (targetRotY - curRotY) * 0.055;
      curRotX += (targetRotX - curRotX) * 0.055;
      if (group) {
        group.rotation.y = curRotY + Math.sin(idleT * 0.4) * 0.03;
        group.rotation.x = curRotX;
        group.position.y = groupBaseY + Math.sin(idleT * 0.65) * 0.015;
      }
      if (renderer && scene && camera) renderer.render(scene, camera);
    }

    waitForThree();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAll);
  } else {
    bootAll();
  }
})();
