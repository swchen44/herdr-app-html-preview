export function isHtml(path) {
  return /\.html?$/i.test(path ?? '');
}

export function previewTarget(path, machine) {
  if (machine) throw new Error('Remote HTML needs verified transfer before Chrome can open it');
  return path;
}
