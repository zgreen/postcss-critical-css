# PostCSS Critical CSS

This plugin allows you to define and output critical CSS using custom CSS properties.

## Example

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

Note that in the above example, the selector is rendered as it is written in the
module. This may not be desireable, so you can alternatively identify the
selector you'd like to use in your `critical.css`;
```css
/* In foo.css */
.foo {
  critical-selector: .custom-selector;
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```
Will output:
```css
/* In critical.css */
.custom-selector {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

If you'd like to ouptut the entire scope of a module, including children, you can!
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

And what if you need to output multiple critical CSS files
(for example, if you have two different templates that do not share styles)?
You can do that as well.
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

## Options

**outputPath**
Path to which critical CSS should be output
Default: current working directory

**preserve**
Whether or not to remove selectors from primary CSS document once they've been marked as critical.
This should prevent duplication of selectors across critical and non-critical CSS.
WARNING: this is a destructive option and may break styles relying on the cascade!
Default: true

**minify**
Minify output CSS
Default: true

## To Dos

- Tests
- More tests
- More robust warnings
