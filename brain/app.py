from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

def flowbrain(input_text):
    
    return f"Processed in Python: {input_text}"

@app.route('/flowbrain', methods=['POST'])
def handle_flowbrain():
    input_data = request.json.get('inputText', '')
    result = flowbrain(input_data)
    return jsonify({'outputText': result})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
