from flask import Flask, request, jsonify
from flask_cors import CORS
import threading

from pipelines.skin_tone import analyze_skin
from pipelines.face_shape import analyze_face_shape
from pipelines.body_type import analyze_body

app = Flask(__name__)
CORS(app, origins=['http://localhost:3001'])


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'clarity-ai', 'version': '1.0'})


@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        if 'photo' not in request.files:
            return jsonify({'success': False, 'error': 'Thiếu ảnh (field: photo)'}), 400

        image_bytes = request.files['photo'].read()

        try:
            bust  = float(request.form.get('bust',  0) or 0)
            waist = float(request.form.get('waist', 0) or 0)
            hips  = float(request.form.get('hips',  0) or 0)
        except ValueError:
            bust = waist = hips = 0.0

        results = {}
        errors  = []
        lock    = threading.Lock()

        def run_skin():
            try:
                results['skin'] = analyze_skin(image_bytes)
            except Exception as e:
                with lock:
                    errors.append(str(e))
                results['skin'] = None

        def run_face():
            try:
                results['face'] = analyze_face_shape(image_bytes)
            except Exception as e:
                with lock:
                    errors.append(f'face_shape: {e}')
                results['face'] = None

        threads = [threading.Thread(target=run_skin), threading.Thread(target=run_face)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        # Skin is required — fail the whole request if missing
        if results['skin'] is None:
            msg = next((e for e in errors if 'face_shape' not in e), 'Phân tích da thất bại')
            return jsonify({'success': False, 'error': msg}), 400

        skin = results['skin']
        face = results['face'] or {}

        # Body type — only when all three measurements provided
        body_result = None
        if bust > 0 and waist > 0 and hips > 0:
            try:
                body_result = analyze_body(bust, waist, hips)
            except Exception as e:
                errors.append(f'body_type: {e}')

        skin_conf  = skin.get('confidence', 60)
        face_conf  = 70 if face else None
        parts      = [c for c in [skin_conf, face_conf] if c is not None]
        accuracy   = sum(parts) // len(parts)

        return jsonify({
            'success': True,
            'data': {
                'season':    skin.get('season', 'autumn-warm'),
                'undertone': skin.get('undertone', 'warm'),
                'faceShape': face.get('faceShape') if face else None,
                'bodyType':  body_result.get('bodyType') if body_result else None,
                'accuracy':  accuracy,
                'rawMetrics': {
                    'L':               skin.get('L'),
                    'a':               skin.get('a'),
                    'b':               skin.get('b'),
                    'wh_ratio':        face.get('wh_ratio') if face else None,
                    'jaw_cheek_ratio': face.get('jaw_cheek_ratio') if face else None,
                },
            },
            'warnings': errors if errors else None,
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
