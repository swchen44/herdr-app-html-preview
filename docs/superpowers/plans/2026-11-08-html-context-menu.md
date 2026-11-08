# HTML Context Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Chrome, native TextView and Save As actions to a personal Files mod for local and remote HTML without changing the installed app or core.

**Architecture:** Copy the pinned Apache-2.0 Files mod with its license and attribution into this repository. Add an independent popup and a bounded transport helper using the existing core connection; use a private local staging area for remote Chrome files. The runtime installation remains isolated pending explicit approval.

**Tech Stack:** Herdr GPUI mods, JavaScript, macOS, existing herdr-core connection.

**Spec:** docs/design/chrome-textview-save.md

## Global Constraints

No modification of running Core, existing Spaces, official checkout, daily App home or system services. No remote server. Preserve existing source view. Do not copy unlicensed community code. No overwrite on save. Windows NOT TESTED.

## Review Focus

- Remote read errors and disconnect must surface errors without opening stale content.
- Paths with spaces and shell metacharacters must be passed as arguments without command injection.
- Two machines and spaces with identical names must not share temporary content.
- Binary data and relative resources must be transferred accurately or explicitly reported unsupported.
- Existing output destinations, symlink escapes, and unsafe source paths must not be overwritten or silently accessed.

## Tasks

1. [ ] Trace app connection and available APIs for binary transport and path selection. Record limits and unresolved risks before implementation.
2. [ ] Add failing isolated tests for menu selection, existing source behavior, remote transfer, collisions, destination overwrite, and transfer failure.
3. [ ] Implement personal mod and helper in repository, preserving pinned upstream notices. Implement TextView, Chrome, and save with clear errors and restricted private staging.
4. [ ] Run targeted tests and Herdr's mod checker in an isolated app home; perform macOS isolated GUI smoke if safe and record exact outcomes. Do not claim Windows or live remote acceptance without tests.
5. [ ] Document installation, rollback, security, limitations and validation; commit and push scoped changes.
