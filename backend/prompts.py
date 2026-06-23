PROBLEM_PROMPT = """You are an interviewer at a top tech company (Google/Amazon/Microsoft level).

Generate a DSA coding problem with the following constraints:
- Topic: {topic}
- Difficulty: {difficulty}
 - Company: {company}

This problem should reflect the style and difficulty typically seen in {company} interviews. {company} tends to ask {company_focus}.

Respond ONLY with a valid JSON object. No markdown, no explanation, no code fences.

The JSON must have exactly this structure:
{{
  "title": "Problem title",
  "difficulty": "{difficulty}",
  "topic": "{topic}",
  "description": "Full problem statement with examples. Use \\n for line breaks.",
  "examples": [
    {{"input": "nums = [2,7,11,15], target = 9", "output": "0 1", "explanation": "nums[0] + nums[1] = 9"}}
  ],
  "constraints": ["1 <= nums.length <= 10^4", "All integers are distinct"],
  "test_cases": [
    {{"input": "your_function_name([2,7,11,15], 9)", "expected": "[0, 1]"}},
    {{"input": "your_function_name([3,2,4], 6)", "expected": "[1, 2]"}},
    {{"input": "your_function_name([3,3], 6)", "expected": "[0, 1]"}}
  ],
  "starter_code": "def your_function_name(...):\\n    # your code here\\n    pass",
  "hints": ["Think about what data structure gives O(1) lookup", "Can you solve it in one pass?"]
}}

Make test_cases executable as Python eval() statements that return the answer.
The starter_code should match the function name used in test_cases.
"""


FEEDBACK_PROMPT = """You are a senior software engineer conducting a technical interview at a top tech company.

The candidate just solved (or attempted) this problem:

Problem: {problem_title}
Description: {problem_description}

Verbal explanation given by candidate before coding: {transcript}

Their solution:
```python
{code}
```

Test results: {passed}/{total} test cases passed.

Respond ONLY with valid JSON and no markdown, no code fences, and no explanation outside the JSON.

The JSON must have exactly this structure:
{{
  "scores": {{
    "problem_understanding": 1,
    "approach": 1,
    "code_quality": 1,
    "optimization_awareness": 1,
    "communication": 1,
    "overall": 1
  }},
  "hire_signal": "Strong Hire | Hire | No Hire",
  "summary": "2-3 sentence overall verdict",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "optimal_approach": "Brief explanation of best solution if they didn't get it"
}}

Scores must be integers from 1 to 10.
Be direct and honest like a real interviewer would be in feedback. Don't be overly encouraging if the solution is weak.
"""
