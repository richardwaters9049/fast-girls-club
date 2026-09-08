"use client";

import { useGLTF } from "@react-three/drei";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const MODEL_PATH = "/images/3Dimages/formula-1.glb";

export default function Model(): React.ReactElement {
    const { scene } = useGLTF(MODEL_PATH);
    const modelRef = useRef<THREE.Group>(null);

    useEffect(() => {
        const model = modelRef.current;

        if (!model) {
            return;
        }

        gsap.fromTo(
            model.position,
            {
                x: 0.8,
                y: -0.1,
            },
            {
                x: 0,
                y: 0,
                duration: 1.1,
                delay: 0.1,
                ease: "power3.out",
            },
        );

        gsap.fromTo(
            model.scale,
            {
                x: 0.0085,
                y: 0.0085,
                z: 0.0085,
            },
            {
                x: 0.01,
                y: 0.01,
                z: 0.01,
                duration: 1.1,
                delay: 0.1,
                ease: "power3.out",
            },
        );

        return () => {
            gsap.killTweensOf(model.position);
            gsap.killTweensOf(model.scale);
        };
    }, []);

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
            ref={modelRef}
            rotation={[0, -Math.PI / 2, 0]}
            scale={0.01}
        >
            <primitive object={scene} />
        </group>
    );
}

useGLTF.preload(MODEL_PATH);