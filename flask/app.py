import os
import pickle
import string
import re
import openai
from openai import OpenAI
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
import nltk
import PyPDF2
import docx
import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['UPLOAD_FOLDER'] = './uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'docx'}
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat_history.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Ensure the uploads folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Download popular NLTK packages if not already downloaded
nltk.download('popular', quiet=True)

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# GPT-3.5 API Key
api_key = "API_KEY"  # Replace with your API key
client = OpenAI(api_key=api_key)

# Path to the pickle file and data.txt file
pickle_file_path = './static/processed_data.pkl'
data_txt_path = './static/data.txt'

# Load or create the pickle file containing the processed tokens and text data
def load_pickle_data():
    global sentence_tokens, word_tokens, cleaned_data
    if not os.path.exists(pickle_file_path):
        sentence_tokens, word_tokens, cleaned_data = [], [], ''
        with open(pickle_file_path, 'wb') as f:
            pickle.dump((sentence_tokens, word_tokens, cleaned_data), f)
    else:
        with open(pickle_file_path, 'rb') as f:
            sentence_tokens, word_tokens, cleaned_data = pickle.load(f)

load_pickle_data()

# Lemmatizer and normalization functions
lemmatizer = nltk.stem.WordNetLemmatizer()

def lemmatize_tokens(tokens):
    return [lemmatizer.lemmatize(token) for token in tokens]

punctuation_removal = dict((ord(punct), None) for punct in string.punctuation)

def normalize_text(text):
    return lemmatize_tokens(nltk.word_tokenize(text.lower().translate(punctuation_removal)))

# Extract Text Functions
def extract_text_from_pdf(pdf_file):
    with open(pdf_file, 'rb') as f:
        pdf_reader = PyPDF2.PdfReader(f)
        text = ''
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text

def extract_text_from_docx(docx_file):
    doc = docx.Document(docx_file)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)

def extract_text_from_file(file_path):
    if file_path.endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file_path.endswith('.docx') or file_path.endswith('.doc'):
        return extract_text_from_docx(file_path)
    else:
        return None

# Preprocess Functions
def preprocess(text):
    formatted_text = text.lower()
    formatted_text = re.sub(r'\s', ' ', formatted_text)
    return formatted_text

def split_string(text, max_length=300):
    if len(text) > max_length:
        last_full_stop_index = text.rfind('.', 0, max_length)
        if last_full_stop_index == -1:
            return [text[i:i+max_length] for i in range(0, len(text), max_length)]
        else:
            return [text[:last_full_stop_index+1]] + split_string(text[last_full_stop_index+1:], max_length)
    else:
        return [text]

# GPT-3.5 Enhancement Function
def enhance_text_with_gpt(text):
    cleaned_data = ""
    result = split_string(preprocess(text))
    for res in result:
        prompt = (
            "I have text data, I want it to be consistent, clean, and in a flow. Below is the data:"
            f"{res}"
            "Please follow the below instructions:"
            "Don't add anything in the data."
            "Also don't give instructions how you are cleaning this."
            "Please give me only clean and consistent data as response. Thank You"
        )
        response = client.completions.create(
            model="gpt-3.5-turbo-instruct",
            prompt=prompt,
            max_tokens=1500
        )
        cleaned_response = response.choices[0].text.strip()
        cleaned_data = cleaned_data + "\n" + cleaned_response

    return cleaned_data

# Update the Pickle File
def update_pickle_data(new_text):
    global sentence_tokens, word_tokens, cleaned_data
    # Load existing data
    with open(pickle_file_path, 'rb') as f:
        sentence_tokens, word_tokens, cleaned_data = pickle.load(f)

    # Process the new text
    new_text = enhance_text_with_gpt(new_text)
    cleaned_data += "\n" + new_text
    sentence_tokens += nltk.sent_tokenize(cleaned_data.lower())
    word_tokens += nltk.word_tokenize(cleaned_data.lower())

    # Save the updated data
    with open(pickle_file_path, 'wb') as f:
        pickle.dump((sentence_tokens, word_tokens, cleaned_data), f)

    # Reload data into memory
    load_pickle_data()

# Update Knowledge
def update_knowledge(new_text):
    # Append new text to data.txt
    with open(data_txt_path, 'a') as file:
        file.write(new_text + "\n")

    # Update the .pkl file with new processed data
    update_pickle_data(new_text)

