type MeshData = {
  _nbVertices: number;
  _nbFaces: number;
  _nbTexCoords: number;

  /////////////////////
  // unique vertex data
  /////////////////////

  _verticesXYZ: Float32Array | null; // vertices
  _normalsXYZ: Float32Array | null; // normals
  _colorsRGB: Float32Array | null; // color vertices
  _materialsPBR: Float32Array | null; // pbr vertex data (roughness/metallic/masking)

  _vertOnEdge: Uint8ClampedArray | null; // (1: on edge, 0 otherwise)
  _vertRingFace: Uint32Array | null; // array of neighborhood id faces
  _vrfStartCount: Uint32Array | null; // reference vertRingFace start and count ring (start/count)
  _vrvStartCount: Uint32Array | null; // array of neighborhood id vertices (start/count)
  _vertRingVert: Uint32Array | null; // reference vertRingVert start and count ring

  _vertTagFlags: Int32Array | null; // general purposes flag (<: Utils.TAG_FLAG)
  _vertSculptFlags: Int32Array | null; // editing flag (tag vertices when starting sculpting session) (<: Utils.SCULPT_FLAG)
  _vertStateFlags: Int32Array | null; // state flag (tag vertices to handle undo/redo) (<: Utils.STATE_FLAG)

  _vertProxy: Float32Array | null; // vertex proxy, for sculpting limits

  ///////////////////
  // unique face data
  ///////////////////

  _facesABCD: Uint32Array | null; // faces tri or quad, tri will have D: Utils.TRI_INDEX

  _faceEdges: Uint32Array | null; // each face references the id edges
  _faceNormalsXYZ: Float32Array | null; // faces normals

  _facesToTriangles: Uint32Array | null; // faces to triangles
  _trianglesABC: Uint32Array | null; // triangles

  _facesTagFlags: Int32Array | null; // triangles tag (<: Utils.TAG_FLAG)

  ////////////
  // edge data
  ////////////
  _edges: Uint8Array | null; // edges (1: outer edge, 0 or 2: inner edge, >:3 non manifold)

  /////////////////
  // wireframe data
  /////////////////

  _drawArraysWireframe: any | null; // array for the wireframe (based on drawArrays vertices)
  _drawElementsWireframe: any | null; // array for the wireframe (based on drawElements vertices)

  //////////
  // UV data
  //////////

  _texCoordsST: Float32Array | null; // tex coords
  _duplicateStartCount: Uint32Array | null; // array of vertex duplicates location (start/count)
  _UVfacesABCD: Uint32Array | null; // faces unwrap
  _UVtrianglesABC: Uint32Array | null; // triangles tex coords

  //////////////////
  // DrawArrays data
  //////////////////

  _DAverticesXYZ: Float32Array | null; // vertices
  _DAnormalsXYZ: Float32Array | null; // normals
  _DAcolorsRGB: Float32Array | null; // color vertices
  _DAmaterialsPBR: Float32Array | null; // material vertices
  _DAtexCoordsST: Float32Array | null; // texCoords

  //////////////
  // Octree data
  //////////////

  _octree: any | null; // root octree cell

  _faceBoxes: Float32Array | null; // faces bbox
  _faceCentersXYZ: Float32Array | null; // faces center

  _facePosInLeaf: Uint32Array | null; // position index in the leaf
  _faceLeaf: any[]; // octree leaf
  _leavesToUpdate: any[]; // leaves of the octree to check

  _worldBound: number[]; // world boundary
};

const createMeshData = (): MeshData => {
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
