# Contributing to postcss-critical-css

Thank you for your contribution!

- Issues are welcome.
- PRs are welcome.

If you'd like to propose a major change, please open an issue first so that the change can be discussed.

## Linting, type checking, and testing

Code is linted using [eslint](https://eslint.org/), type-checked using [flow](https://flow.org/), and tested using [tape](https://github.com/substack/tape).

You can lint your code locally using the following command:

```sh
npm run eslint
```

You can type check your code locally using the following command:

```sh
npm run flow
```

You can test your code locally using the following command:

```sh
npm run test
```

To ensure proper versioning, commits to are also linted using [commitlint](https://commitlint.js.org).

## Building

Source code is compliled using [babel](https://babeljs.io/). You can run the build locally using the following command:

```sh
npm run build
```

Note that code that fails either the linting and/or type-checking step will fail to build successfully.

## CI

All commits pushed to the remote repository are tested using [Github actions](https://github.com/features/actions).
