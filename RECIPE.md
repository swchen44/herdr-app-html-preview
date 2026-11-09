# Files preview mod recipe

Status: experimental, not ready for everyday use. See README for verified scope and limitations.

Goal: Extend a personal copy of Herdr's Files mod with native Markdown and HTML TextView, source toggling, macOS image and multi-page PDF previews, and a file action bar containing Preview, Chrome and Save Copy. Keep the original Files click behavior and use the active Space's machine and folder. The mod cannot embed a full browser.

Files: `mods/files-preview/` contains the mod; `scripts/install.py` creates a separate personal layout, with no overwrites. The mod executes local programs, reads local files, and can execute Python 3 on an already connected remote machine to transfer selected files. It writes staged copies under the Herdr app home. Review all files and README before installation.

Limits: remote single-file transfers are capped at 5 MiB, reject symlinks, and use checksums. Remote browser preview stages discovered static relative assets, but dynamic resources, ES modules and automatic Chrome refresh are unsupported. Old generated cache directories are pruned only during a later operation. macOS-only media and Chrome implementation; Windows is not tested. No production acceptance yet.

Attribution: based on Herdr Files at commit `7fe7ac34fef8a3ee76cb5d2f17bc8d6331e50bd8` under Apache-2.0. The native preview flow was informed by https://kt-tech.blog/blogs/herdr-app-mod-file-preview.
