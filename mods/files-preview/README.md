# Files Preview Mod

**Experimental; not ready for everyday use.** Based on Herdr Files at commit `7fe7ac34fef8a3ee76cb5d2f17bc8d6331e50bd8` under Apache-2.0 (see LICENSE). The native TextView/Source approach was informed by https://kt-tech.blog/blogs/herdr-app-mod-file-preview.

The macOS prototype provides HTML/Markdown TextView, text polling, a file action bar, Chrome, Save Copy and image/PDF previews (PDF limit: 30 pages). Remote selected files use existing Herdr Core machine connections, Python 3 on remote Linux, 32 KiB chunks and SHA-256, with a 5 MiB file limit and symlink rejection. An interrupted transfer attempts to delete its partial staging directory.

Important limits: remote HTML copies only the selected file, so Chrome cannot load relative resources from the remote machine; it does not auto-reload. Successful copies and rendered files remain in the app-home cache without automatic expiry. Save Copy chooses a destination folder and retains the filename; GUI picker acceptance is incomplete. Windows is unsupported. There is no complete adversarial security or app-restart acceptance. TextView does not execute JavaScript or implement full CSS. Do not use for sensitive content or install in a daily environment until these boundaries are addressed. See [work evidence](../../docs/work/README.md).
