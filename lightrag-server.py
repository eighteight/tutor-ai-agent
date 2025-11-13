#!/usr/bin/env python3
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import re

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

@app.route('/knowledge-graph', methods=['GET'])
def get_knowledge_graph():
    """Extract knowledge graph structure with nodes and relationships"""
    nodes = []
    edges = []
    
    # Create nodes for each topic/course
    for i, (topic, content) in enumerate(knowledge_base.items()):
        nodes.append({
            "id": i,
            "label": topic.title(),
            "type": "course" if "Course:" in content else "topic",
            "content": content[:100] + "..." if len(content) > 100 else content
        })
    
    # Create edges based on content relationships
    topics = list(knowledge_base.keys())
    for i, topic1 in enumerate(topics):
        content1 = knowledge_base[topic1].lower()
        for j, topic2 in enumerate(topics):
            if i != j and topic2 in content1:
                edges.append({
                    "from": i,
                    "to": j,
                    "label": "references"
                })
    
    return jsonify({
        "nodes": nodes,
        "edges": edges,
        "stats": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "topics": len([n for n in nodes if n["type"] == "topic"]),
            "courses": len([n for n in nodes if n["type"] == "course"])
        }
    })

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=False)