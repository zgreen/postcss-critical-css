# PostCSS Critical CSS

Critical CSS for use with CSS Modules.

## About

CSS Modules allow for locally scoped class names, which is great. But this makes
critical CSS a challenge—class names will be hashed and added via JS. This
allows you to identify which among your CSS modules you want to include in a
critical CSS file, and writes those styles to that file.

## Example

```css
/* In locallyScopedClass.css */
.locallyScopedClass {
  critical: this;
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```
Will output:
```css
/* In critical.css */
.locallyScopedClass {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

Note that in the above example, the selector is rendered as it is written in the
module. This may not be desireable, to you can alternatively identify the
selector you'd like to use in your `critical.css`;
```css
/* In locallyScopedClass.css */
.locallyScopedClass {
  critical: .custom-selector;
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

## To Dos

Lots!

- Tests
- More tests
- More robust warnings
