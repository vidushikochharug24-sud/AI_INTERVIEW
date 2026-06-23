import subprocess
import tempfile
import os
import json
import sys

PYTHON = sys.executable  # uses the same Python that's running Flask


def run_code(code: str, language: str, test_cases: list) -> dict:
    if language != "python":
        return {"error": "Only Python is supported in v0", "results": []}

    results = []

    for tc in test_cases:
        input_expr = tc.get("input", "")
        expected = tc.get("expected", "")

        # Build a self-contained script that runs the user's code + the test case
        script = f"""
import json
import sys

{code}

try:
    result = {input_expr}
    # normalise to string for comparison
    if isinstance(result, list):
        print(json.dumps(result))
    else:
        print(result)
except Exception as e:
    print("ERROR:", e, file=sys.stderr)
    sys.exit(1)
"""

        try:
            with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
                f.write(script)
                tmp_path = f.name

            proc = subprocess.run(
                [PYTHON, tmp_path],
                capture_output=True,
                text=True,
                timeout=5  # 5 second limit per test case
            )

            os.unlink(tmp_path)

            if proc.returncode != 0:
                results.append({
                    "input": input_expr,
                    "expected": expected,
                    "actual": None,
                    "passed": False,
                    "error": proc.stderr.strip()
                })
                continue

            actual = proc.stdout.strip()

            # Normalise comparison: parse both as JSON if possible
            def normalise(s):
                try:
                    return json.loads(s)
                except Exception:
                    return s.strip()

            passed = normalise(actual) == normalise(expected)

            results.append({
                "input": input_expr,
                "expected": expected,
                "actual": actual,
                "passed": passed,
                "error": None
            })

        except subprocess.TimeoutExpired:
            results.append({
                "input": input_expr,
                "expected": expected,
                "actual": None,
                "passed": False,
                "error": "Time limit exceeded (5s)"
            })
        except Exception as e:
            results.append({
                "input": input_expr,
                "expected": expected,
                "actual": None,
                "passed": False,
                "error": str(e)
            })

    passed_count = sum(1 for r in results if r["passed"])
    return {
        "results": results,
        "passed": passed_count,
        "total": len(results)
    }
