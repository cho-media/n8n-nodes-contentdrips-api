const { src, dest } = require('gulp');

function buildIcons() {
  return src('nodes/**/*.svg')
    .pipe(dest('dist/nodes/'));
}

function buildPngIcons() {
  return src('nodes/**/*.png')
    .pipe(dest('dist/nodes/'));
}

// Export tasks
exports['build:icons'] = buildIcons;
exports['build:png-icons'] = buildPngIcons;

// Combined task for all icon formats
exports['build:all-icons'] = require('gulp').parallel(buildIcons, buildPngIcons);
