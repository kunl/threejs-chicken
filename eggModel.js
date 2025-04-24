import * as THREE from 'three';

export function createEggTemplate() {
    // 创建鸡蛋模板（用缩放的球体表示）
    const eggGeometry = new THREE.SphereGeometry(0.1, 24, 24);
    eggGeometry.scale(1, 1.3, 1); // 在 Y 轴上拉伸，使其更像鸡蛋
    const eggMaterial = new THREE.MeshStandardMaterial({ color: 0xffdab9 }); // 肉色
    const eggTemplateMesh = new THREE.Mesh(eggGeometry, eggMaterial);
    eggTemplateMesh.castShadow = true;
    // 不直接添加到场景，作为模板
    return eggTemplateMesh;
}