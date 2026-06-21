#!/usr/bin/env python3
"""
Merge BMad skill customize.toml with optional team/user overrides under _bmad/custom/.

Usage:
  python3 resolve_customization.py --skill /path/to/.agents/skills/bmad-prd --key workflow
  python3 resolve_customization.py --skill /path/to/bmad-agent-dev --key agent
  python3 resolve_customization.py --skill /path/to/bmad-sprint-status --key workflow.on_complete

Stdout: JSON (pretty-printed) of the resolved section or scalar. Exit 0 if base exists, else 1.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    import tomllib
except ImportError:  # pragma: no cover
    print("Python 3.11+ required (tomllib).", file=sys.stderr)
    sys.exit(1)

APPEND_ARRAY_KEYS = frozenset(
    {
        "persistent_facts",
        "activation_steps_prepend",
        "activation_steps_append",
        "principles",
    }
)


def load_toml(path: Path) -> dict:
    if not path.is_file():
        return {}
    with path.open("rb") as f:
        return tomllib.load(f)


def is_array_of_tables_with_code(items: list) -> bool:
    if not items or not isinstance(items, list):
        return False
    return all(isinstance(x, dict) and "code" in x for x in items)


def merge_menu_items(base: list, override: list) -> list:
    by_code: dict[str, dict] = {}
    order: list[str] = []
    for item in base:
        if isinstance(item, dict) and "code" in item:
            c = str(item["code"])
            by_code[c] = dict(item)
            order.append(c)
    for item in override:
        if isinstance(item, dict) and "code" in item:
            c = str(item["code"])
            if c not in by_code:
                order.append(c)
            by_code[c] = {**by_code.get(c, {}), **item}
    return [by_code[c] for c in order if c in by_code]


def merge_section(base: dict, team: dict, user: dict) -> dict:
    keys = set(base) | set(team) | set(user)
    out: dict = {}
    for key in sorted(keys):
        b, t, u = base.get(key), team.get(key), user.get(key)
        if key in APPEND_ARRAY_KEYS:
            merged: list = []
            for part in (b, t, u):
                if isinstance(part, list):
                    merged.extend(part)
            out[key] = merged
            continue
        if isinstance(b, list) and b and is_array_of_tables_with_code(b):
            tb = b if isinstance(b, list) else []
            tt = t if isinstance(t, list) else []
            tu = u if isinstance(u, list) else []
            m = merge_menu_items(tb, tt)
            m = merge_menu_items(m, tu)
            out[key] = m
            continue
        if u is not None:
            out[key] = u
        elif t is not None:
            out[key] = t
        elif b is not None:
            out[key] = b
    return out


def get_nested(data: dict, dotted: str):
    cur: object = data
    for part in dotted.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--skill",
        required=True,
        type=Path,
        help="Path to skill install directory (contains customize.toml)",
    )
    ap.add_argument(
        "--key",
        required=True,
        help="workflow | agent | workflow.on_complete | …",
    )
    args = ap.parse_args()

    skill_root = args.skill.resolve()
    skill_name = skill_root.name
    base_path = skill_root / "customize.toml"
    project_root = skill_root.parent.parent.parent
    if not (project_root / "_bmad").is_dir():
        project_root = skill_root
        while project_root != project_root.parent:
            if (project_root / "_bmad").is_dir():
                break
            project_root = project_root.parent
    custom_dir = project_root / "_bmad" / "custom"
    team_path = custom_dir / f"{skill_name}.toml"
    user_path = custom_dir / f"{skill_name}.user.toml"

    base_doc = load_toml(base_path)
    if not base_doc and not team_path.is_file() and not user_path.is_file():
        print(json.dumps({"error": f"missing base and overrides: {base_path}"}, indent=2))
        return 1

    team_doc = load_toml(team_path)
    user_doc = load_toml(user_path)

    key = args.key
    top, _, rest = key.partition(".")
    if top not in ("workflow", "agent"):
        print(json.dumps({"error": f"unsupported root key: {top}"}, indent=2), file=sys.stderr)
        return 1

    base_sec = base_doc.get(top, {}) if isinstance(base_doc.get(top), dict) else {}
    team_sec = team_doc.get(top, {}) if isinstance(team_doc.get(top), dict) else {}
    user_sec = user_doc.get(top, {}) if isinstance(user_doc.get(top), dict) else {}

    merged = merge_section(base_sec, team_sec, user_sec)

    if rest:
        val = get_nested(merged, rest)
        print(json.dumps({"skill": skill_name, "key": key, "value": val}, indent=2, ensure_ascii=False))
    else:
        print(json.dumps({"skill": skill_name, "key": top, "merged": merged}, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
