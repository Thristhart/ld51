import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import {
    AmbientLight,
    DoubleSide,
    Mesh,
    MeshPhongMaterial,
    NearestFilter,
    PCFSoftShadowMap,
    PerspectiveCamera,
    PlaneGeometry,
    RepeatWrapping,
    Scene,
    SpotLight,
    sRGBEncoding,
    TextureLoader,
    WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import sundialGlbPath from "~/assets/models/sundial.glb";
import { Canvas } from "~/components/Canvas";
import { TEN_SECONDS } from "~/constants";
import { useGameTime } from "~/Game";
import "./Timer.css";

const hourglassPolygon = [
    [0.0, 0.0],
    [1, 0.0],
    [1, 0.0555],
    [0.95, 0.0555],
    [0.95, 0.28],
    [0.55, 0.46],
    [0.55, 0.54],
    [0.95, 0.72],
    [0.95, 0.9445],
    [1, 0.9445],
    [1, 1],
    [0.0, 1],
    [0.0, 0.9445],
    [0.05, 0.9445],
    [0.05, 0.72],
    [0.45, 0.54],
    [0.45, 0.46],
    [0.05, 0.28],
    [0.05, 0.0555],
    [0.0, 0.0555],
] as const;

const flipDuration = 1000;

const Hourglass = () => {
    const time = useGameTime();
    const hourGlassHeight = 640;
    const hourGlassWidth = 355;

    const left = 640 / 2 - hourGlassWidth / 2;

    let hasClipped = useSignal(false);

    return (
        <Canvas
            width={640}
            height={640}
            tick={(canvas, context) => {
                const period = time.value % TEN_SECONDS;

                let progress = (period - flipDuration) / (TEN_SECONDS - flipDuration);
                let flipProgress = period / flipDuration;
                if (progress < 0) {
                    progress = 1;
                    canvas.style.transform = `rotate(${flipProgress * 180}deg)`;
                } else if (canvas.style.transform) {
                    canvas.style.transform = "none";
                }

                context.clearRect(0, 0, canvas.width, canvas.height);

                context.fillStyle = "#737a8c55";

                context.beginPath();
                context.moveTo(left, 0);
                hourglassPolygon.forEach(([x, y]) => {
                    context.lineTo(left + hourGlassWidth * x, hourGlassHeight * y);
                });
                context.lineTo(left, 0);
                context.fill();
                if (!hasClipped.value) {
                    context.clip();
                    hasClipped.value = true;
                }

                context.fillStyle = "#fc6";
                // top
                context.fillRect(
                    0,
                    (canvas.height * progress) / 2,
                    canvas.width,
                    canvas.height / 2 - (canvas.height * progress) / 2
                );
                // pillar
                context.fillRect(
                    0.45 * hourGlassWidth + left,
                    canvas.height / 2,
                    0.1 * hourGlassWidth,
                    (canvas.height / 2) * (progress * 9)
                );
                // bottom
                context.beginPath();
                context.moveTo(left + hourGlassWidth * 0.45, canvas.height - (canvas.height / 2) * progress);
                context.lineTo(
                    left + hourGlassWidth * 0.05,
                    canvas.height - (canvas.height / 2) * progress + hourGlassHeight * 0.18
                );
                context.lineTo(left + hourGlassWidth * 0.05, canvas.height);
                context.lineTo(left + hourGlassWidth * 0.95, canvas.height);
                context.lineTo(
                    left + hourGlassWidth * 0.95,
                    canvas.height - (canvas.height / 2) * progress + hourGlassHeight * 0.18
                );
                context.lineTo(left + hourGlassWidth * 0.55, canvas.height - (canvas.height / 2) * progress);
                context.closePath();
                context.fill();

                // bases
                context.fillStyle = "#255ff4";
                context.fillRect(left, 0, hourGlassWidth, hourGlassHeight * 0.0555);
                context.fillRect(left, hourGlassHeight * 0.95, hourGlassWidth, hourGlassHeight * 0.0555);
            }}
        />
    );
};

const sundialLightStartAngle = Math.PI * 2 * -0.1;
const sundialLightEndAngle = Math.PI * 1.2;

const sundialLightResetStartAngle = Math.PI * 1.2;
const sundialLightResetEndAngle = Math.PI * 2 * 0.9;

import planeTexturePath from "~/assets/images/table.jpg";

const Sundial = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const threeState = useRef<{
        scene: Scene;
        camera: PerspectiveCamera;
        renderer: WebGLRenderer;
        light: SpotLight;
    }>();

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const scene = new Scene();
        const camera = new PerspectiveCamera(75, canvasRef.current.width / canvasRef.current.height, 0.1, 1000);

        const renderer = new WebGLRenderer({ canvas: canvasRef.current, alpha: true });

        renderer.physicallyCorrectLights = true;
        renderer.outputEncoding = sRGBEncoding;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = PCFSoftShadowMap;

        const light = new SpotLight(0xffffff, 3);
        light.position.set(5, 3, -1);
        light.castShadow = true;
        light.shadow.bias = -0.0001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        scene.add(light);

        const ambient = new AmbientLight(0xffffff, 0.05);
        scene.add(ambient);
        {
            const planeSize = 40;

            const loader = new TextureLoader();
            const texture = loader.load(planeTexturePath);
            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;
            texture.magFilter = NearestFilter;
            const repeats = planeSize / 2;
            texture.repeat.set(repeats, repeats);

            const planeGeo = new PlaneGeometry(planeSize, planeSize);
            const planeMat = new MeshPhongMaterial({
                map: texture,
                side: DoubleSide,
            });
            const mesh = new Mesh(planeGeo, planeMat);
            mesh.receiveShadow = true;
            mesh.rotation.x = Math.PI * -0.5;
            mesh.position.y = 0;
            scene.add(mesh);
        }

        camera.position.z = 0.6;
        camera.position.y = 1.6;
        camera.position.x = 0.1;

        const loader = new GLTFLoader();
        loader.load(
            sundialGlbPath,
            function (gltf) {
                scene.add(gltf.scene);
                gltf.scene.traverse((child) => {
                    if (child instanceof Mesh) {
                        if (child.name === "DialBase" || child.name === "Text") {
                            child.receiveShadow = true;
                        } else {
                            child.castShadow = true;
                        }
                    }
                });
                camera.lookAt(gltf.scene.position);
                light.lookAt(gltf.scene.position);
            },
            undefined,
            function (error) {
                console.error(error);
            }
        );

        threeState.current = { scene, camera, renderer, light };
    }, []);

    const time = useGameTime();

    return (
        <Canvas
            class="timer sundial"
            width={640}
            height={640}
            canvasRef={canvasRef}
            disableContext={true}
            tick={() => {
                const period = time.value % TEN_SECONDS;
                let progress = (period - flipDuration) / (TEN_SECONDS - flipDuration);
                let flipProgress = period / flipDuration;
                if (!threeState.current) {
                    return;
                }
                const { scene, camera, renderer, light } = threeState.current;
                let angle;
                if (progress < 0) {
                    progress = 1;
                    angle =
                        sundialLightResetStartAngle +
                        (sundialLightResetEndAngle - sundialLightResetStartAngle) * flipProgress;
                } else {
                    angle = sundialLightStartAngle + (sundialLightEndAngle - sundialLightStartAngle) * progress;
                }

                light.position.set(Math.cos(angle) * 5, 2.8, Math.sin(angle) * 5);
                renderer.render(scene, camera);
            }}
        />
    );
};

export const Timer = () => {
    return <Sundial />;
};
