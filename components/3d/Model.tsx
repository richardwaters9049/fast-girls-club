"use client";

import { useGLTF, useTexture } from "@react-three/drei";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
} from "react";
import * as THREE from "three";

const MODEL_PATH = "/images/3Dimages/formula-1.glb";
const LIVERY_TEXTURE_PATH =
    "/images/3Dimages/formula 1/formula1_BlackPink_Diffuse.png";

const BRAND_PINK = new THREE.Color("#ff729f");
const BRAND_ORANGE = new THREE.Color("#ee8434");
const BRAND_BLACK = new THREE.Color("#1c1c1c");
const BASE_ROTATION_Y = -Math.PI / 2;
const MODEL_SCALE = 0.0085;

interface PreparedModel {
    materials: THREE.Material[];
    scene: THREE.Group;
    texture: THREE.Texture;
}

interface DragState {
    active: boolean;
    lastX: number;
    lastY: number;
    pointerId: number | null;
}

function prepareModel(
    sourceScene: THREE.Group,
    sourceTexture: THREE.Texture,
): PreparedModel {
    const scene = sourceScene.clone(true);
    const texture = sourceTexture.clone();
    const materials: THREE.Material[] = [];

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

        const sourceMaterials = Array.isArray(child.material)
            ? child.material
            : [child.material];
        const clonedMaterials = sourceMaterials.map((sourceMaterial) => {
            const material = sourceMaterial.clone();

            materials.push(material);
            material.side = THREE.DoubleSide;

            if (
                material instanceof THREE.MeshStandardMaterial ||
                material instanceof THREE.MeshPhysicalMaterial
            ) {
                material.envMapIntensity = 1;

                if (material.name === "Mat") {
                    material.map = texture;
                    material.metalnessMap = null;
                    material.roughnessMap = null;
                    material.color.setRGB(1, 1, 1);
                    material.metalness = 0.45;
                    material.roughness = 0.34;
                    material.emissive.copy(BRAND_PINK);
                    material.emissiveIntensity = 0.012;
                }

                if (material.name === "Mirrors") {
                    material.map = null;
                    material.color.copy(BRAND_ORANGE);
                    material.metalness = 0.7;
                    material.roughness = 0.18;
                }

                if (material.name === "Fillers") {
                    material.map = null;
                    material.color.copy(BRAND_BLACK);
                    material.metalness = 0.38;
                    material.roughness = 0.42;
                }

                if (material instanceof THREE.MeshPhysicalMaterial) {
                    material.clearcoat = 1;
                    material.clearcoatRoughness = 0.12;
                }

                material.needsUpdate = true;
            }

            return material;
        });

        child.material = Array.isArray(child.material)
            ? clonedMaterials
            : clonedMaterials[0];
    });

    return {
        materials,
        scene,
        texture,
    };
}

