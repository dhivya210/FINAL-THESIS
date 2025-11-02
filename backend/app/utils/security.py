"""Minimal password hashing utilities for the auth stub."""

from __future__ import annotations

import hashlib


def hash_password(password: str) -> str:
    """Return a salted SHA256 hash (demo purpose only)."""

    salt = "qa-toolkit"
    return hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    """Validate password against stored hash."""

    return hash_password(password) == hashed
