"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import type {
    CircuitMapData,
    CircuitPoint,
} from "@/lib/f1/circuits";

interface RaceMap3DProps {
    circuit: CircuitMapData;
}

interface TrackSample {
    centre: THREE.Vector3;
    left: THREE.Vector3;
    right: THREE.Vector3;
    leftKerb: THREE.Vector3;
    rightKerb: THREE.Vector3;
}

interface TrackGeometry {
    samples: TrackSample[];
    centre: THREE.Vector3;
    startPosition: THREE.Vector3;
    startRotation: number;
    bounds: CircuitBounds;
}

interface CircuitBounds {
    centreX: number;
    centreY: number;
    width: number;
    height: number;
    size: number;
}

type TrackEdge =
    | "left"
    | "right"
    | "leftKerb"
    | "rightKerb";

const TRACK_WIDTH = 1.15;
const KERB_WIDTH = 0.18;
const RUNOFF_WIDTH = 0.32;

const PINK = "#ff729f";
const PINK_LIGHT = "#ffb1c9";
const PINK_DARK = "#c94f78";
const WHITE = "#f7f7f8";

function getCircuitBounds(
    points: CircuitPoint[],
): CircuitBounds {
    const xs = points.map(
        (point) => point.x,
    );

    const ys = points.map(
        (point) => point.y,
    );

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;

    return {
        centreX: (minX + maxX) / 2,
        centreY: (minY + maxY) / 2,
        width,
        height,
        size: Math.max(width, height),
    };
}

function createCircuitCurve(
    points: CircuitPoint[],
): THREE.CatmullRomCurve3 {
    return new THREE.CatmullRomCurve3(
        points.map(
            (point) =>
                new THREE.Vector3(
                    point.x,
                    0,
                    point.y,
                ),
        ),
        true,
        "catmullrom",
        0.12,
    );
}

function createTrackGeometry(
    points: CircuitPoint[],
): TrackGeometry {
    const curve =
        createCircuitCurve(points);

    const divisions = Math.max(
        points.length * 30,
        360,
    );

    const centreline =
        curve.getPoints(divisions);

    const samples: TrackSample[] =
        [];

    for (
        let index = 0;
        index < centreline.length;
        index += 1
    ) {
        const centre =
            centreline[index];

        const previous =
            centreline[
            (index - 1 + centreline.length) %
            centreline.length
            ];

        const next =
            centreline[
            (index + 1) %
            centreline.length
            ];

        const tangent = next
            .clone()
            .sub(previous)
            .normalize();

        const normal = new THREE.Vector3(
            -tangent.z,
            0,
            tangent.x,
        ).normalize();

        const halfWidth =
            TRACK_WIDTH / 2;

        samples.push({
            centre: centre.clone(),

            left: centre
                .clone()
                .add(
                    normal
                        .clone()
                        .multiplyScalar(
                            halfWidth,
                        ),
                ),

            right: centre
                .clone()
                .add(
                    normal
                        .clone()
                        .multiplyScalar(
                            -halfWidth,
                        ),
                ),

            leftKerb: centre
                .clone()
                .add(
                    normal
                        .clone()
                        .multiplyScalar(
                            halfWidth +
                            KERB_WIDTH,
                        ),
                ),

            rightKerb: centre
                .clone()
                .add(
                    normal
                        .clone()
                        .multiplyScalar(
                            -(
                                halfWidth +
                                KERB_WIDTH
                            ),
                        ),
                ),
        });
    }

    const bounds =
        getCircuitBounds(points);

    const startPosition =
        curve.getPointAt(0);

    const startTangent =
        curve.getTangentAt(0);

    return {
        samples,
        centre: new THREE.Vector3(
            bounds.centreX,
            0,
            bounds.centreY,
        ),
        startPosition,
        startRotation: Math.atan2(
            startTangent.x,
            startTangent.z,
        ),
        bounds,
    };
}

