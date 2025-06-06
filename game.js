import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createChickenModel } from './chickenModel.js';
import { createEggTemplate } from './eggModel.js';
// 引入物理引擎 (示例使用 Cannon.js, 你也可以选择其他的或手动模拟)
// import * as CANNON from 'cannon-es'; // 如果使用 Cannon.js

// --- 基本设置 ---
let scene, camera, renderer, controls;
let clock = new THREE.Clock();
let chickenModel, eggTemplateMesh; // 小鸡模型引用和鸡蛋模板
const loadedModels = {}; // 存储加载的模型
const activeEggs = []; // 存储场景中的活动鸡蛋及其物理体
let isFlapping = false;
let flappingStartTime = 0;
const flappingDuration = 3; // 挥动翅膀持续时间 (秒)
const flappingSpeed = 10; // 挥动速度
const flappingAngle = Math.PI / 4; // 挥动最大角度

// --- 物理世界 (如果使用物理引擎) ---
// let world;
// const timeStep = 1 / 60; // 物理模拟步长
// let groundPhysMaterial, eggPhysMaterial, chickenPhysMaterial;
// let groundBody;

function init() {
    // 场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // 天蓝色背景

    // 相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);

    // 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // 开启阴影
    document.body.appendChild(renderer.domElement);

    // 光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    // 配置阴影
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    // 控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 启用阻尼效果

    // 初始化物理世界 (如果使用)
    // initPhysics();

    // 创建地面
    createGround();

    // 加载模型
    loadModels();

    // 初始化鸡蛋计数器显示
    updateEggCounterDisplay();

    // 添加事件监听
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onClick); // 或者使用 'pointerdown'

    // 开始动画循环
    animate();
}

 const currentTime = new Date().toLocaleString();  // 使用日期作为 key，例如 '2025-04-24'
 
function updateEggCounterDisplay() {
  
    let eggHistory = JSON.parse(localStorage.getItem('eggHistory') || '{}');  // 改为对象 { 'key': count }
    if (!eggHistory[currentTime]) {
        eggHistory[currentTime] = 0;  // 如果 key 不存在，初始化为 0
    }
    eggHistory[currentTime] += 1;  // 累加当天的 count
    localStorage.setItem('eggHistory', JSON.stringify(eggHistory));
    
    let historyKeys = Object.keys(eggHistory).sort().reverse();  // 获取键并倒序排序
    let historyDisplay = '';
    for (const key of historyKeys) {
        historyDisplay += `<p>${key}: ${eggHistory[key]}</p>`;
    }
    document.getElementById('eggCounter').innerText = `当前下蛋数量: ${eggHistory[currentTime]}`;
    document.getElementById('eggHistoryDisplay').innerHTML = historyDisplay;  // 倒序展示历史
}

// --- 物理引擎初始化 (示例: Cannon.js) ---
/*
function initPhysics() {
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0); // 设置重力

    // 定义材质
    groundPhysMaterial = new CANNON.Material('ground');
    eggPhysMaterial = new CANNON.Material('egg');
    // 鸡的物理材质 (可能不需要复杂交互，设为 static 或 kinematic)
    // chickenPhysMaterial = new CANNON.Material('chicken');

    // 定义接触材质属性 (碰撞效果)
    const groundEggContactMaterial = new CANNON.ContactMaterial(
        groundPhysMaterial,
        eggPhysMaterial,
        {
            restitution: 0.3, // 弹性
            friction: 0.5     // 摩擦力
        }
    );
    world.addContactMaterial(groundEggContactMaterial);

    // 创建地面物理体
    const groundShape = new CANNON.Plane();
    groundBody = new CANNON.Body({ mass: 0, material: groundPhysMaterial }); // mass = 0 表示静态
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // 使平面水平
    groundBody.position.y = 0; // 地面位置
    world.addBody(groundBody);
}
*/

// --- 创建地面 ---
function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x90ee90, side: THREE.DoubleSide }); // 绿色地面
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2; // 水平放置
    groundMesh.receiveShadow = true; // 接收阴影
    groundMesh.position.y = 0; // 确保与物理地面位置一致
    scene.add(groundMesh);
}

