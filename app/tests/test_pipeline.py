# test_pipeline.py

from typing import Dict, Any, List
import time
import random

# 🔹 Import pipeline
from app.core.evaluation_pipeline import (
    evaluate_candidate,
    evaluate_batch,
    debug_pipeline,
    evaluate_minimal
)


# =========================================================
# 🔹 SAMPLE TEST DATA
# =========================================================

def get_sample_candidate() -> Dict[str, Any]:
    return {
        "teacher_id": "T100",
        "name": "Test Candidate",
        "communication": {"score": 8},
        "tech": {"score": 7},
        "experience_years": 2,
        "location": "same",
        "skills": ["python", "ml", "data analysis"],
        "required_skills": ["python", "ml", "dl"],
        "feedback": {"rating": 9},
        "achievements": 1
    }


def generate_random_candidate(index: int) -> Dict[str, Any]:
    return {
        "teacher_id": f"T{index}",
        "name": f"Candidate {index}",
        "communication": {"score": random.randint(1, 10)},
        "tech": {"score": random.randint(1, 10)},
        "experience_years": round(random.uniform(0, 5), 1),
        "location": random.choice(["same", "nearby", "remote"]),
        "skills": random.sample(["python", "ml", "dl", "react", "node", "sql"], 3),
        "required_skills": ["python", "ml", "dl"],
        "feedback": {"rating": random.randint(1, 10)},
        "achievements": random.randint(0, 2)
    }


# =========================================================
# 🔹 SINGLE TEST
# =========================================================

def test_single_candidate():
    print("\n🔹 Running Single Candidate Test")

    data = get_sample_candidate()
    result = evaluate_candidate(data)

    print("Result:", result)

    assert "final_score" in result
    assert "status" in result
    assert result["final_score"] >= 0
    assert result["final_score"] <= 100

    print("✅ Single test passed")


# =========================================================
# 🔹 MINIMAL TEST
# =========================================================

def test_minimal():
    print("\n🔹 Running Minimal Test")

    data = get_sample_candidate()
    result = evaluate_minimal(data)

    print("Minimal Result:", result)

    assert "score" in result
    assert "status" in result

    print("✅ Minimal test passed")


# =========================================================
# 🔹 DEBUG TEST
# =========================================================

def test_debug():
    print("\n🔹 Running Debug Test")

    data = get_sample_candidate()
    result = debug_pipeline(data)

    print("Debug Output:", result)

    assert "mapped" in result
    assert "normalized" in result
    assert "decision" in result

    print("✅ Debug test passed")


# =========================================================
# 🔹 BATCH TEST
# =========================================================

def test_batch():
    print("\n🔹 Running Batch Test")

    data_list = [generate_random_candidate(i) for i in range(10)]
    results = evaluate_batch(data_list)

    print("Batch Results:", results)

    assert len(results) == 10

    for res in results:
        assert "status" in res or "error" in res

    print("✅ Batch test passed")


# =========================================================
# 🔹 EDGE CASE TESTS
# =========================================================

def test_edge_cases():
    print("\n🔹 Running Edge Case Tests")

    # Missing fields
    data1 = {"name": "Incomplete"}
    result1 = evaluate_candidate(data1)
    print("Missing fields result:", result1)

    # Zero values
    data2 = {
        "teacher_id": "T0",
        "name": "Zero Case",
        "communication": {"score": 0},
        "tech": {"score": 0},
        "experience_years": 0
    }
    result2 = evaluate_candidate(data2)
    print("Zero case result:", result2)

    # High values
    data3 = {
        "teacher_id": "T999",
        "name": "High Case",
        "communication": {"score": 10},
        "tech": {"score": 10},
        "experience_years": 10
    }
    result3 = evaluate_candidate(data3)
    print("High case result:", result3)

    print("✅ Edge case tests completed")


# =========================================================
# 🔹 PERFORMANCE TEST
# =========================================================

def test_performance():
    print("\n🔹 Running Performance Test")

    data_list = [generate_random_candidate(i) for i in range(100)]

    start = time.time()
    results = evaluate_batch(data_list)
    end = time.time()

    duration = end - start

    print(f"Processed 100 candidates in {duration:.4f} seconds")

    assert len(results) == 100

    print("✅ Performance test passed")


# =========================================================
# 🔹 RANDOMIZED STRESS TEST
# =========================================================

def test_stress():
    print("\n🔹 Running Stress Test")

    data_list = [generate_random_candidate(i) for i in range(200)]

    results = evaluate_batch(data_list)

    valid_count = sum(1 for r in results if "status" in r)

    print(f"Valid results: {valid_count}/200")

    assert valid_count > 0

    print("✅ Stress test passed")


# =========================================================
# 🔹 VALIDATION TEST
# =========================================================

def test_output_structure():
    print("\n🔹 Running Output Structure Test")

    data = get_sample_candidate()
    result = evaluate_candidate(data)

    required_keys = [
        "final_score",
        "status",
        "score_breakdown",
        "insights"
    ]

    for key in required_keys:
        assert key in result

    print("✅ Output structure test passed")


# =========================================================
# 🔹 RUN ALL TESTS
# =========================================================

def run_all_tests():
    print("\n🚀 Starting Full Test Suite")

    test_single_candidate()
    test_minimal()
    test_debug()
    test_batch()
    test_edge_cases()
    test_performance()
    test_stress()
    test_output_structure()

    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY")


# =========================================================
# 🔹 MAIN ENTRY
# =========================================================

if __name__ == "__main__":
    run_all_tests()