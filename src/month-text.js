import normalizeColor from './normalize-color.js';
import merge from 'merge';

let _config = {
  font_size_Month: 10 * 2,
  font_size_Day: 9 * 2,
  color: '#767676',
  font_family: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
}


function MonthText(context, { x, y, text }, isMonth) {
  this.render_config = {
    context,
    x,
    y,
    text,
    font: `${isMonth ? _config.font_size_Month : _config.font_size_Day}px ${_config.font_family}`,
    color: normalizeColor(_config.color),
  }
};

let FooterText_config = {
  font: `${11 * 2}px ${_config.font_family}`,
  color: normalizeColor('#586069'),
};
function FooterText(context, { x, y, text }) {
  this.render_config = merge.recursive(true, FooterText_config, { x, y, text, context });
}
FooterText.prototype.render = MonthText.prototype.render = function () {
  let { context, x, y, text, font, color } = this.render_config;
  //text
  context.save();
  context.font = font;
  context.textBaseline = "middle";
  context.fillStyle = color;
  context.fillText(text, x, y);
  context.restore();
  return this;
}
FooterText.getWidth = function (context, text) {
  let { font, color } = FooterText_config;
  //text
  context.save();
  context.font = font;
  context.textBaseline = "middle";
  context.fillStyle = color;
  let result = context.measureText(text).width;
  context.restore();
  return result;
}
export default MonthText;
export var MonthTextConfig = _config;
export var FooterText;