import React, { useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import * as THREE from 'three';

const Model = ({ modelPaths, onLoad }: { 
    modelPaths: { mtl: string; obj: string }; 
    onLoad: () => void }) => {
        const mtl = useLoader(MTLLoader, modelPaths.mtl);
        const obj = useLoader(OBJLoader, modelPaths.obj, (loader: any) => {
            (loader as OBJLoader).setMaterials(mtl);
        });
      
        useEffect(() => {
            if (obj) {
                onLoad();
                obj.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        console.log('Mesh:', child);
                        console.log('Geometry:', child.geometry);
                        console.log('Material:', child.material);
                    }
                });
            }
        }, [obj, onLoad]);
      
        return <primitive object={obj} scale={[6, 6, 6]} position={[0, 5, 12]} />;
    };

export default Model;

