// TypeScript 6 (which Expo SDK 56 pins) rejects side-effect imports of files it
// has no declaration for -- TS2882. IssueMap.web.tsx imports leaflet's
// stylesheet that way, which Metro's web bundler handles fine but tsc cannot
// see. Declaring the wildcard module tells tsc the import is intentional and
// carries no type surface.
declare module '*.css';
