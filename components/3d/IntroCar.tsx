"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { HERO_CAR_LIVERY_PATH, HERO_CAR_MODEL_PATH } from "@/lib/hero-car-assets";
import { prepareModel } from "./Model";
import type { MotionValue } from "framer-motion";

function Car({ driving, progress }: { driving: boolean; progress: MotionValue<number> }): React.ReactElement {
    const { scene } = useGLTF(HERO_CAR_MODEL_PATH);
    const texture = useTexture(HERO_CAR_LIVERY_PATH);
    const { size, invalidate } = useThree();
    const turn = useRef<THREE.Group>(null);

    useEffect(() => {
        if (!driving) return;
        invalidate();
    }, [driving, invalidate]);

    useFrame(() => {
        if (!driving || !turn.current) return;
        // One continuous full spin with a sideways finish. Travel stays on
        // the same corner-to-corner arc without a reverse countersteer.
        const travel = progress.get();
        const bend = THREE.MathUtils.smoothstep(travel, 0.12, 0.9);
        turn.current.rotation.y = 0.35 - bend * (Math.PI * 2 + 1.05);
        turn.current.rotation.z = Math.atan2(192 * (1 - 2 * travel), window.innerWidth + size.width);
        if (travel < 1) invalidate();
    });
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
            <group ref={turn} rotation={[0, 0.35, 0.1]}>
                <primitive object={model.scene} />
            </group>
        </>
    );
}

// Render the changing 3D angle only during the shared corner-to-corner drive timeline,
// then return to demand rendering.
export default function IntroCar({ driving, progress }: { driving: boolean; progress: MotionValue<number> }): React.ReactElement {
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
            <Suspense fallback={null}><Car driving={driving} progress={progress} /></Suspense>
        </Canvas>
    );
}