// --- 加载模型 ---
function loadModels() {
    // 从外部文件创建小鸡模型
    chickenModel = createChickenModel();
    scene.add(chickenModel);

    // 从外部文件创建鸡蛋模板
    eggTemplateMesh = createEggTemplate();

    // 标记模型已加载
    loadedModels["chicken"] = chickenModel;
    loadedModels["egg"] = eggTemplateMesh;
    console.log("Models loaded from external files.");
}

// --- 处理点击事件 ---
function onClick(event) {
    if (!chickenModel) return; // 确保小鸡模型已加载

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // 将鼠标点击位置转换为归一化设备坐标 (-1 到 +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 通过摄像机和鼠标位置更新射线
    raycaster.setFromCamera(mouse, camera);

    // 计算物体和射线的交点 (只检测小鸡模型及其子对象)
    const intersects = raycaster.intersectObject(chickenModel, true);

    if (intersects.length > 0) {
        console.log("Chicken clicked!");
        layEgg();
    }
}

// --- 下蛋逻辑 ---
function layEgg() {
    // 更新逻辑已移至 updateEggCounterDisplay
    
    updateEggCounterDisplay();  // 调用现有的函数
    
    if (!eggTemplateMesh || !chickenModel) {
        console.warn("Egg template or chicken model not ready.");
        return;
    }
    console.log("Laying egg...");
    const newEggMesh = eggTemplateMesh.clone();
    const spawnPosition = chickenModel.position.clone();
    spawnPosition.y -= 0.2;
    spawnPosition.x += (Math.random() - 0.5) * 0.1;
    newEggMesh.position.copy(spawnPosition);
    newEggMesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
    const eggData = {
        mesh: newEggMesh,
        velocity: new THREE.Vector3(0, -0.1, 0),
        onGround: false
    };
    activeEggs.push(eggData);
    scene.add(newEggMesh);
    isFlapping = true;
    flappingStartTime = clock.getElapsedTime();
    if (chickenModel.userData.leftWingPivot && chickenModel.userData.rightWingPivot) {
        chickenModel.userData.leftWingPivot.rotation.z = 0;
        chickenModel.userData.rightWingPivot.rotation.z = 0;
    }

    // 移除多余的闭括号

    // === 选项 B: 使用物理引擎 (示例: Cannon.js) ===
    /*
    // 创建鸡蛋物理体
    const eggShape = new CANNON.Sphere(0.15); // 假设鸡蛋半径0.15 (根据模型调整)
    const eggBody = new CANNON.Body({
        mass: 0.1, // 鸡蛋质量
        position: new CANNON.Vec3(spawnPosition.x, spawnPosition.y, spawnPosition.z),
        shape: eggShape,
        material: eggPhysMaterial
    });
    world.addBody(eggBody);

    // 存储 Mesh 和 Body 的对应关系
    activeEggs.push({ mesh: newEggMesh, body: eggBody });
    scene.add(newEggMesh);

    // 触发挥动翅膀动画
    isFlapping = true;
    flappingStartTime = clock.getElapsedTime();
    // 重置翅膀初始角度 (可选，如果希望每次都从静止开始)
    if (chickenModel.userData.leftWingPivot && chickenModel.userData.rightWingPivot) {
        chickenModel.userData.leftWingPivot.rotation.z = Math.PI / 6; // 恢复初始倾斜
        chickenModel.userData.rightWingPivot.rotation.z = -Math.PI / 6; // 恢复初始倾斜
    }
    */

    // (可选) 播放音效
    // playSound('egg_drop.mp3');

    // (可选) 触发小鸡下蛋动画
    // playChickenAnimation('laying');

    // 新逻辑：保证小鸡在摄像机视野中心附近
    // 1. 计算摄像机视线中心点与地面 (y=0.5) 的交点
    const centerNDC = new THREE.Vector2(0, 0); // 屏幕中心
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(centerNDC, camera);
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.5); // 地面平面 y=0.5
    const targetCenter = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(groundPlane, targetCenter)) {
        // 成功找到交点
    } else {
        // 如果射线与平面平行或背离（例如相机完全看向天空或地下）
        // 使用相机位置在地面上的投影作为备用
        targetCenter.copy(camera.position);
        targetCenter.y = 0.5;
        console.warn("Camera ray does not intersect ground plane, using camera projection.");
    }

    // 2. 在目标中心点周围的更小圆形区域内随机生成位置
    const randomRadius = Math.random() * 3 + 0.2; // 半径在 0.2 到 1.2 之间 (进一步缩小范围)
    const randomAngle = Math.random() * Math.PI * 2;

    const offsetX = Math.cos(randomAngle) * randomRadius;
    const offsetZ = Math.sin(randomAngle) * randomRadius;

    let newPos = new THREE.Vector3(
        targetCenter.x + offsetX,
        0.5, // 保持在地面上方
        targetCenter.z + offsetZ
    );

    // 3. 限制在地面范围内
    const groundSize = 50;
    const halfSize = groundSize / 2 - 0.3; // 减去小鸡半径/2的边距
    newPos.x = Math.max(-halfSize, Math.min(halfSize, newPos.x));
    newPos.z = Math.max(-halfSize, Math.min(halfSize, newPos.z));

    // 4. 设置小鸡新位置
    chickenModel.position.copy(newPos);
}


