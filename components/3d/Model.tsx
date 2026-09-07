"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const PINK = "#ff729f";
const DARK = "#111111";
const WHITE = "#ffffff";

interface WheelProps {
    position: [number, number, number];
}

function Wheel({ position }: WheelProps): React.ReactElement {
    const wheelRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (wheelRef.current) {
            wheelRef.current.rotation.z -= 0.02;
        }
    });

    return (
        <mesh
            ref={wheelRef}
            position={position}
            rotation={[Math.PI / 2, 0, 0]}
        >
            <cylinderGeometry args={[0.38, 0.38, 0.22, 32]} />

            <meshStandardMaterial
                color={DARK}
                metalness={0.15}
                roughness={0.75}
            />
        </mesh>
    );
}

export default function Model(): React.ReactElement {
    const carRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!carRef.current) {
            return;
        }

        const time = state.clock.getElapsedTime();

        carRef.current.rotation.y = Math.sin(time * 0.35) * 0.18;
        carRef.current.rotation.x = Math.sin(time * 0.55) * 0.025;
        carRef.current.position.y = Math.sin(time * 0.9) * 0.08;
    });

    return (
        <group ref={carRef} scale={1.35} rotation={[0, -0.35, 0]}>
            {/* Main body */}
            <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[2.5, 0.28, 0.8]} />

                <meshStandardMaterial
                    color={PINK}
                    metalness={0.55}
                    roughness={0.25}
                />
            </mesh>

            {/* Nose */}
            <mesh
                position={[1.65, 0.15, 0]}
                rotation={[0, 0, -Math.PI / 2]}
            >
                <coneGeometry args={[0.38, 1.35, 4]} />

                <meshStandardMaterial
                    color={PINK}
                    metalness={0.55}
                    roughness={0.25}
                />
            </mesh>

            {/* Cockpit */}
            <mesh position={[0.3, 0.4, 0]}>
                <sphereGeometry
                    args={[0.38, 24, 16]}
                    scale={[1.15, 0.75, 0.8]}
                />

                <meshStandardMaterial
                    color={DARK}
                    metalness={0.4}
                    roughness={0.2}
                />
            </mesh>

            {/* Rear body */}
            <mesh position={[-1, 0.22, 0]}>
                <boxGeometry args={[0.8, 0.45, 0.95]} />

                <meshStandardMaterial
                    color={PINK}
                    metalness={0.5}
                    roughness={0.28}
                />
            </mesh>

            {/* Front wing */}
            <mesh position={[1.95, -0.05, 0]}>
                <boxGeometry args={[0.7, 0.08, 1.7]} />

                <meshStandardMaterial
                    color={DARK}
                    metalness={0.5}
                    roughness={0.3}
                />
            </mesh>

            {/* Rear wing */}
            <mesh position={[-1.35, 0.85, 0]}>
                <boxGeometry args={[0.12, 0.72, 1.45]} />

                <meshStandardMaterial
                    color={DARK}
                    metalness={0.45}
                    roughness={0.3}
                />
            </mesh>

            {/* Rear wing support */}
            <mesh position={[-1.35, 0.48, 0]}>
                <boxGeometry args={[0.12, 0.5, 0.12]} />

                <meshStandardMaterial color={DARK} />
            </mesh>

            {/* Side pods */}
            <mesh position={[-0.25, 0.05, 0.58]}>
                <boxGeometry args={[1.15, 0.25, 0.2]} />

                <meshStandardMaterial
                    color={WHITE}
                    metalness={0.25}
                    roughness={0.35}
                />
            </mesh>

            <mesh position={[-0.25, 0.05, -0.58]}>
                <boxGeometry args={[1.15, 0.25, 0.2]} />

                <meshStandardMaterial
                    color={WHITE}
                    metalness={0.25}
                    roughness={0.35}
                />
            </mesh>

            {/* Front wheels */}
            <Wheel position={[1, -0.2, 0.62]} />
            <Wheel position={[1, -0.2, -0.62]} />

            {/* Rear wheels */}
            <Wheel position={[-1, -0.18, 0.66]} />
            <Wheel position={[-1, -0.18, -0.66]} />

            {/* Centre accent */}
            <mesh position={[0.2, 0.36, 0]}>
                <boxGeometry args={[1.4, 0.04, 0.14]} />

                <meshStandardMaterial
                    color={PINK}
                    emissive={PINK}
                    emissiveIntensity={0.2}
                />
            </mesh>
        </group>
    );
}