from flask import Flask, request, jsonify
import threading

from pipelines.skin_tone import analyze_skin_tone
from pipelines.face_shape import analyze_face_shape
from pipelines.body_type import analyze_body_type

app = Flask(__name__)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image provided'}), 400

        image_file = request.files['image']
        image_bytes = image_file.read()
        measurements = request.form.get('measurements')

        results = {}
        errors = []

        def run_skin(out):
            try:
                out['skin'] = analyze_skin_tone(image_bytes)
            except Exception as e:
                errors.append(str(e))
                out['skin'] = {'season': 'unknown', 'undertone': 'neutral', 'accuracy': 0}

        def run_face(out):
            try:
                out['face'] = analyze_face_shape(image_bytes)
            except Exception as e:
                errors.append(str(e))
                out['face'] = {'faceShape': 'oval'}

        def run_body(out):
            try:
                out['body'] = analyze_body_type(measurements)
            except Exception as e:
                errors.append(str(e))
                out['body'] = {'bodyType': 'rectangle'}

        threads = [
            threading.Thread(target=run_skin, args=(results,)),
            threading.Thread(target=run_face, args=(results,)),
            threading.Thread(target=run_body, args=(results,)),
        ]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        accuracy = results['skin'].get('accuracy', 0)
        return jsonify({
            'success': True,
            'data': {
                'season': results['skin'].get('season', 'autumn-warm'),
                'undertone': results['skin'].get('undertone', 'warm'),
                'faceShape': results['face'].get('faceShape', 'oval'),
                'bodyType': results['body'].get('bodyType', 'hourglass'),
                'accuracy': accuracy,
            },
            'warnings': errors if errors else None,
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
