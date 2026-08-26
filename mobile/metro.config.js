// mobile/metro.config.js
//
// @civickit/shared is a `file:../shared` dependency, symlinked into
// node_modules. TypeScript has always been able to follow that, but Metro had
// never actually bundled the package: every import of it was a type import,
// which Babel elides before Metro sees it.
//
// The photo work introduced the first runtime imports from shared
// (resolveIssueLocation, resolvePhotoTakenAt, extractPhotoMetadataFromExif), so
// Metro now has to read files outside the mobile project root. watchFolders is
// what permits that; without it the bundle fails with "Unable to resolve
// @civickit/shared".

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const sharedRoot = path.resolve(projectRoot, '..', 'shared');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [sharedRoot];

// Resolve dependencies from the app's own node_modules only. shared has no
// node_modules of its own, and without this Metro would walk up from the
// shared/ path looking for one.
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

module.exports = config;
