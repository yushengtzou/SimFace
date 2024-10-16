import pyvista as pv
import numpy as np
from scipy.interpolate import griddata
from scipy.spatial import KDTree

class FaceModelPathFinder:
    def __init__(self, obj_file):
        self.mesh = pv.read(obj_file)
        self.kdtree = KDTree(self.mesh.points)
        # The shape of the kdtree.data, which is the number of vertices in the mesh
        print(f"The shape of the kdtree.data is {self.kdtree.data.shape}")
        self.ensure_texture_coordinates()




    def ensure_texture_coordinates(self):
        # Check for existing texture coordinates
        tcoords = self.mesh.active_texture_coordinates
        if tcoords is None:
            # If no texture coordinates, create simple ones based on normalized position
            pts = self.mesh.points
            min_pt = pts.min(axis=0)
            max_pt = pts.max(axis=0)
            tcoords = (pts - min_pt) / (max_pt - min_pt)[:, :2]
            self.mesh.active_texture_coordinates = tcoords
        else:
            # Ensure we're using the first two dimensions of texture coordinates
            tcoords = tcoords[:, :2]
        
        self.uv_coords = tcoords

    def find_path_on_surface(self, start_point, end_point, num_points=100):
        start_uv = self.find_closest_uv(start_point)
        print(f"The uv coordinates of the start point are {start_uv}")

        end_uv = self.find_closest_uv(end_point)
        print(f"The uv coordinates of the end point are {end_uv}")
        
        uv_path = self.find_path_in_uv_space(start_uv, end_uv, num_points)
        print(f"The uv path is {uv_path}")

        world_path = self.map_uv_path_to_3d(uv_path)
        print(f"The world path is {world_path}")
        return world_path

    def find_closest_uv(self, point):
        _, idx = self.kdtree.query(point)
        print(f"The index of the closest point is {idx}")
        return self.uv_coords[idx]

    def find_path_in_uv_space(self, start_uv, end_uv, num_points):
        t = np.linspace(0, 1, num_points)
        u = start_uv[0] * (1 - t) + end_uv[0] * t
        v = start_uv[1] * (1 - t) + end_uv[1] * t
        return np.column_stack((u, v))

    def map_uv_path_to_3d(self, uv_path):
        points = self.mesh.points

        # Use griddata for interpolation
        x = griddata(self.uv_coords, points[:, 0], uv_path, method='linear')
        y = griddata(self.uv_coords, points[:, 1], uv_path, method='linear')
        z = griddata(self.uv_coords, points[:, 2], uv_path, method='linear')

        return np.column_stack((x, y, z))

    def visualize_path(self, path):
        path_poly = pv.PolyData(path)
        path_poly.line_width = 5

        # Create a plotter
        plotter = pv.Plotter()
        plotter.add_mesh(self.mesh, style='surface', show_edges=True)
        plotter.add_mesh(path_poly, color='red', line_width=5)
        plotter.show()

def main():
    # Usage
    obj_file = '../model/lulu/rescale/texturedMesh.obj'
    path_finder = FaceModelPathFinder(obj_file)

    # Get the bounding box of the mesh to set reasonable start and end points
    # bounds = path_finder.mesh.bounds
    # start_point = np.array([-2.146093102625807, 1.096874174179853, 9.227897987371335])  
    # end_point = np.array([-2.893076521308409, -3.4406651165703837, 9.56207081069941])  

    start_point = np.array([0.6568994317977611, 6.968123561686358, 8.488197852835462]) 
    end_point = np.array([0.5329679275872276, -6.963830366832992, 10.420056002928895])

    path = path_finder.find_path_on_surface(start_point, end_point)
    path_finder.visualize_path(path)

# Run the main function
if __name__ == "__main__":
    main()
