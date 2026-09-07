"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function CameraRig(): React.ReactElement {
    const rigRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!rigRef.current) {
            return;
        }

        rigRef.current.rotation.y = THREE.MathUtils.lerp(
            rigRef.current.rotation.y,
            state.pointer.x * 0.12,
            0.04,
        );

        rigRef.current.rotation.x = THREE.MathUtils.lerp(
            rigRef.current.rotation.x,
            state.pointer.y * -0.06,
            0.04,
        );
    });

    return <group ref={rigRef} />;
}