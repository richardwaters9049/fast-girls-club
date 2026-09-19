"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

import Model from "./Model";

export default function Scene(): React.ReactElement {
    return (
        <Canvas
            camera={{
                position: [4, 2.5, 6],
                fov: 40,
                near: 0.01,
                far: 100,
            }}
            dpr={[1, 1.25]}
            gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
            }}
            onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 0.85;
            }}
            role="img"
            aria-label="Interactive 3D Formula 1 car. Drag with the mouse to rotate it."
            style={{
                cursor: "grab",
                touchAction: "pan-y",
            }}
        >
            <ambientLight intensity={0.85} />

            <directionalLight
                position={[5, 8, 5]}
                intensity={2.4}
            />

            <directionalLight
                position={[-5, 3, 2]}
                intensity={1.2}
                color="#ffb7cf"
            />

            <pointLight
                position={[2, 2, 4]}
                intensity={3}
                color="#ff729f"
            />

            <pointLight
                position={[-3, 1, -2]}
                intensity={2.4}
                color="#ee8434"
            />

            <Environment preset="studio" />

            <Suspense fallback={null}>
                <Model />
            </Suspense>
        </Canvas>
    );
}
