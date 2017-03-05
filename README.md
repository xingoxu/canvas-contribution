# Canvas Contribution

Generate github contribution or other activities in canvas.

## Preview

- Default

![default](preview/default.gif)

- Custom

![custom](preview/custom.gif)

## Usage

```javascript
//if you use UMD, CanvasContributionTool is a global var
import CanvasContributionTool from 'canvas-contribution';

let canvas = document.getElementById('test');
CanvasContributionTool(canvas, { //data
  max: max,
  data: [
    {
      count: 123,
      date: '2017-03-05', //Start from Sunday
    },{
      count: 123,
      date: '2017-03-06',
    },
    //...etc
    {
      count: 123,
      date: '2017-03-05',
    }
  ],
},{ //config
  padding_top: (44 - 13) * 2, //*2 for Retina Display and the tool will automatically set the width and height
  padding_left_right: 100 * 2,
  footer_margin_top: 14 * 2,
  padding_bottom: (44 - 13 + 2) * 2,
  color: {
    0: '#eee', //less
    1: '#FFAFB7',
    2: '#FE8A95',
    3: '#E26470',
    4: '#BB4956', //more
  },
  text: 'activities',
});
```


## Develop

```bash
npm run dev //start live demo
npm run build //build UMD
```

#### License [MIT](LICENSE)
