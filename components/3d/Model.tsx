"use client";

import { useGLTF } from "@react-three/drei";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const MODEL_PATH = "/images/3Dimages/formula-1.glb";
const LIVERY_TEXTURE_PATH =
    "/images/3Dimages/formula 1/formula1_BlackPink_Diffuse.png";

const PINK = new THREE.Color("#ff729f");
const BLACK = new THREE.Color("#050507");

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

        entrance.to(
            model.position,
            {
                x: 0,
                y: 0,
                duration: 1.2,
                ease: "power3.out",
            },
            0,
        );

        entrance.to(
            model.scale,
            {
                x: 0.01,
                y: 0.01,
                z: 0.01,
                duration: 1.2,
                ease: "power3.out",
            },
            0,
        );

        entrance.to(
            model.rotation,
            {
                y: `+=${Math.PI * 2}`,
                duration: 1.35,
                ease: "power3.out",
            },
            0,
        );

        return () => {
            entrance.kill();
        };
    }, []);

    useEffect(() => {
        const textureLoader = new THREE.TextureLoader();

        textureLoader.load(
            LIVERY_TEXTURE_PATH,
            (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.flipY = false;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.needsUpdate = true;

                scene.traverse((child) => {
                    if (!(child instanceof THREE.Mesh)) {
                        return;
                    }

                    child.castShadow = true;
                    child.receiveShadow = true;

                    const materials = Array.isArray(child.material)
                        ? child.material
                        : [child.material];

                    materials.forEach((material) => {
                        material.side = THREE.DoubleSide;

                        if (
                            material instanceof
                            THREE.MeshStandardMaterial ||
                            material instanceof
                            THREE.MeshPhysicalMaterial
                        ) {
                            if (material.name === "Mat") {
                                material.map = texture;
                                material.color.setRGB(1, 1, 1);
                                material.metalness = 0.82;
                                material.roughness = 0.22;

                                if (
                                    material instanceof
                                    THREE.MeshPhysicalMaterial
                                ) {
                                    material.clearcoat = 1;
                                    material.clearcoatRoughness = 0.12;
                                }

                                material.needsUpdate = true;
                            }

                            if (material.name === "Mirrors") {
                                material.map = null;
                                material.color.copy(PINK);
                                material.metalness = 0.65;
                                material.roughness = 0.2;

                                if (
                                    material instanceof
                                    THREE.MeshPhysicalMaterial
                                ) {
                                    material.clearcoat = 0.9;
                                    material.clearcoatRoughness = 0.1;
                                }

                                material.needsUpdate = true;
                            }

                            if (material.name === "Fillers") {
                                material.map = null;
                                material.color.copy(BLACK);
                                material.metalness = 0.35;
                                material.roughness = 0.45;
                                material.needsUpdate = true;
                            }
                        }
                    });
                });
            },
        );
    }, [scene]);

    return (
        <group ref={modelRef}>
            <primitive object={scene} />
        </group>
    );
}

useGLTF.preload(MODEL_PATH);