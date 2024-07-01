const createMeshData = () => {
    return {
        _nbVertices: 0,
        _nbFaces: 0,
        _nbTexCoords: 0,
        /////////////////////
        // unique vertex data
        /////////////////////
        _verticesXYZ: null,
        _normalsXYZ: null,
        _colorsRGB: null,
        _materialsPBR: null,
        _vertOnEdge: null,
        _vertRingFace: null,
        _vrfStartCount: null,
        _vrvStartCount: null,
        _vertRingVert: null,
        _vertTagFlags: null,
        _vertSculptFlags: null,
        _vertStateFlags: null,
        _vertProxy: null,
        ///////////////////
        // unique face data
        ///////////////////
        _facesABCD: null,
        _faceEdges: null,
        _faceNormalsXYZ: null,
        _facesToTriangles: null,
        _trianglesABC: null,
        _facesTagFlags: null,
        ////////////
        // edge data
        ////////////
        _edges: null,
        /////////////////
        // wireframe data
        /////////////////
        _drawArraysWireframe: null,
        _drawElementsWireframe: null,
        //////////
        // UV data
        //////////
        _texCoordsST: null,
        _duplicateStartCount: null,
        _UVfacesABCD: null,
        _UVtrianglesABC: null,
        //////////////////
        // DrawArrays data
        //////////////////
        _DAverticesXYZ: null,
        _DAnormalsXYZ: null,
        _DAcolorsRGB: null,
        _DAmaterialsPBR: null,
        _DAtexCoordsST: null,
        //////////////
        // Octree data
        //////////////
        _octree: null,
        _faceBoxes: null,
        _faceCentersXYZ: null,
        _facePosInLeaf: null,
        _faceLeaf: [],
        _leavesToUpdate: [],
        _worldBound: [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity],
    };
};
export default createMeshData;
