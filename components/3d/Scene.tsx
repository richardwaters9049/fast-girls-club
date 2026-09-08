"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";

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
            dpr={[1, 1.5]}
            gl={{
                antialias: true,
                alpha: false,
                powerPreference: "high-performance",
            }}
        >
            <color
                attach="background"
                args={["#1c1c1c"]}
            />

            <ambientLight intensity={1.5} />

            <directionalLight
                position={[5, 8, 5]}
                intensity={4}
            />

            <directionalLight
                position={[-5, 3, 2]}
                intensity={2}
            />

            <pointLight
                position={[2, 2, 4]}
                intensity={8}
                color="#ff729f"
            />

            <pointLight
                position={[-3, 1, -2]}
                intensity={5}
                color="#ee8434"
            />

            <Environment preset="studio" />

            <Model />
        </Canvas>
    );
}