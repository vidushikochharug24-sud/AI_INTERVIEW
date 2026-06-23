from dotenv import load_dotenv
import os
load_dotenv()
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import json
from prompts import PROBLEM_PROMPT, FEEDBACK_PROMPT
from judge import run_code

app = Flask(__name__)
CORS(app)
client = Groq()  # reads GROQ_API_KEY from environment

MODEL = "llama-3.3-70b-versatile"


def extract_json_payload(raw_text: str):
    raw_text = raw_text.strip()

    if raw_text.startswith("```"):
        parts = raw_text.split("```", 2)
        if len(parts) >= 2:
            raw_text = parts[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]

    raw_text = raw_text.strip()
    start_index = raw_text.find("{")
    end_index = raw_text.rfind("}")
    if start_index != -1 and end_index != -1 and end_index > start_index:
        raw_text = raw_text[start_index : end_index + 1]

    return json.loads(raw_text)

@app.route("/api/problem", methods=["POST"])
def get_problem():
    data = request.json
    topic = data.get("topic", "arrays")
    difficulty = data.get("difficulty", "medium")
    company = data.get("company", "Google")

    company_focus_map = {
        "Google": "graph, dp, and system-thinking-heavy problems",
        "Amazon": "arrays, strings, OOP, and leadership-principles-aware problems",
        "Microsoft": "trees, graphs, and moderate-difficulty problems",
        "Meta": "arrays, graphs, and dynamic programming problems",
        "Flipkart": "arrays, strings, and practical product-oriented problems",
        "Apple": "clean implementation-heavy problems with strong edge-case handling",
        "Adobe": "design-centric, data-structure-heavy problems with careful implementation",
        "Goldman Sachs": "finance-flavored algorithmic problems with strong optimization focus",
    }

    company_focus = company_focus_map.get(company, "balanced algorithmic interview problems")

    prompt = PROBLEM_PROMPT.format(
        topic=topic,
        difficulty=difficulty,
        company=company,
        company_focus=company_focus,
    )

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
        temperature=0.7
    )

    raw = response.choices[0].message.content.strip()

    try:
        problem = extract_json_payload(raw)
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse problem from AI"}), 500

    return jsonify(problem)


@app.route("/api/run", methods=["POST"])
def run():
    data = request.json
    code = data.get("code", "")
    language = data.get("language", "python")
    test_cases = data.get("test_cases", [])

    results = run_code(code, language, test_cases)
    return jsonify(results)


@app.route("/api/feedback", methods=["POST"])
def get_feedback():
    data = request.json
    problem = data.get("problem", {})
    code = data.get("code", "")
    test_results = data.get("test_results", [])
    transcript = data.get("transcript", "")

    passed = sum(1 for r in test_results if r.get("passed"))
    total = len(test_results)

    prompt = FEEDBACK_PROMPT.format(
        problem_title=problem.get("title", ""),
        problem_description=problem.get("description", ""),
        code=code,
        transcript=transcript,
        passed=passed,
        total=total
    )

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
        temperature=0.5
    )

    raw_feedback = response.choices[0].message.content

    try:
        feedback = extract_json_payload(raw_feedback)
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse feedback from AI"}), 500

    return jsonify({"feedback": feedback})


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json or {}
    problem = data.get("problem", {})
    code = data.get("code", "")
    conversation_history = data.get("conversation_history", [])
    user_message = (data.get("user_message", "") or "").strip()

    problem_title = problem.get("title", "the problem")
    problem_description = problem.get("description", "")

    system_prompt = f"""You are a senior software engineer conducting a technical interview at Google.
The candidate just submitted their solution to: {problem_title}.

Their code:
{code}

Problem description:
{problem_description}

You are now doing the follow-up discussion phase of the interview.
Ask ONE follow-up question at a time. Be conversational but technical.
Start by asking about their approach, then dig into complexity, edge cases, optimizations.
Examples of questions you ask:
- 'Can you walk me through your approach?'
- 'What is the time complexity of your solution?'
- 'What if the input array was sorted, could you do better?'
- 'How would you handle duplicates?'
- 'Could you optimize the space complexity?'
- 'What edge cases did you consider?'
Keep responses concise, 2-3 sentences max. Ask only ONE question per message."""

    messages = [{"role": "system", "content": system_prompt}]

    for entry in conversation_history:
        role = entry.get("role")
        content = entry.get("content", "")

        if role in {"user", "assistant"} and content:
            messages.append({"role": role, "content": content})

    if user_message:
        messages.append({"role": "user", "content": user_message})

    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        max_tokens=300,
        temperature=0.6,
    )

    return jsonify({"response": response.choices[0].message.content.strip()})


if __name__ == "__main__":
    app.run(debug=True, port=5000)