export default function Model(): React.ReactElement {
    const { scene: sourceScene } = useGLTF(MODEL_PATH);
    const sourceTexture = useTexture(LIVERY_TEXTURE_PATH);
    const { gl } = useThree();
    const entranceRef = useRef<THREE.Group>(null);
    const interactionRef = useRef<THREE.Group>(null);
    const scrollRef = useRef<THREE.Group>(null);
    const scrollProgressRef = useRef(0);
    const carHasExitedRef = useRef(false);
    const rotationTargetRef = useRef({
        x: 0,
        y: BASE_ROTATION_Y,
    });
    const dragRef = useRef<DragState>({
        active: false,
        lastX: 0,
        lastY: 0,
        pointerId: null,
    });
    const preparedModel = useMemo(
        () => prepareModel(sourceScene, sourceTexture),
        [sourceScene, sourceTexture],
    );

    useEffect(() => {
        return () => {
            preparedModel.materials.forEach((material) => {
                material.dispose();
            });
            preparedModel.texture.dispose();
        };
    }, [preparedModel]);

    useLayoutEffect(() => {
        const model = entranceRef.current;

        if (!model) {
            return;
        }

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        if (reduceMotion) {
            model.position.set(0, 0, 0);
            model.scale.setScalar(MODEL_SCALE);
            return;
        }

        model.position.set(0.8, -0.1, 0);
        model.scale.setScalar(0.0072);

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
                x: MODEL_SCALE,
                y: MODEL_SCALE,
                z: MODEL_SCALE,
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
        const desktopQuery = window.matchMedia("(min-width: 1024px)");
        const reduceMotionQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        );

        const updateScrollProgress = (): void => {
            if (!desktopQuery.matches || reduceMotionQuery.matches) {
                scrollProgressRef.current = 0;
                return;
            }

            const exitDistance = Math.min(window.innerHeight * 0.8, 640);

            const nextProgress = THREE.MathUtils.clamp(
                window.scrollY / exitDistance,
                0,
                1,
            );

            if (nextProgress >= 0.75) {
                carHasExitedRef.current = true;
            }

            if (nextProgress <= 0.05 && carHasExitedRef.current) {
                rotationTargetRef.current = {
                    x: 0,
                    y: BASE_ROTATION_Y,
                };
                dragRef.current.active = false;
                dragRef.current.pointerId = null;
                carHasExitedRef.current = false;
            }

            scrollProgressRef.current = nextProgress;
        };

        updateScrollProgress();
        window.addEventListener("scroll", updateScrollProgress, {
            passive: true,
        });
        window.addEventListener("resize", updateScrollProgress);
        desktopQuery.addEventListener("change", updateScrollProgress);
        reduceMotionQuery.addEventListener(
            "change",
            updateScrollProgress,
        );

        return () => {
            window.removeEventListener("scroll", updateScrollProgress);
            window.removeEventListener("resize", updateScrollProgress);
            desktopQuery.removeEventListener(
                "change",
                updateScrollProgress,
            );
            reduceMotionQuery.removeEventListener(
                "change",
                updateScrollProgress,
            );
        };
    }, []);

    useFrame((_, delta) => {
        const scrollGroup = scrollRef.current;
        const interactionGroup = interactionRef.current;

        if (!scrollGroup || !interactionGroup) {
            return;
        }

        const progress = scrollProgressRef.current;
        const travelProgress = THREE.MathUtils.smoothstep(
            progress,
            0,
            1,
        );
        const turnArc = Math.sin(travelProgress * Math.PI);
        const targetX = travelProgress * 7.4;
        const targetY =
            Math.pow(travelProgress, 1.65) * 5.2 - turnArc * 0.65;
        const targetZ = turnArc * 0.9;
        const smoothing = 7;

        scrollGroup.position.x = THREE.MathUtils.damp(
            scrollGroup.position.x,
            targetX,
            smoothing,
            delta,
        );
        scrollGroup.position.y = THREE.MathUtils.damp(
            scrollGroup.position.y,
            targetY,
            smoothing,
            delta,
        );
        scrollGroup.position.z = THREE.MathUtils.damp(
            scrollGroup.position.z,
            targetZ,
            smoothing,
            delta,
        );
        scrollGroup.rotation.y = THREE.MathUtils.damp(
            scrollGroup.rotation.y,
            travelProgress * Math.PI * 2,
            smoothing,
            delta,
        );
        scrollGroup.rotation.x = THREE.MathUtils.damp(
            scrollGroup.rotation.x,
            turnArc * 0.08,
            smoothing,
            delta,
        );
        scrollGroup.rotation.z = THREE.MathUtils.damp(
            scrollGroup.rotation.z,
            turnArc * -0.2 - travelProgress * 0.1,
            smoothing,
            delta,
        );

        interactionGroup.rotation.x = THREE.MathUtils.damp(
            interactionGroup.rotation.x,
            rotationTargetRef.current.x,
            10,
            delta,
        );
        interactionGroup.rotation.y = THREE.MathUtils.damp(
            interactionGroup.rotation.y,
            rotationTargetRef.current.y,
            10,
            delta,
        );
    });

    const finishDrag = (event: ThreeEvent<PointerEvent>): void => {
        if (
            dragRef.current.pointerId === event.pointerId &&
            gl.domElement.hasPointerCapture(event.pointerId)
        ) {
            gl.domElement.releasePointerCapture(event.pointerId);
        }

        dragRef.current.active = false;
        dragRef.current.pointerId = null;
    };

    const handlePointerDown = (
        event: ThreeEvent<PointerEvent>,
    ): void => {
        if (event.nativeEvent.pointerType !== "mouse" || event.button !== 0) {
            return;
        }

        event.stopPropagation();
        gl.domElement.setPointerCapture(event.pointerId);
        dragRef.current = {
            active: true,
            lastX: event.clientX,
            lastY: event.clientY,
            pointerId: event.pointerId,
        };
    };

    const handlePointerMove = (
        event: ThreeEvent<PointerEvent>,
    ): void => {
        if (!dragRef.current.active) {
            return;
        }

        const deltaX = event.clientX - dragRef.current.lastX;
        const deltaY = event.clientY - dragRef.current.lastY;

        rotationTargetRef.current.y += deltaX * 0.01;
        rotationTargetRef.current.x = THREE.MathUtils.clamp(
            rotationTargetRef.current.x + deltaY * 0.008,
            -0.5,
            0.5,
        );
        dragRef.current.lastX = event.clientX;
        dragRef.current.lastY = event.clientY;
    };

    return (
        <group ref={scrollRef}>
            <group
                ref={interactionRef}
                rotation={[0, BASE_ROTATION_Y, 0]}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
            >
                <group ref={entranceRef}>
                    <primitive object={preparedModel.scene} />
                </group>
            </group>
        </group>
    );
}

useGLTF.preload(MODEL_PATH);
useTexture.preload(LIVERY_TEXTURE_PATH);
