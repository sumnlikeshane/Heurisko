from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from model_providers import OPENROUTER_MODEL, generate_openrouter


class ModelProviderTests(unittest.TestCase):
    def test_openrouter_pins_model_and_logs_served_model_after_retry(self):
        responses = [
            __import__("urllib.error").error.HTTPError("url", 429, "rate limited", {"Retry-After": "0"}, None),
            {
                "id": "resp-1", "model": OPENROUTER_MODEL,
                "choices": [{"message": {"content": "{}"}, "finish_reason": "stop"}],
                "usage": {"prompt_tokens": 4, "completion_tokens": 2, "cost": 0.001},
            },
        ]
        calls = []
        sleeps = []

        def fake_request(url, payload, headers, timeout):
            calls.append((url, payload, headers, timeout))
            result = responses.pop(0)
            if isinstance(result, Exception):
                raise result
            return result

        raw, metadata = generate_openrouter(
            [{"role": "user", "content": "evidence"}], 5, 20, api_key="test-key",
            sleep=sleeps.append, request_json=fake_request,
        )
        self.assertEqual(raw, "{}")
        self.assertEqual(calls[0][1]["model"], OPENROUTER_MODEL)
        self.assertEqual(calls[0][1]["response_format"], {"type": "json_object"})
        self.assertEqual(calls[0][0], "https://openrouter.ai/api/v1/chat/completions")
        self.assertEqual(metadata["served_model"], OPENROUTER_MODEL)
        self.assertEqual(metadata["attempts"], 2)
        self.assertEqual(metadata["finish_reason"], "stop")
        self.assertEqual(metadata["cost"], 0.001)
        self.assertGreaterEqual(len(sleeps), 1)

    def test_openrouter_sends_api_key_only_as_authorization_header(self):
        captured = {}

        def fake_request(_url, _payload, headers, _timeout):
            captured.update(headers)
            return {"model": "served-model", "choices": [{"message": {"content": "{}"}}]}

        _, metadata = generate_openrouter([], 1, 2, api_key="secret", request_json=fake_request)
        self.assertEqual(captured["Authorization"], "Bearer secret")
        self.assertNotIn("secret", json.dumps(metadata))


if __name__ == "__main__":
    unittest.main()
