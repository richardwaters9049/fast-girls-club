"use client";

import { Environment, Float } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import CameraRig from "./CameraRig";
import Model from "./Model";

export default function Scene(): React.ReactElement {
    return (
        <Canvas
            camera={{
                position: [0, 1.2, 6],
                fov: 38,
            }}
            dpr={[1, 1.5]}
            gl={{
                antialias: true,
                alpha: true,
            }}
        >
            <color attach="background" args={["#16070d"]} />

            <ambientLight intensity={1.8} />

            <directionalLight
                position={[4, 5, 4]}
                intensity={3}
                color="#ffffff"
            />

            <directionalLight
                position={[-4, 2, 2]}
                intensity={2}
                color="#ff729f"
            />

            <pointLight
                position={[0, 1, 3]}
                intensity={3}
                distance={10}
                color="#ff729f"
            />

            <Environment preset="studio" />

            <CameraRig />

            <Float
                speed={1.2}
                rotationIntensity={0.08}
                floatIntensity={0.25}
            >
                <Model />
            </Float>
        </Canvas>
    );
}