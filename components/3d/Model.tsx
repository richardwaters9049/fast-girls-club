"use client";

import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/images/3Dimages/formula-1.glb";

export default function Model(): React.ReactElement {
    const { scene } = useGLTF(MODEL_PATH);

    scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) {
            return;
        }

        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material instanceof THREE.Material) {
            child.material.side = THREE.DoubleSide;
        }
    });

    return (
        <group
            rotation={[
                0,
                -Math.PI / 2,
                0,
            ]}
        >
            <primitive
                object={scene}
                scale={0.01}
            />
        </group>
    );
}

useGLTF.preload(MODEL_PATH);