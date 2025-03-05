import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { log } from 'three/tsl';

// Создаем контейнер для рендерера
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.querySelector('.modal');
    const closeModal = modal.querySelector('.feather-x')
    const container = document.createElement('div');
    const mainContainer = document.querySelector('main');

    const coordX = document.getElementById('coord-x');
    const coordY = document.getElementById('coord-y');
    const coordZ = document.getElementById('coord-z');

    container.className = 'container-render';
    mainContainer.appendChild(container);

    // Инициализация сцены
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight, // Используем размеры контейнера
        0.1,
        1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight); 
    renderer.setClearColor('rgb(35, 35, 35)', 1);
    container.appendChild(renderer.domElement);

    // Настройка OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 1.0;
    controls.panSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.minDistance = 2;
    controls.maxDistance = 50;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.maxPolarAngle = Math.PI / 2;

    // Настройка камеры
    camera.position.set(5, 2, 1);
    controls.update();

    // Освещение
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Загрузка модели
    let model;
    new GLTFLoader().load(
        '../models/armatura1_LOD0.glb',
        (gltf) => {
            model = gltf.scene;

            // Центрирование модели
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            scene.add(model);
            model.scale.set(2.5, 2.5, 2.5);
            model.rotation.y = 1
            controls.target.copy(center);
            controls.update();
        },
        undefined,
        (error) => {
            console.error('Ошибка загрузки модели:', error);
        }
    );

    // Обработка изменения размера окна
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    let isChangeColor = false; 
    window.changeColor = function () {
        if (!model) return;
        if(!isChangeColor){
            model.traverse((child) => {
                if (child.isMesh && child.name === 'Circle003') {
                    const newMaterial = child.material.clone();
                    newMaterial.color.set('blue');
                    child.material = newMaterial;
                }
            });
        }else{
            model.traverse((child) => {
                if (child.isMesh && child.name === 'Circle003') {
                    const newMaterial = child.material.clone();
                    newMaterial.color.set('#567ca2');
                    child.material = newMaterial;
                }
            });
        }
        isChangeColor =!isChangeColor; 
    };

    // Цикл Анимации
    function animate() {
        requestAnimationFrame(animate);

        // Динамическое изменение координат на сайте
        if (model) {
            const worldPosition = new THREE.Vector3();
            model.getWorldPosition(worldPosition);
            coordX.textContent = worldPosition.x.toFixed(2);
            coordY.textContent = worldPosition.y.toFixed(2);
            coordZ.textContent = worldPosition.z.toFixed(2);
        }
    
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    let isOpenModal = false; 

    // обработка открытия и заркрытия модального окна
    function handleModal() {
        if (!isOpenModal) {
            modal.classList.add('move-modal');
            container.classList.add('move-render-container');
        } else {
            modal.classList.remove('move-modal');
            container.classList.remove('move-render-container');
        }
        isOpenModal = !isOpenModal;
    }

    container.addEventListener('click', () => {
        if(!isOpenModal){
            handleModal();
        }
    })
    closeModal.addEventListener('click', () => {
        handleModal();
    });
    
    // Обработка клика по выпадающим спискам
    function toggleProperties(type) {
        const propertyDiv = document.querySelector(`.property.${type}`);
        propertyDiv.classList.toggle('active'); // Переключаем класс active для отображения/скрытия
    }

    document.getElementById('toggle-properties').addEventListener('click', function() {
        toggleProperties('properties');
    });
    
    document.getElementById('toggle-coordinates').addEventListener('click', function() {
        toggleProperties('coordinates');
    });
    
});
