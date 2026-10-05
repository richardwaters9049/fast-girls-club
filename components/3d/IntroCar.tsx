"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrthographicCamera, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { HERO_CAR_LIVERY_PATH, HERO_CAR_MODEL_PATH } from "@/lib/hero-car-assets";
import { prepareModel } from "./Model";

function Car(): React.ReactElement {
    const { scene } = useGLTF(HERO_CAR_MODEL_PATH);
    const texture = useTexture(HERO_CAR_LIVERY_PATH);
    const { size } = useThree();
    const model = useMemo(() => {
        const prepared = prepareModel(scene, texture);
        prepared.scene.rotation.y = Math.PI;
        const bounds = new THREE.Box3().setFromObject(prepared.scene);
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 4.8 / bounds.getSize(new THREE.Vector3()).x;
        prepared.scene.scale.setScalar(scale);
        prepared.scene.position.copy(center.multiplyScalar(-scale));
        return prepared;
    }, [scene, texture]);

    useEffect(() => () => {
        model.materials.forEach((material) => material.dispose());
        model.texture.dispose();
    }, [model]);

    return (
        <>
            <OrthographicCamera makeDefault position={[0, 2, 8]} rotation={[-Math.atan2(2, 8), 0, 0]} zoom={size.width / 5.8} near={0.01} far={100} />
            <primitive object={model.scene} />
        </>
    );
}

// A single rendered pose: CSS moves the small canvas, avoiding another
// continuously animated 3D scene while the main hero warms underneath.
export default function IntroCar(): React.ReactElement {
    return (
        <Canvas
            frameloop="demand"
            orthographic
            camera={{ position: [0, 2, 8], zoom: 38, near: 0.01, far: 100 }}
            dpr={1}
            gl={{ alpha: true, antialias: true }}
            style={{ pointerEvents: "none" }}
        >
            <ambientLight intensity={1.5} />
            <directionalLight position={[3, 6, 5]} intensity={3} />
            <directionalLight position={[-4, 2, -2]} intensity={2} color="#ffb7cf" />
            <Suspense fallback={null}><Car /></Suspense>
        </Canvas>
    );
}
