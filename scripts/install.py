#!/usr/bin/env python3
"""Create an independent Herdr Files preview layout without overwriting files."""
import argparse
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile

PACKAGE = Path(__file__).resolve().parent.parent / 'mods' / 'files-preview'
FILES = ('main.js', 'mod.json', 'actions.js', 'media.js', 'transport.js', 'bundle.js', 'cache.js', 'LICENSE')

def replace_files(node):
    count = 0
    if isinstance(node, dict):
        if node.get('mod') == 'files':
            node['mod'] = 'files-preview'
            count += 1
        for value in node.values():
            count += replace_files(value)
    elif isinstance(node, list):
        for value in node:
            count += replace_files(value)
    return count

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--app-home', type=Path, default=Path(os.environ.get('HERDR_APP_HOME', Path(os.environ.get('XDG_CONFIG_HOME', Path.home()/'.config'))/'herdr-app')))
    parser.add_argument('--base-layout', default='main')
    args = parser.parse_args()
    if not args.base_layout or Path(args.base_layout).name != args.base_layout:
        parser.error('base layout must be a simple name')
    home = args.app_home.expanduser()
    source = home/'layouts'/f'{args.base_layout}.json'
    target = home/'layouts'/'files-preview.json'
    destination = home/'mods'/'files-preview'
    if not source.is_file():
        raise ValueError(f'layout does not exist: {source}')
    if target.exists() or destination.exists():
        raise ValueError('files-preview layout or mod already exists; no files changed')
    layout = json.loads(source.read_text())
    if not replace_files(layout):
        raise ValueError('base layout does not contain the official files mod')
    if not all((PACKAGE/f).is_file() for f in FILES):
        raise ValueError('mod package incomplete')
    (home/'mods').mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.files-preview-', dir=home/'mods') as temp:
        for file in FILES:
            shutil.copy2(PACKAGE/file,Path(temp)/file)
        # mkdir is atomic and refuses to overwrite a competing installer.
        destination.mkdir()
        try:
            for file in FILES:
                shutil.copy2(Path(temp)/file,destination/file)
            # Write a complete temporary file and publish without replacement.
            with tempfile.NamedTemporaryFile(mode='w', dir=home/'layouts', prefix='.files-preview-', delete=False) as out:
                temp_layout = Path(out.name)
                try:
                    json.dump(layout,out,indent=2,ensure_ascii=False)
                    out.write('\n')
                except Exception:
                    temp_layout.unlink(missing_ok=True)
                    raise
            try:
                os.link(temp_layout, target)
            finally:
                temp_layout.unlink(missing_ok=True)
        except Exception:
            # Only remove the mod directory created by this invocation.
            shutil.rmtree(destination)
            raise
    print(f'Created {destination} and {target}')
    print('Check the mod, then switch to the files-preview layout in Herdr.')

if __name__=='__main__':
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f'install: {error}',file=sys.stderr)
        sys.exit(1)