// --- 动画循环 ---
function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();

    // 更新控制器
    controls.update();

    // --- 更新小鸡翅膀动画 ---
    if (isFlapping && chickenModel && chickenModel.userData.leftWingPivot && chickenModel.userData.rightWingPivot) {
        const elapsedTime = clock.getElapsedTime() - flappingStartTime;
        if (elapsedTime < flappingDuration) {
            // 使用 sin 函数创建上下摆动效果
            const angle = Math.sin(elapsedTime * flappingSpeed) * (flappingAngle * 0.8); // 减少角度以避免穿模
            // 应用旋转 (围绕 Z 轴)
            chickenModel.userData.leftWingPivot.rotation.z = angle; // 直接设置枢轴旋转角度
            chickenModel.userData.rightWingPivot.rotation.z = -angle; // 直接设置枢轴旋转角度
        } else {
            // 动画结束，恢复初始姿态
            isFlapping = false;
            chickenModel.userData.leftWingPivot.rotation.z = 0;
            chickenModel.userData.rightWingPivot.rotation.z = 0;
        }
    }

    // --- 更新物理世界 (如果使用) ---
    // world.step(timeStep, deltaTime);

    // --- 更新鸡蛋位置 ---
    for (let i = activeEggs.length - 1; i >= 0; i--) {
        const eggData = activeEggs[i];

        // === 选项 A: 手动更新 ===
        if (!eggData.onGround) {
            // 简单重力模拟
            eggData.velocity.y -= 9.8 * deltaTime * 0.1; // 调整重力效果
            eggData.mesh.position.addScaledVector(eggData.velocity, deltaTime);

            // 简单地面碰撞检测
            if (eggData.mesh.position.y <= 0.1) { // 假设地面在 y=0, 0.1 是鸡蛋半径
                eggData.mesh.position.y = 0.1;
                eggData.onGround = true;
                // 可以添加一点弹跳或滚动效果
                // playSound('egg_land.mp3');
            }
        }

        // === 选项 B: 从物理引擎同步 ===
        /*
        eggData.mesh.position.copy(eggData.body.position);
        eggData.mesh.quaternion.copy(eggData.body.quaternion);

        // 可选：如果鸡蛋速度很慢且在地面上，可以将其设为休眠状态以提高性能
        if (eggData.body.position.y < 0.15 && eggData.body.sleepState === CANNON.Body.AWAKE) {
             // 检查速度是否足够小
             const speed = eggData.body.velocity.length();
             if (speed < 0.1) {
                // eggData.body.sleep();
             }
        }
        */

         // 可选: 移除掉出边界的鸡蛋
         if (eggData.mesh.position.y < -10 || Math.abs(eggData.mesh.position.x) > 30 || Math.abs(eggData.mesh.position.z) > 30) {
             scene.remove(eggData.mesh);
             // if (eggData.body) world.removeBody(eggData.body); // 如果使用物理引擎，也移除物理体
             activeEggs.splice(i, 1);
             console.log("Removed an egg that fell off.");
         }
    }

    // 更新小鸡动画 (如果需要)
    // updateChickenAnimation(deltaTime);

    // 渲染场景
    renderer.render(scene, camera);
}

// --- 窗口大小调整 ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- 启动 ---
init();