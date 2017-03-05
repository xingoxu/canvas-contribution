import contributeCanvas from './main.js';
import testData from './test-data.js';

let canvas = document.getElementById('test');
contributeCanvas(canvas, testData, {
  padding_top: (44 - 13) * 2,
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
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

function animate() {

    stats.begin();
    // monitored code goes here
    stats.end();
    requestAnimationFrame( animate );
}
requestAnimationFrame( animate );