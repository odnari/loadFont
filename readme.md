# LoadFont

A simple wrapper for [FontFaceObserver](https://github.com/bramstein/fontfaceobserver) 
library with more comfortable configuration for font-heavy web projects.

_With ES6, Promises and love._

## How to use

#### Write some CSS
```css
/* A lot of @font-face declarations... */

/* Classes for a 'progressive' fonts loading */
.js-font-loaded {
    font-family: Lora, sans-serif;
}

.js-font-loaded--bold .bold {
    font-weight: 700;
}
```

#### Add FontFaceObserver and LoadFont on your page
```html
<script src="src/fontfaceobserver.js"></script>
<script src="src/loadFont.js"></script>
```

#### Write config
```javascript
loadFont
    .load([
        {
            name: "Lora",
            timeout: 2000,
            settings: {
                weight: 400,
                style: 'normal'
            },
            onload: function () {
                document.documentElement.classList.add('js-font-loaded')
            },
            next: {
                name: "Lora",
                timeout: 5000,
                settings: {
                    weight: 700,
                    style: 'normal'
                },
                onload: function () {
                    document.documentElement.classList.add('js-font-loaded--bold')
                }
            }
        }
    ])
    .then(function () {
        console.log('All fonts loaded.');
    });
```