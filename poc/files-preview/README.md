# Files preview prototype — not ready for installation

Based on official Herdr Files `7fe7ac34fef8a3ee76cb5d2f17bc8d6331e50bd8`, Apache-2.0; see LICENSE. Preview/source approach informed by https://kt-tech.blog/blogs/herdr-app-mod-file-preview.

Provides native HTML/Markdown text rendering, 3-second text polling, right-click action bar, Chrome, Save As, and macOS image/PDF conversion (PDF limit 30 pages). Remote single files use Python 3 via existing Core exec, 32 KiB chunks, 5 MiB maximum, SHA-256 verification and a resolved path boundary. Remote HTML is copied alone: relative resources and live Chrome reload are NOT supported. File staging uses private temporary directories but cleanup is NOT implemented. Remote security boundary has not received adversarial race testing. Do not use on sensitive content or install in daily Herdr.

Validated: Node tests including simulated remote execution and local PDFKit conversion; `herdr-app check` covers initial mod load only. Actual remote Core, Chrome, picker, UI events, app restart, Space switching, concurrent file mutation, macOS real GUI and Windows are NOT TESTED. Test-generated temporary directories are not automatically removed.
