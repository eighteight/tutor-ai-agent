#!/usr/bin/env python3
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Dynamic knowledge base
knowledge_base = {
    "variables": "JavaScript has let (block-scoped, reassignable), const (block-scoped, not reassignable), and var (function-scoped). let and const are preferred in modern JavaScript.",
    "functions": "Functions can be declared as function declarations or arrow functions. Arrow functions have lexical this binding.",
    "arrays": "Arrays store ordered collections of items. Use methods like push(), pop(), map(), filter().",
    "objects": "Objects store key-value pairs. Access properties with dot notation or bracket notation.",
    "python": "Python variables are created with assignment. Lists use [], dictionaries use {}. Functions defined with def keyword.",
    "loops": "JavaScript has for, while, do-while loops. Use for...of for arrays, for...in for objects. Python has for and while loops.",
    "classes": "JavaScript classes use class keyword. Python classes also use class keyword. Both support inheritance.",
    "async": "JavaScript async/await for promises. Python asyncio for asynchronous programming."
}

def extract_course_name(content):
    """Extract course name from structured content"""
    lines = content.split('\n')
    for line in lines:
        if line.startswith('Course:'):
            return line.replace('Course:', '').strip().lower()
    return None

@app.route('/query', methods=['POST'])
def query():
    data = request.json
    question = data.get('question', '').lower()
    
    # Simple keyword matching for demo
    relevant_content = ""
    for topic, content in knowledge_base.items():
        if topic in question:
            relevant_content = content
            break
    
    if not relevant_content:
        relevant_content = "General JavaScript programming concepts and best practices."
    
    original_data = data.get('originalData', {})
    return jsonify({
        "courseContent": relevant_content,
        "topic": original_data.get('topic', ''),
        "question": original_data.get('question', ''),
        "answer": original_data.get('answer', '')
    })

@app.route('/insert', methods=['POST'])
def insert():
    data = request.json
    content = data.get('content', '')
    
    # Extract course name and add to knowledge base
    course_name = extract_course_name(content)
    if course_name:
        knowledge_base[course_name] = content
    
    return jsonify({"status": "inserted", "course": course_name})

@app.route('/courses', methods=['GET'])
def get_courses():
    # Extract unique courses from knowledge base
    courses = list(knowledge_base.keys())
    return jsonify({"courses": courses})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=False)