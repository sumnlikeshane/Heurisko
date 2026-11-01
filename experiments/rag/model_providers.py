"""Answer generation adapters. Every provider returns raw text for strict parsing."""

from __future__ import annotations

import json
import os
import random
import time
import urllib.error
import urllib.request
from typing import Any


OPENROUTER_MODEL = "qwen/qwen3-coder-next"


def _request_json(url: str, payload: dict[str, Any], headers: dict[str, str], timeout: int) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", **headers},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        result = json.loads(response.read().decode("utf-8"))
    if not isinstance(result, dict):
        raise ValueError("provider response must be a JSON object")
    return result


def generate_openrouter(
    messages: list[dict[str, str]], timeout: int, max_tokens: int, api_key: str | None = None,
    attempts: int = 4, sleep=time.sleep, request_json=_request_json,
) -> tuple[str, dict[str, Any]]:
    """Call one pinned OpenRouter model; retry only transient rate/server errors."""
    token = api_key or os.environ.get("OPENROUTER_API_KEY")
    if not token:
        raise ValueError("OPENROUTER_API_KEY is required for the selected Qwen Coder model")
    if attempts < 1 or attempts > 6:
        raise ValueError("attempts must be between 1 and 6")

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": messages,
        "temperature": 0.2,
        "max_tokens": max_tokens,
        "response_format": {"type": "json_object"},
        "stream": False,
    }
    started = time.monotonic()
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            envelope = request_json(
                "https://openrouter.ai/api/v1/chat/completions", payload,
                {"Authorization": f"Bearer {token}", "HTTP-Referer": "https://github.com/sumnlikeshane/Heurisko", "X-Title": "Heurisko"},
                timeout,
            )
            choices = envelope.get("choices")
            if not isinstance(choices, list) or not choices or not isinstance(choices[0], dict):
                raise ValueError("OpenRouter response has no choices[0]")
            message = choices[0].get("message")
            if not isinstance(message, dict) or not isinstance(message.get("content"), str):
                raise ValueError("OpenRouter response has no message.content string")
            usage = envelope.get("usage") if isinstance(envelope.get("usage"), dict) else {}
            choice = choices[0]
            return message["content"], {
                "provider": "openrouter",
                "requested_model": OPENROUTER_MODEL,
                "served_model": envelope.get("model"),
                "response_id": envelope.get("id"),
                "finish_reason": choice.get("finish_reason"),
                "attempts": attempt + 1,
                "latency_ms": round((time.monotonic() - started) * 1000),
                "prompt_tokens": usage.get("prompt_tokens"),
                "completion_tokens": usage.get("completion_tokens"),
                "cost": usage.get("cost"),
            }
        except urllib.error.HTTPError as exc:
            last_error = exc
            if exc.code not in (408, 429, 500, 502, 503, 504) or attempt + 1 == attempts:
                raise RuntimeError(f"OpenRouter request failed with HTTP {exc.code}") from exc
            retry_after = exc.headers.get("Retry-After") if exc.headers else None
            try:
                delay = min(30.0, max(0.0, float(retry_after))) if retry_after else min(16.0, 0.75 * (2 ** attempt))
            except ValueError:
                delay = min(16.0, 0.75 * (2 ** attempt))
            sleep(delay + random.uniform(0, min(0.5, delay / 4 if delay else 0.1)))
        except (urllib.error.URLError, TimeoutError) as exc:
            last_error = exc
            if attempt + 1 == attempts:
                raise RuntimeError(f"OpenRouter request failed: {exc}") from exc
            delay = min(16.0, 0.75 * (2 ** attempt))
            sleep(delay + random.uniform(0, min(0.5, delay / 4)))
    raise RuntimeError(f"OpenRouter request failed: {last_error}")
