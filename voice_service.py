import speech_recognition as sr
from flask import Flask, jsonify
from flask_cors import CORS
import sys

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize recognizer
recognizer = sr.Recognizer()

@app.route('/listen', methods=['GET'])
def listen():
    """
    Listens to the microphone and returns the transcribed text.
    """
    try:
        with sr.Microphone() as source:
            print("Listening...")
            # Adjust for ambient noise
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            # Listen for the audio
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
            
            print("Transcribing...")
            # Use Google Speech Recognition (free tier)
            # language='es-ES' for Spanish
            text = recognizer.recognize_google(audio, language='es-ES')
            
            print(f"Recognized: {text}")
            return jsonify({
                "status": "success",
                "text": text
            })
            
    except sr.WaitTimeoutError:
        return jsonify({
            "status": "error",
            "message": "No se detectó sonido. Intenta de nuevo."
        }), 408
    except sr.UnknownValueError:
        return jsonify({
            "status": "error",
            "message": "No pude entender lo que dijiste."
        }), 422
    except sr.RequestError as e:
        return jsonify({
            "status": "error",
            "message": f"Error en el servicio de reconocimiento: {e}"
        }), 503
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/status', methods=['GET'])
def status():
    return jsonify({"status": "running"}), 200

if __name__ == "__main__":
    # Run on port 5000 by default
    print("Voice Service starting on http://localhost:5000")
    app.run(port=5000, debug=False)
