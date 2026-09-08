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

        model.position.set(0.8, -0.1, 0);
        model.rotation.set(0, -Math.PI / 2, 0);
        model.scale.set(0.0085, 0.0085, 0.0085);

        const entrance = gsap.timeline({
            delay: 0.15,
        });

        entrance.to(model.position, {
            x: 0,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
        }, 0);

        entrance.to(model.scale, {
            x: 0.01,
            y: 0.01,
            z: 0.01,
            duration: 1.2,
            ease: "power3.out",
        }, 0);

        entrance.to(model.rotation, {
            y: `+=${Math.PI * 2}`,
            duration: 1.35,
            ease: "power3.out",
        }, 0);

        return () => {
            entrance.kill();
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
        <group ref={modelRef}>
            <primitive object={scene} />
        </group>
    );
}

useGLTF.preload(MODEL_PATH);