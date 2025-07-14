from flask import Flask, request, send_file, jsonify
from yt_dlp import YoutubeDL
import os

app = Flask(__name__)

@app.route('/title', methods=['POST'])
def get_title():
    url = request.form['url']
    try:
        with YoutubeDL({'quiet': True}) as ydl:
            info = ydl.extract_info(url, download=False)
            return jsonify({"title": info.get("title", "Unknown")})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/download', methods=['POST'])
def download_video():
    url = request.form['url']
    try:
        ydl_opts = {
            'format': 'best',
            'outtmpl': 'video.%(ext)s',
            'quiet': True,
        }
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            return send_file(filename, as_attachment=True)
    except Exception as e:
        return str(e), 500

@app.route('/')
def home():
    return \"MyDownloader Backend is Running!\"

if __name__ == '__main__':
    app.run()