function createRibbonGeometry(
    samples: TrackSample[],
    leftKey: TrackEdge,
    rightKey: TrackEdge,
    y: number,
): THREE.BufferGeometry {
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const count = samples.length;

    for (
        let index = 0;
        index < count;
        index += 1
    ) {
        const left =
            samples[index][leftKey];

        const right =
            samples[index][rightKey];

        positions.push(
            left.x,
            y,
            left.z,

            right.x,
            y,
            right.z,
        );

        normals.push(
            0,
            1,
            0,

            0,
            1,
            0,
        );

        const progress =
            index / (count - 1);

        uvs.push(
            0,
            progress,

            1,
            progress,
        );
    }

    for (
        let index = 0;
        index < count - 1;
        index += 1
    ) {
        const offset = index * 2;

        indices.push(
            offset,
            offset + 1,
            offset + 2,

            offset + 1,
            offset + 3,
            offset + 2,
        );
    }

    const geometry =
        new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            positions,
            3,
        ),
    );

    geometry.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(
            normals,
            3,
        ),
    );

    geometry.setAttribute(
        "uv",
        new THREE.Float32BufferAttribute(
            uvs,
            2,
        ),
    );

    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
}

function TrackSurface({
    circuit,
}: {
    circuit: CircuitMapData;
}): React.ReactElement {
    const geometry = useMemo(
        () =>
            createTrackGeometry(
                circuit.points,
            ),
        [circuit.points],
    );

    const trackGeometry = useMemo(
        () =>
            createRibbonGeometry(
                geometry.samples,
                "left",
                "right",
                0.02,
            ),
        [geometry.samples],
    );

    return (
        <mesh
            geometry={trackGeometry}
            castShadow
            receiveShadow
        >
            <meshStandardMaterial
                color="#29292b"
                roughness={0.78}
                metalness={0.12}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

function Kerbs({
    circuit,
}: {
    circuit: CircuitMapData;
}): React.ReactElement {
    const geometry = useMemo(
        () =>
            createTrackGeometry(
                circuit.points,
            ),
        [circuit.points],
    );

    const leftGeometry = useMemo(
        () =>
            createRibbonGeometry(
                geometry.samples,
                "left",
                "leftKerb",
                0.065,
            ),
        [geometry.samples],
    );

    const rightGeometry = useMemo(
        () =>
            createRibbonGeometry(
                geometry.samples,
                "rightKerb",
                "right",
                0.065,
            ),
        [geometry.samples],
    );

    const colours = useMemo(() => {
        const result: number[] =
            [];

        const pink = new THREE.Color(
            PINK,
        );

        const pinkLight =
            new THREE.Color(
                PINK_LIGHT,
            );

        const white = new THREE.Color(
            WHITE,
        );

        const count =
            geometry.samples.length;

        for (
            let index = 0;
            index < count;
            index += 1
        ) {
            const stripe =
                Math.floor(index / 8) % 3;

            const colour =
                stripe === 0
                    ? pink
                    : stripe === 1
                        ? white
                        : pinkLight;

            result.push(
                colour.r,
                colour.g,
                colour.b,

                colour.r,
                colour.g,
                colour.b,
            );
        }

        return result;
    }, [geometry.samples.length]);

    const createKerbMaterial = (
        source: THREE.BufferGeometry,
    ): THREE.BufferGeometry => {
        source.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(
                colours,
                3,
            ),
        );

        return source;
    };

    return (
        <group>
            <mesh
                geometry={createKerbMaterial(
                    leftGeometry,
                )}
                receiveShadow
            >
                <meshStandardMaterial
                    vertexColors
                    roughness={0.5}
                    metalness={0.04}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <mesh
                geometry={createKerbMaterial(
                    rightGeometry,
                )}
                receiveShadow
            >
                <meshStandardMaterial
                    vertexColors
                    roughness={0.5}
                    metalness={0.04}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}

function Runoff({
    circuit,
}: {
    circuit: CircuitMapData;
}): React.ReactElement {
    const geometry = useMemo(
        () =>
            createTrackGeometry(
                circuit.points,
            ),
        [circuit.points],
    );

    const leftGeometry = useMemo(() => {
        const samples =
            geometry.samples.map(
                (sample) => {
                    const direction =
                        sample.leftKerb
                            .clone()
                            .sub(
                                sample.centre,
                            )
                            .normalize();

                    return {
                        ...sample,
                        left:
                            sample.leftKerb.clone(),
                        leftKerb:
                            sample.leftKerb
                                .clone()
                                .add(
                                    direction.multiplyScalar(
                                        RUNOFF_WIDTH,
                                    ),
                                ),
                    };
                },
            );

        return createRibbonGeometry(
            samples,
            "left",
            "leftKerb",
            -0.015,
        );
    }, [geometry.samples]);

    const rightGeometry = useMemo(() => {
        const samples =
            geometry.samples.map(
                (sample) => {
                    const direction =
                        sample.rightKerb
                            .clone()
                            .sub(
                                sample.centre,
                            )
                            .normalize();

                    return {
                        ...sample,
                        right:
                            sample.rightKerb.clone(),
                        rightKerb:
                            sample.rightKerb
                                .clone()
                                .add(
                                    direction.multiplyScalar(
                                        RUNOFF_WIDTH,
                                    ),
                                ),
                    };
                },
            );

        return createRibbonGeometry(
            samples,
            "rightKerb",
            "right",
            -0.01,
        );
    }, [geometry.samples]);

    return (
        <group>
            <mesh
                geometry={leftGeometry}
                receiveShadow
            >
                <meshStandardMaterial
                    color="#151518"
                    roughness={0.92}
                    metalness={0}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <mesh
                geometry={rightGeometry}
                receiveShadow
            >
                <meshStandardMaterial
                    color="#151518"
                    roughness={0.92}
                    metalness={0}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}

function PinkRacingLine({
    circuit,
}: {
    circuit: CircuitMapData;
}): React.ReactElement {
    const geometry = useMemo(
        () =>
            createTrackGeometry(
                circuit.points,
            ),
        [circuit.points],
    );

    const lineGeometry = useMemo(() => {
        const positions: number[] =
            [];

        geometry.samples.forEach(
            (sample) => {
                positions.push(
                    sample.centre.x,
                    0.085,
                    sample.centre.z,
                );
            },
        );

        const result =
            new THREE.BufferGeometry();

        result.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(
                positions,
                3,
            ),
        );

        return result;
    }, [geometry.samples]);

    return (
        <group>
            <lineLoop
                geometry={lineGeometry}
            >
                <lineBasicMaterial
                    color={PINK_DARK}
                    transparent
                    opacity={0.45}
                />
            </lineLoop>

            <lineLoop
                geometry={lineGeometry}
            >
                <lineBasicMaterial
                    color={PINK_LIGHT}
                    transparent
                    opacity={0.18}
                />
            </lineLoop>
        </group>
    );
}

function StartFinishGrid({
    circuit,
}: {
    circuit: CircuitMapData;
}): React.ReactElement {
    const geometry = useMemo(
        () =>
            createTrackGeometry(
                circuit.points,
            ),
        [circuit.points],
    );

    const cells = 10;

    return (
        <group
            position={[
                geometry.startPosition.x,
                0.1,
                geometry.startPosition.z,
            ]}
            rotation={[
                0,
                geometry.startRotation,
                0,
            ]}
        >
            {Array.from(
                { length: cells },
                (_, index) => (
                    <mesh
                        key={index}
                        position={[
                            (
                                index -
                                (cells - 1) /
                                2
                            ) *
                            0.105,
                            0,
                            0,
                        ]}
                    >
                        <boxGeometry
                            args={[
                                0.08,
                                0.025,
                                0.2,
                            ]}
                        />

                        <meshBasicMaterial
                            color={
                                index % 2 ===
                                    0
                                    ? WHITE
                                    : PINK
                            }
                        />
                    </mesh>
                ),
            )}
        </group>
    );
}

function StartFinishLine({
    circuit,
}: {
    circuit: CircuitMapData;
}): React.ReactElement {
    const geometry = useMemo(
        () =>
            createTrackGeometry(
                circuit.points,
            ),
        [circuit.points],
    );

    return (
        <mesh
            position={[
                geometry.startPosition.x,
                0.105,
                geometry.startPosition.z,
            ]}
            rotation={[
                0,
                geometry.startRotation,
                0,
            ]}
        >
            <boxGeometry
                args={[
                    TRACK_WIDTH,
                    0.018,
                    0.025,
                ]}
            />

            <meshBasicMaterial
                color={WHITE}
            />
        </mesh>
    );
}

function CornerMarkers({
    circuit,
}: {
    circuit: CircuitMapData;
}): React.ReactElement {
    const geometry = useMemo(
        () =>
            createTrackGeometry(
                circuit.points,
            ),
        [circuit.points],
    );

    const markers = useMemo(() => {
        const result: Array<{
            position: THREE.Vector3;
            rotation: number;
            pink: boolean;
        }> = [];

        const spacing = Math.max(
            Math.floor(
                geometry.samples.length /
                28,
            ),
            10,
        );

        for (
            let index = 0;
            index < geometry.samples.length;
            index += spacing
        ) {
            const sample =
                geometry.samples[index];

            const next =
                geometry.samples[
                (index + 1) %
                geometry.samples
                    .length
                ];

            const tangent = next.centre
                .clone()
                .sub(sample.centre)
                .normalize();

            const outward =
                sample.leftKerb
                    .clone()
                    .sub(sample.centre)
                    .normalize();

            result.push({
                position:
                    sample.leftKerb
                        .clone()
                        .add(
                            outward.multiplyScalar(
                                0.23,
                            ),
                        ),
                rotation: Math.atan2(
                    tangent.x,
                    tangent.z,
                ),
                pink:
                    Math.floor(
                        index / spacing,
                    ) %
                    2 ===
                    0,
            });
        }

        return result;
    }, [geometry.samples]);

    return (
        <group>
            {markers.map(
                (marker, index) => (
                    <group
                        key={index}
                        position={[
                            marker.position.x,
                            0.13,
                            marker.position.z,
                        ]}
                        rotation={[
                            0,
                            marker.rotation,
                            0,
                        ]}
                    >
                        <mesh>
                            <boxGeometry
                                args={[
                                    0.06,
                                    0.1,
                                    0.035,
                                ]}
                            />

                            <meshStandardMaterial
                                color={
                                    marker.pink
                                        ? PINK
                                        : WHITE
                                }
                                roughness={
                                    0.42
                                }
                                metalness={
                                    0.08
                                }
                            />
                        </mesh>

                        <mesh
                            position={[
                                0,
                                0.065,
                                0,
                            ]}
                        >
                            <boxGeometry
                                args={[
                                    0.075,
                                    0.018,
                                    0.045,
                                ]}
                            />

                            <meshStandardMaterial
                                color="#202024"
                                roughness={
                                    0.5
                                }
                                metalness={
                                    0.2
                                }
                            />
                        </mesh>
                    </group>
                ),
            )}
        </group>
    );
}

function TrackEdgeDetail({
    circuit,
}: {
    circuit: CircuitMapData;
}): React.ReactElement {
    const geometry = useMemo(
        () =>
            createTrackGeometry(
                circuit.points,
            ),
        [circuit.points],
    );

    const markers = useMemo(() => {
        const result: Array<{
            position: THREE.Vector3;
            rotation: number;
        }> = [];

        const spacing = Math.max(
            Math.floor(
                geometry.samples.length /
                36,
            ),
            8,
        );

        for (
            let index = 0;
            index < geometry.samples.length;
            index += spacing
        ) {
            const sample =
                geometry.samples[index];

            const next =
                geometry.samples[
                (index + 1) %
                geometry.samples
                    .length
                ];

            const tangent = next.centre
                .clone()
                .sub(sample.centre)
                .normalize();

            result.push({
                position:
                    sample.rightKerb
                        .clone()
                        .add(
                            sample.rightKerb
                                .clone()
                                .sub(
                                    sample.centre,
                                )
                                .normalize()
                                .multiplyScalar(
                                    0.24,
                                ),
                        ),
                rotation: Math.atan2(
                    tangent.x,
                    tangent.z,
                ),
            });
        }

        return result;
    }, [geometry.samples]);

    return (
        <group>
            {markers.map(
                (marker, index) => (
                    <mesh
                        key={index}
                        position={[
                            marker.position.x,
                            0.12,
                            marker.position.z,
                        ]}
                        rotation={[
                            0,
                            marker.rotation,
                            0,
                        ]}
                    >
                        <boxGeometry
                            args={[
                                0.06,
                                0.08,
                                0.03,
                            ]}
                        />

                        <meshStandardMaterial
                            color="#d9d9dc"
                            roughness={0.5}
                            metalness={0.12}
                        />
                    </mesh>
                ),
            )}
        </group>
    );
}

function CircuitBase({
    circuit,
}: {
    circuit: CircuitMapData;
}): React.ReactElement {
    const bounds = useMemo(
        () =>
            getCircuitBounds(
                circuit.points,
            ),
        [circuit.points],
    );

    const padding = Math.max(
        bounds.size * 0.16,
        4,
    );

    const gridGeometry = useMemo(() => {
        const positions: number[] =
            [];

        const spacing = Math.max(
            bounds.size / 22,
            1.2,
        );

        const minX =
            bounds.centreX -
            bounds.width / 2 -
            padding;

        const maxX =
            bounds.centreX +
            bounds.width / 2 +
            padding;

        const minZ =
            bounds.centreY -
            bounds.height / 2 -
            padding;

        const maxZ =
            bounds.centreY +
            bounds.height / 2 +
            padding;

        for (
            let x = minX;
            x <= maxX;
            x += spacing
        ) {
            positions.push(
                x,
                -0.24,
                minZ,

                x,
                -0.24,
                maxZ,
            );
        }

        for (
            let z = minZ;
            z <= maxZ;
            z += spacing
        ) {
            positions.push(
                minX,
                -0.24,
                z,

                maxX,
                -0.24,
                z,
            );
        }

        const geometry =
            new THREE.BufferGeometry();

        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(
                positions,
                3,
            ),
        );

        return geometry;
    }, [bounds, padding]);

    return (
        <group>
            <mesh
                position={[
                    bounds.centreX,
                    -0.28,
                    bounds.centreY,
                ]}
                rotation={[
                    -Math.PI / 2,
                    0,
                    0,
                ]}
                receiveShadow
            >
                <planeGeometry
                    args={[
                        bounds.width +
                        padding * 2,
                        bounds.height +
                        padding * 2,
                    ]}
                />

                <meshStandardMaterial
                    color="#08080a"
                    roughness={0.98}
                    metalness={0}
                />
            </mesh>

            <lineSegments
                geometry={gridGeometry}
            >
                <lineBasicMaterial
                    color="#242428"
                    transparent
                    opacity={0.2}
                />
            </lineSegments>
        </group>
    );
}

function AnimatedCircuit({
    circuit,
}: {
    circuit: CircuitMapData;
}): React.ReactElement {
    const groupRef =
        useRef<THREE.Group>(null);

    const startTimeRef =
        useRef<number | null>(null);

    useEffect(() => {
        startTimeRef.current =
            performance.now();

        let animationFrame = 0;

        const animate = (
            currentTime: number,
        ) => {
            const group =
                groupRef.current;

            if (
                startTimeRef.current ===
                null
            ) {
                startTimeRef.current =
                    currentTime;
            }

            const elapsed =
                currentTime -
                startTimeRef.current;

            const duration = 1250;

            const progress =
                Math.min(
                    elapsed / duration,
                    1,
                );

            const eased =
                1 -
                Math.pow(
                    1 - progress,
                    4,
                );

            if (group) {
                const scale =
                    0.16 +
                    eased * 0.84;

                group.scale.set(
                    scale,
                    scale,
                    scale,
                );

                const spin =
                    (1 - eased) *
                    Math.PI *
                    2.2;

                group.rotation.y =
                    spin;

                group.rotation.x =
                    (1 - eased) * 0.18;

                group.position.y =
                    Math.sin(
                        eased * Math.PI,
                    ) * 0.18;
            }

            if (progress < 1) {
                animationFrame =
                    requestAnimationFrame(
                        animate,
                    );
            } else if (group) {
                group.scale.set(
                    1,
                    1,
                    1,
                );

                group.rotation.y = 0;
                group.rotation.x = 0;
                group.position.y = 0;
            }
        };

        animationFrame =
            requestAnimationFrame(
                animate,
            );

        return () => {
            cancelAnimationFrame(
                animationFrame,
            );
        };
    }, [circuit]);

    return (
        <group ref={groupRef}>
            <Runoff
                circuit={circuit}
            />

            <TrackSurface
                circuit={circuit}
            />

            <Kerbs
                circuit={circuit}
            />

            <PinkRacingLine
                circuit={circuit}
            />

            <StartFinishGrid
                circuit={circuit}
            />

            <StartFinishLine
                circuit={circuit}
            />

            <CornerMarkers
                circuit={circuit}
            />

            <TrackEdgeDetail
                circuit={circuit}
            />
        </group>
    );
}

function CircuitScene({
    circuit,
}: {
    circuit: CircuitMapData;
}): React.ReactElement {
    const bounds = useMemo(
        () =>
            getCircuitBounds(
                circuit.points,
            ),
        [circuit.points],
    );

    const cameraDistance =
        Math.max(
            bounds.size * 0.95,
            12,
        );

    return (
        <>
            <ambientLight
                intensity={0.65}
            />

            <hemisphereLight
                intensity={0.75}
                color="#ffffff"
                groundColor="#050507"
            />

            <pointLight
                position={[
                    bounds.centreX,
                    cameraDistance *
                    0.7,
                    bounds.centreY,
                ]}
                intensity={1.8}
                distance={
                    cameraDistance * 2.5
                }
                color={PINK_LIGHT}
            />

            <directionalLight
                position={[
                    bounds.centreX +
                    cameraDistance *
                    0.45,
                    cameraDistance *
                    0.9,
                    bounds.centreY +
                    cameraDistance *
                    0.55,
                ]}
                intensity={2.5}
                castShadow
                shadow-mapSize-width={
                    2048
                }
                shadow-mapSize-height={
                    2048
                }
                shadow-camera-near={0.1}
                shadow-camera-far={
                    cameraDistance * 3
                }
            />

            <directionalLight
                position={[
                    bounds.centreX -
                    cameraDistance *
                    0.5,
                    cameraDistance *
                    0.45,
                    bounds.centreY -
                    cameraDistance *
                    0.35,
                ]}
                intensity={0.85}
            />

            <CircuitBase
                circuit={circuit}
            />

            <AnimatedCircuit
                circuit={circuit}
            />

            <OrbitControls
                target={[
                    bounds.centreX,
                    0,
                    bounds.centreY,
                ]}
                enableRotate
                enableZoom
                enablePan
                enableDamping
                dampingFactor={0.08}
                rotateSpeed={0.5}
                zoomSpeed={0.65}
                panSpeed={0.45}
                minDistance={Math.max(
                    bounds.size * 0.38,
                    5,
                )}
                maxDistance={Math.max(
                    bounds.size * 1.5,
                    28,
                )}
                minPolarAngle={
                    Math.PI / 7
                }
                maxPolarAngle={
                    Math.PI / 2.03
                }
            />
        </>
    );
}

export default function RaceMap3D({
    circuit,
}: RaceMap3DProps): React.ReactElement {
    return (
        <div className="relative h-full overflow-hidden rounded-2xl border border-[#ff729f]/30 bg-[#08080a] shadow-[0_0_35px_rgba(255,114,159,0.08)]">
            <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl border border-white/5" />

            <Canvas
                camera={{
                    position: [
                        0,
                        14,
                        10,
                    ],
                    fov: 38,
                    near: 0.1,
                    far: 500,
                }}
                shadows
                dpr={[1, 2]}
            >
                <CircuitScene
                    circuit={circuit}
                />
            </Canvas>
        </div>
    );
}