# Process New Data Function
def process_new_data(file_path):
    text = extract_text_from_file(file_path)
    if text:
        update_knowledge(preprocess(text))

# Allowed File Extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# File Upload Route for Multiple Files
@app.route('/api/upload', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part'}), 400
    files = request.files.getlist('files')
    if len(files) == 0 or all(file.filename == '' for file in files):
        return jsonify({'error': 'No selected files'}), 400

    success_count = 0
    error_count = 0
    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            try:
                process_new_data(file_path)
                success_count += 1
            except Exception as e:
                print(f"Error processing {file.filename}: {e}")
                error_count += 1
        else:
            error_count += 1

    return jsonify({
        'message': f'{success_count} files uploaded and processed successfully, {error_count} files failed.'
    }), 200 if success_count > 0 else 400


# Define Chat and Message models
class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id', ondelete='CASCADE'), nullable=False)
    role = db.Column(db.String(10), nullable=False)  # 'user' or 'bot'
    content = db.Column(db.Text, nullable=False)
    chat = db.relationship('Chat', backref=db.backref('messages', cascade='all, delete-orphan'))

# Create the database tables
with app.app_context():
    db.create_all()

# Greeting detection and response functions
greeting_keywords = ("hello", "hi", "hey")
greeting_responses = ["Hi, how can I help?", "Hey! how can I help?", "Hello.. how can I help?"]

def generate_greeting(sentence):
    words = sentence.split()
    for word in words:
        if word.lower() in greeting_keywords:
            return random.choice(greeting_responses)

# Generate response function using loaded tokens
def generate_response(user_input):
    bot_response = ''
    sentence_tokens.append(user_input)
    tfidf_vectorizer = TfidfVectorizer(tokenizer=normalize_text, stop_words='english')
    tfidf_matrix = tfidf_vectorizer.fit_transform(sentence_tokens)
    similarity_values = cosine_similarity(tfidf_matrix[-1], tfidf_matrix)
    sorted_idx = similarity_values.argsort()[0][-2]
    flattened_values = similarity_values.flatten()
    flattened_values.sort()
    highest_similarity = flattened_values[-2]
    if highest_similarity == 0:
        bot_response = "I am sorry! I don't understand you"
    else:
        bot_response = sentence_tokens[sorted_idx]
    sentence_tokens.remove(user_input)
    return bot_response

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    data = request.json
    user_input = data.get('message', '').lower()
    chat_id = data.get('chat_id')
    if not chat_id:
        return jsonify({"error": "Chat ID is required"}), 400

    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404

    if user_input:
        if user_input in ('thanks', 'thank you'):
            bot_response = "You are welcome."
        elif generate_greeting(user_input):
            bot_response = generate_greeting(user_input)
        else:
            bot_response = generate_response(user_input)

        # Save user's message and bot's response to the database
        user_message = Message(chat_id=chat_id, role='user', content=user_input)
        bot_message = Message(chat_id=chat_id, role='bot', content=bot_response)
        db.session.add(user_message)
        db.session.add(bot_message)
        db.session.commit()

        return jsonify({"response": bot_response})
    else:
        return jsonify({"response": "I am sorry! I don't understand you"}), 400

@app.route('/api/new_chat', methods=['POST'])
def new_chat():
    data = request.json
    title = data.get('title', 'New Chat')
    new_chat = Chat(title=title)
    db.session.add(new_chat)
    db.session.commit()
    return jsonify({"chat_id": new_chat.id, "title": new_chat.title})

@app.route('/api/get_chats', methods=['GET'])
def get_chats():
    chats = Chat.query.all()
    result = [{"id": chat.id, "title": chat.title} for chat in chats]
    return jsonify(result)

@app.route('/api/get_chat_history/<int:chat_id>', methods=['GET'])
def get_chat_history(chat_id):
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404
    messages = [{"role": msg.role, "content": msg.content} for msg in chat.messages]
    return jsonify({"title": chat.title, "messages": messages})

@app.route('/api/delete_chat/<int:chat_id>', methods=['DELETE'])
def delete_chat(chat_id):
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404
    db.session.delete(chat)
    db.session.commit()
    return jsonify({"message": "Chat deleted successfully"})

# Serve static files from the static folder
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    nltk.data.path.append(os.path.expanduser('~/nltk_data'))
    app.run(host='0.0.0.0', port=5000, debug=True)
