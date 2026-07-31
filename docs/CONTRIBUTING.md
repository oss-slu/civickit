last updated: 7/21/2026

# Contributing to CivicKit

## Getting Started
1. Fork the repo (or create a branch if you have write access)
2. Create a branch named after the issue you're working on: `git checkout -b 123-short-description`
3. Make your changes
4. Run the checks for the package you touched (see below)
5. Commit: `git commit -m "feat: add X"`
6. Submit a PR

## Development Setup
[Setup Guide](SETUP.md)

## Checks to run before a PR
- **backend**: `npm run typecheck` and `npm test` (this is what CI runs)
- **mobile**: `npx tsc --noEmit`
- **web**: `npm run typecheck` and `npm run check` (prettier + eslint)
- **shared**: `npm run build`

## Code Standards
- Match the style of the code around you
- Add comments for complex logic
- Write tests for new backend features (unit tests live next to the code in `__tests__/`)
- Update docs when behavior or setup changes

## Commit Message Format
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `refactor:` code refactoring
- `test:` adding tests

## Pull Request Process
1. Update documentation if needed
2. Link to related issue
3. Request review from maintainer
4. Wait for CI to pass

## Communication
- Slack: [link]
- Weekly meetings: [day/time]
- Issues: Use GitHub Issues
