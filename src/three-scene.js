import * as THREE from 'three';

export function initThreeScene() {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  const scene = new THREE.Scene();
  // Very light fog to blend with the background
  scene.fog = new THREE.FogExp2(0xfafafa, 0.05);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0x3b82f6, 1, 20); // subtle blue light
  pointLight.position.set(-5, 5, 5);
  scene.add(pointLight);

  // Group for all floating objects
  const objectsGroup = new THREE.Group();
  scene.add(objectsGroup);

  // Material: Clean, corporate, glass-like
  const materialParams = {
    color: 0x171717,
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: 0.8,
  };
  const darkMaterial = new THREE.MeshStandardMaterial(materialParams);
  
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.9, // glass effect
    ior: 1.5,
    thickness: 0.5,
  });

  // Create abstract geometries (Data blocks, connecting nodes)
  const geometries = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.BoxGeometry(1.5, 1.5, 1.5),
    new THREE.OctahedronGeometry(1.2, 0),
    new THREE.TorusGeometry(0.8, 0.2, 16, 100),
    new THREE.CylinderGeometry(0.5, 0.5, 2, 32)
  ];

  const objects = [];

  for (let i = 0; i < 20; i++) {
    const geo = geometries[Math.floor(Math.random() * geometries.length)];
    const mat = Math.random() > 0.5 ? darkMaterial : glassMaterial;
    const mesh = new THREE.Mesh(geo, mat);

    // Random positioning
    mesh.position.x = (Math.random() - 0.5) * 30;
    mesh.position.y = (Math.random() - 0.5) * 30;
    mesh.position.z = (Math.random() - 0.5) * 15 - 5; // pushed slightly back

    // Random rotation
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;

    // Random scale
    const scale = Math.random() * 0.8 + 0.4;
    mesh.scale.set(scale, scale, scale);

    objectsGroup.add(mesh);
    objects.push({
      mesh: mesh,
      rotationSpeedX: (Math.random() - 0.5) * 0.01,
      rotationSpeedY: (Math.random() - 0.5) * 0.01,
      floatSpeed: Math.random() * 0.005 + 0.002,
      initialY: mesh.position.y,
    });
  }

  // Mouse Interaction Variables
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
  });

  // Scroll Interaction
  let scrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Rotate and float objects
    objects.forEach((obj, idx) => {
      obj.mesh.rotation.x += obj.rotationSpeedX;
      obj.mesh.rotation.y += obj.rotationSpeedY;
      // Floating effect
      obj.mesh.position.y = obj.initialY + Math.sin(time * 0.5 + idx) * 1.5;
    });

    // Ease camera target towards mouse
    targetX = mouseX * 2;
    targetY = mouseY * 2;
    
    // Subtle parallax based on scroll
    const scrollOffset = scrollY * 0.005;

    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (-targetY - camera.position.y - scrollOffset) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
