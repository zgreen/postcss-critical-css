# PostCSS Critical CSS

Critical CSS for use with CSS Modules.

## About

CSS Modules allow for locally scoped class names, which is great. But this makes
critical CSS a challenge—class names will be hashed and added via JS. This plugin
allows you to identify which among your CSS modules you want to include in a
critical CSS file, and writes those styles to that file.

## Example

```css
/* In locallyScopedClass.css */
.locallyScopedClass {
  critical-selector: this;
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
module. This may not be desireable, so you can alternatively identify the
selector you'd like to use in your `critical.css`;
```css
/* In locallyScopedClass.css */
.locallyScopedClass {
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
/* in locallyScopedClass.css */
.locallyScopedClass {
  critical-selector: scope;
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}

.locallyScopedClass a {
  color: blue;
  text-decoration: none;
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

.locallyScopedClass a {
  color: blue;
  text-decoration: none;
}
```

And what if you need to output multiple critical CSS files
(for example, if you have two different templates that do not share styles)?
You can do that as well. Alternate destinations will be named `[destination]-critical.css`.
```css
/* in locallyScopedClass.css */
.locallyScopedClass {
  critical-selector: this;
  critical-dest: secondary;
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```
Will output:
```css
/* In secondary-critical.css */
.locallyScopedClass {
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

Lots!

- Tests
- More tests
- File output option(s)
- More robust warnings
