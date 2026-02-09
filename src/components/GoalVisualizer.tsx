import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { XR, createXRStore, useXREvent } from "@react-three/xr";
import { Box } from "@react-three/drei";
import * as THREE from "three";

// 1. Create the XR Store (controls the session)
const store = createXRStore({
    // Automatically request hit-test features
    features: ["hit-test"],
});

// 2. The Reticle Component
function Reticle({ onPlace }: { onPlace: (position: THREE.Vector3) => void }) {
    const ref = useRef<THREE.Mesh>(null);

    // In v6, we don't need a dedicated 'useHitTest' hook for the reticle visualization
    // if we just want to tap to place. However, to visualize the cursor:

    // Note: v6 handles hit testing slightly differently.
    // We use the store's internal state or a frame loop.
    // For simplicity here, we rely on the click event which carries the hit data in v6.

    return (
        <mesh ref={ref} rotation-x={-Math.PI / 2} visible={false}>
            {/* In v6, standard meshes can't always "follow" the floor automatically 
         without a frame loop. 
         However, the 'onClick' event on the XR wrapper below handles the placement.
         We can omit the visual reticle for a simpler v6 implementation, 
         or use a dedicated frame loop to update 'ref.current.position'.
      */}
            <ringGeometry args={[0.1, 0.25, 32]} />
            <meshStandardMaterial color='white' />
        </mesh>
    );
}

function ARScene() {
    // Store POSITIONS, not JSX elements (Best Practice)
    const [cubePositions, setCubePositions] = useState<THREE.Vector3[]>([]);

    const handleSessionHit = (e: any) => {
        // e.nativeEvent.inputSource is available here
        // But typically in v6 we use standard pointer events or useXREvent
    };

    return (
        <>
            {/* Native Button to Enter AR */}
            <button
                style={{
                    position: "absolute",
                    zIndex: 10,
                    padding: "12px 24px",
                }}
                onClick={() => store.enterAR()}
            >
                Enter AR
            </button>

            <Canvas>
                <XR store={store}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />

                    {/* In v6, 'onClick' on the <XR> component catches taps on the real world 
            if 'hit-test' is enabled! 
          */}
                    <mesh
                        onClick={(e) => {
                            // e.point is the 3D coordinate of the hit on the real world surface
                            setCubePositions([...cubePositions, e.point]);
                        }}
                        // Invisible plane to catch clicks if needed,
                        // or rely on v6's native hit test event handling.
                        visible={false}
                    >
                        <planeGeometry args={[100, 100]} />
                    </mesh>

                    {/* Render Cubes */}
                    {cubePositions.map((pos, index) => (
                        <Box key={index} args={[0.1, 0.1, 0.1]} position={pos}>
                            <meshStandardMaterial color='hotpink' />
                        </Box>
                    ))}
                </XR>
            </Canvas>
        </>
    );
}

// 2. The Main Component
export default function GoalVisualizer() {
    return <ARScene />;
}
