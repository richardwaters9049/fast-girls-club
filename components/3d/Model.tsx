"use client";

import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
} from "react";
import * as THREE from "three";

import {
    HERO_CAR_LIVERY_PATH,
    HERO_CAR_MODEL_PATH,
} from "@/lib/hero-car-assets";

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

interface ModelProps {
    onReady: () => void;
    ready: boolean;
    interactive: boolean;
}

interface PointerPosition {
    x: number;
    y: number;
}

function pointerDistance(points: PointerPosition[]): number {
    return Math.hypot(
        points[0].x - points[1].x,
        points[0].y - points[1].y,
    );
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

export default function Model({ onReady, ready, interactive }: ModelProps): React.ReactElement {
    const { scene: sourceScene } = useGLTF(HERO_CAR_MODEL_PATH);
    const sourceTexture = useTexture(HERO_CAR_LIVERY_PATH);
    const { gl } = useThree();
    const entranceRef = useRef<THREE.Group>(null);
    const interactionRef = useRef<THREE.Group>(null);
    const scrollRef = useRef<THREE.Group>(null);
    const scrollProgressRef = useRef(0);
    const entranceProgressRef = useRef(0);
    const reducedMotionRef = useRef(false);
    const firstFramesRef = useRef(0);
    const readyReportedRef = useRef(false);
    const carHasExitedRef = useRef(false);
    const rotationTargetRef = useRef({
        x: 0,
        y: BASE_ROTATION_Y,
    });
    const zoomTargetRef = useRef(1);
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

        reducedMotionRef.current = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        if (reducedMotionRef.current) {
            model.position.set(0, 0, 0);
            model.rotation.y = 0;
            model.scale.setScalar(MODEL_SCALE);
            entranceProgressRef.current = 1;
            return;
        }

        model.position.set(0.35, -0.08, 0);
        model.rotation.y = -Math.PI * 2;
        model.scale.setScalar(0.008);
    }, []);

    useEffect(() => {
        const reduceMotionQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        );

        const updateScrollProgress = (): void => {
            if (reduceMotionQuery.matches) {
                scrollProgressRef.current = 0;
                return;
            }

            const exitDistance = Math.min(window.innerHeight * 0.8, 640);
            const mobile = window.innerWidth < 1024;
            const carTop = gl.domElement.getBoundingClientRect().top + window.scrollY;
            const scrollStart = mobile
                ? carTop - window.innerHeight * 0.1
                : 0;

            const nextProgress = THREE.MathUtils.clamp(
                (window.scrollY - scrollStart) / exitDistance,
                0,
                1,
            );

            if (nextProgress >= 0.35) {
                carHasExitedRef.current = true;
            }

            if (nextProgress <= 0.05 && carHasExitedRef.current) {
                rotationTargetRef.current = {
                    x: 0,
                    y: BASE_ROTATION_Y,
                };
                zoomTargetRef.current = 1;
                carHasExitedRef.current = false;
            }

            scrollProgressRef.current = nextProgress;
        };

        updateScrollProgress();
        window.addEventListener("scroll", updateScrollProgress, {
            passive: true,
        });
        window.addEventListener("resize", updateScrollProgress);
        reduceMotionQuery.addEventListener(
            "change",
            updateScrollProgress,
        );

        return () => {
            window.removeEventListener("scroll", updateScrollProgress);
            window.removeEventListener("resize", updateScrollProgress);
            reduceMotionQuery.removeEventListener(
                "change",
                updateScrollProgress,
            );
        };
    }, [gl]);

    useEffect(() => {
        if (!interactive) {
            return;
        }

        const canvas = gl.domElement;
        const pointers = new Map<number, PointerPosition>();
        let previousPinchDistance: number | null = null;

        const handlePointerDown = (event: PointerEvent): void => {
            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }

            event.preventDefault();
            canvas.setPointerCapture(event.pointerId);
            pointers.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY,
            });

            if (pointers.size >= 2) {
                previousPinchDistance = pointerDistance(
                    Array.from(pointers.values()).slice(0, 2),
                );
            }
        };

        const handlePointerMove = (event: PointerEvent): void => {
            const previous = pointers.get(event.pointerId);

            if (!previous) {
                return;
            }

            event.preventDefault();
            pointers.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY,
            });

            if (pointers.size >= 2) {
                const nextDistance = pointerDistance(
                    Array.from(pointers.values()).slice(0, 2),
                );

                if (previousPinchDistance && previousPinchDistance > 0) {
                    zoomTargetRef.current = THREE.MathUtils.clamp(
                        zoomTargetRef.current * nextDistance / previousPinchDistance,
                        0.8,
                        1.5,
                    );
                }

                previousPinchDistance = nextDistance;
                return;
            }

            rotationTargetRef.current.y += (event.clientX - previous.x) * 0.01;
            rotationTargetRef.current.x = THREE.MathUtils.clamp(
                rotationTargetRef.current.x + (event.clientY - previous.y) * 0.008,
                -0.5,
                0.5,
            );
        };

        const handlePointerEnd = (event: PointerEvent): void => {
            pointers.delete(event.pointerId);
            previousPinchDistance = null;

            if (canvas.hasPointerCapture(event.pointerId)) {
                canvas.releasePointerCapture(event.pointerId);
            }
        };

        canvas.addEventListener("pointerdown", handlePointerDown);
        canvas.addEventListener("pointermove", handlePointerMove);
        canvas.addEventListener("pointerup", handlePointerEnd);
        canvas.addEventListener("pointercancel", handlePointerEnd);

        return () => {
            canvas.removeEventListener("pointerdown", handlePointerDown);
            canvas.removeEventListener("pointermove", handlePointerMove);
            canvas.removeEventListener("pointerup", handlePointerEnd);
            canvas.removeEventListener("pointercancel", handlePointerEnd);
            pointers.clear();
        };
    }, [gl, interactive]);

    useFrame((_, delta) => {
        if (!readyReportedRef.current) {
            firstFramesRef.current += 1;

            if (firstFramesRef.current >= 2) {
                readyReportedRef.current = true;
                onReady();
            }
        }

        const entranceGroup = entranceRef.current;

        if (
            ready &&
            entranceGroup &&
            !reducedMotionRef.current &&
            entranceProgressRef.current < 1
        ) {
            entranceProgressRef.current = Math.min(
                1,
                entranceProgressRef.current + Math.min(delta, 0.05) / 1.35,
            );
            const progress = entranceProgressRef.current;
            const ease = 1 - Math.pow(1 - progress, 3);
            const spinEase = progress < 0.5
                ? 4 * progress ** 3
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            entranceGroup.position.set(
                THREE.MathUtils.lerp(0.35, 0, ease),
                THREE.MathUtils.lerp(-0.08, 0, ease),
                0,
            );
            entranceGroup.scale.setScalar(
                THREE.MathUtils.lerp(0.008, MODEL_SCALE, ease),
            );
            entranceGroup.rotation.y = THREE.MathUtils.lerp(
                -Math.PI * 2,
                0,
                spinEase,
            );
        }

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
        const zoom = THREE.MathUtils.damp(
            interactionGroup.scale.x,
            zoomTargetRef.current,
            10,
            delta,
        );
        interactionGroup.scale.setScalar(zoom);
    });

    return (
        <group ref={scrollRef}>
            <group
                ref={interactionRef}
                rotation={[0, BASE_ROTATION_Y, 0]}
            >
                <group ref={entranceRef}>
                    <primitive object={preparedModel.scene} />
                </group>
            </group>
        </group>
    );
}

useGLTF.preload(HERO_CAR_MODEL_PATH);
useTexture.preload(HERO_CAR_LIVERY_PATH);
