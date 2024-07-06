import cv2
import dlib
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("/dlib_model/shape_predictor_68_face_landmarks.dat")

@app.route('/detect_keypoints', methods=['POST'])
def detect_keypoints():
    data = request.get_json()
    img_data = data['image']
    img = cv2.imdecode(np.frombuffer(base64.b64decode(img_data.split(',')[1]), np.uint8), -1)
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = detector(gray)
    keypoints = []
    
    for face in faces:
        shape = predictor(gray, face)
        for i in range(68):
            keypoints.append((shape.part(i).x, shape.part(i).y))
    
    return jsonify({'keypoints': keypoints})

if __name__ == '__main__':
    app.run()

