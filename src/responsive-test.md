# Responsive iframe

Try resizing the width of the iframe using the slider below; notice that the height adjusts automatically.

```js
const iframeWidth = view(Inputs.range([400, 1920], {step: 1, value: document.querySelector("#observablehq-main").offsetWidth, label: "Width"}));
```

<iframe id="iframe" scrolling="no" src="./"></iframe>

```js
iframe.width = iframeWidth; // set the iframe width reactively
```

```js 
const messaged = (event) => iframe.height = event.data.height;
addEventListener("message", messaged);
invalidation.then(() => removeEventListener("message", messaged));
```
