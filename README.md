# PostCSS Critical CSS

![Travis build status](https://travis-ci.org/zgreen/postcss-critical-css.svg?branch=master)

This plugin allows the user to define and output critical CSS using custom atRules, and/or custom CSS properties. Critical CSS may be output to one or more files, as defined within the plugin options or within the CSS.

## Install

`npm install postcss-critical-css --save-dev`

## Examples

A live example is available in this repo. See the `/example` directory, and use the command `npm run example` to test it out.

### Using the `@critical` atRule

```css
/* In foo.css */
@critical;

.foo {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```
Will output:
```css
/* In critical.css */
.foo {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

### Using the `@critical` atRule with a custom file path

```css
/* In foo.css */
@critical bar.css;

.foo {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```
Will output:
```css
/* In bar.css */
.foo {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

### Using the `@critical` atRule with a subset of styles

```css
/* In foo.css */
.foo {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}

@critical {
  .bar {
    border: 10px solid gold;
    color: gold;
  }
}
```
Will output:
```css
/* In critical.css */
.bar {
  border: 10px solid gold;
  color: gold;
}
```

### Using the custom property, `critical-selector`

```css
/* In foo.css */
.foo {
  critical-selector: this;
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```
Will output:
```css
/* In critical.css */
.foo {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

### Using the custom property, `critical-selector`, with a custom selector.

```css
/* In foo.css */
.foo {
  critical-selector: .bar;
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```
Will output:
```css
/* In critical.css */
.bar {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

### Using the custom property, `critical-filename`

```css
/* in foo.css */
.foo {
  critical-selector: this;
  critical-filename: secondary-critical.css;
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```
Will output:
```css
/* In secondary-critical.css */
.foo {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

### Using the custom property, `critical-selector`, with value `scope`

This allows the user to output the entire scope of a module, including children.

```css
/* in foo.css */
.foo {
  critical-selector: scope;
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}

.foo a {
  color: blue;
  text-decoration: none;
}
```
Will output:
```css
/* In critical.css */
.foo {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}

.foo a {
  color: blue;
  text-decoration: none;
}
```

## Plugin options

The plugin takes a single object as its only parameter. The following properties are valid:

| Arg          | Type      | Description                                 | Default |
| ------------ | --------- | ------------------------------------------- | ------------------------- |
| `outputPath` | `string`  | Path to which critical CSS should be output | Current working directory |
| `outputDest` | `string`  | Default critical CSS file name | `"critical.css"` |
| `preserve`   | `boolean` | Whether or not to remove selectors from primary CSS document once they've been marked as critical. This should prevent duplication of selectors across critical and non-critical CSS. | `true` |
| `minify`     | `boolean` | Minify output CSS? | `true` |

## To Dos

- More tests
- More robust warnings
