import * as THREE from 'three';

export function createChickenModel() {
    const chickenModel = new THREE.Group();

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffe066 }); // 黄色身体
    const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 }); // 橙色嘴巴
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 }); // 黑色眼睛
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 }); // 橙色腿
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 }); // 稍深的黄色翅膀
    const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xdaa520 }); // 棕黄色尾巴

    // 身体 (橄榄球形状 - 通过缩放球体实现)
    const bodyGeometry = new THREE.SphereGeometry(0.4, 32, 16);
    bodyGeometry.scale(1.2, 1, 1.5); // X轴加宽，Z轴拉长
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.castShadow = true;
    chickenModel.add(bodyMesh);

    // 嘴巴 (圆锥体)
    const beakGeometry = new THREE.ConeGeometry(0.1, 0.2, 32);
    const beakMesh = new THREE.Mesh(beakGeometry, beakMaterial);
    // 调整位置以适应新的身体形状 (更靠前)
    beakMesh.position.set(0, 0.1, 0.4 * 1.5); // Z轴位置按比例调整
    beakMesh.rotation.x = Math.PI / 2; // 指向前
    beakMesh.castShadow = true;
    chickenModel.add(beakMesh);

    // 眼睛 (小球体)
    const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 8);
    const leftEyeMesh = new THREE.Mesh(eyeGeometry, eyeMaterial);
    // 调整位置以适应新的身体形状 (更宽，更靠前)
    leftEyeMesh.position.set(-0.15 * 1.2, 0.2, 0.35 * 1.5);
    chickenModel.add(leftEyeMesh);
    const rightEyeMesh = new THREE.Mesh(eyeGeometry, eyeMaterial);
    // 调整位置以适应新的身体形状 (更宽，更靠前)
    rightEyeMesh.position.set(0.15 * 1.2, 0.2, 0.35 * 1.5);
    chickenModel.add(rightEyeMesh);

    // 腿 (圆柱体)
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16);
    const leftLegMesh = new THREE.Mesh(legGeometry, legMaterial);
    // 调整位置以适应新的身体形状 (更宽)
    leftLegMesh.position.set(-0.15 * 1.2, -0.4, 0);
    leftLegMesh.castShadow = true;
    chickenModel.add(leftLegMesh);
    const rightLegMesh = new THREE.Mesh(legGeometry, legMaterial);
    // 调整位置以适应新的身体形状 (更宽)
    rightLegMesh.position.set(0.15 * 1.2, -0.4, 0);
    rightLegMesh.castShadow = true;
    chickenModel.add(rightLegMesh);

    // 翅膀 (扁平椭球或自定义形状 - 这里用扁球体简化)
    const wingGeometry = new THREE.SphereGeometry(0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2); // 创建半球形状
    wingGeometry.scale(1, 0.6, 1.0); // 调整缩放以增加厚度并减少宽度，避免穿模

    // 创建翅膀枢轴
    const leftWingPivot = new THREE.Group();
    const rightWingPivot = new THREE.Group();

    // 设置枢轴位置 (原翅膀位置)
    leftWingPivot.position.set(-0.4 * 1.2, 0, 0);
    rightWingPivot.position.set(0.4 * 1.2, 0, 0);

    // 将枢轴添加到模型
    chickenModel.add(leftWingPivot);
    chickenModel.add(rightWingPivot);

    // 创建翅膀模型
    const leftWingMesh = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWingMesh.position.set(0, 0, 0); // 调整为对称位置
    leftWingMesh.rotation.z = Math.PI / 6; // 稍微倾斜
    leftWingMesh.castShadow = true;
    leftWingPivot.add(leftWingMesh); // 将翅膀添加到枢轴

    const rightWingMesh = leftWingMesh.clone();
    rightWingMesh.position.set(0, 0, 0); // 调整为对称位置
    rightWingMesh.rotation.z = -Math.PI / 6;
    rightWingMesh.castShadow = true;
    rightWingPivot.add(rightWingMesh); // 将翅膀添加到枢轴

    // 将翅膀枢轴引用存储在 userData 中
    chickenModel.userData.leftWingPivot = leftWingPivot;
    chickenModel.userData.rightWingPivot = rightWingPivot;

    // 尾巴 (圆锥体)
    const tailGeometry = new THREE.ConeGeometry(0.15, 0.3, 8);
    const tailMesh = new THREE.Mesh(tailGeometry, tailMaterial);
    // 调整位置以适应新的身体形状 (更靠后)
    tailMesh.position.set(0, 0.1, -0.4 * 1.5);
    tailMesh.rotation.x = -Math.PI / 3; // 向上翘
    tailMesh.castShadow = true;
    chickenModel.add(tailMesh);

    // 设置整个模型的位置和阴影
    chickenModel.position.set(0, 0.6, 0); // 增加 Y 位置以避免穿透地面
    chickenModel.castShadow = true; // Group本身不投射阴影，但其子对象可以
    chickenModel.traverse((child) => { // 确保所有子对象都投射阴影
        if (child.isMesh) {
            child.castShadow = true;
        }
    });

    return chickenModel;
}