# Contributing to OMG-AI

Thank you for your interest in contributing to OMG-AI! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

1. Check the [issue tracker](https://github.com/oyi77/omg-ai/issues) to see if the bug has already been reported.
2. If not, create a new issue with a clear title and description.
3. Include steps to reproduce, expected behavior, and actual behavior.
4. Add any relevant logs or screenshots.

### Suggesting Features

1. Open an issue with the tag "enhancement".
2. Clearly describe the feature and its use case.
3. Explain why this feature would be useful to others.

### Submitting Changes

1. Fork the repository.
2. Create a new branch for your changes (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Add or update tests as needed.
5. Ensure all tests pass: `npm test`.
6. Update documentation if necessary.
7. Commit your changes with a clear message.
8. Push to your fork and submit a pull request.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/oyi77/omg-ai.git
   cd omg-ai
   ```

2. Install dependencies (none currently, but for future):
   ```bash
   npm install
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. Run benchmarks:
   ```bash
   npm run benchmark
   ```

## Code Style

- Use single quotes for strings.
- Use 2-space indentation.
- Use camelCase for variables and functions.
- Add JSDoc comments for public APIs.
- Keep functions small and focused.

## Testing

- Write tests for new features.
- Ensure existing tests still pass.
- Aim for high test coverage.

## Documentation

- Update README.md for user-facing changes.
- Update ARCHITECTURE.md for architectural changes.
- Add inline comments for complex logic.

## Pull Request Process

1. Ensure your PR addresses a single concern.
2. Provide a clear description of the problem and solution.
3. Include any relevant issue numbers.
4. Ensure CI passes (tests, linting).
5. Request review from maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue or reach out to the maintainers.

Thank you for helping make OMG-AI better!