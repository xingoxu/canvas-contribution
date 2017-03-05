import merge from 'merge';
import normalizeColor from './normalize-color.js';
import { rgba } from './normalize-color.js';
import moment from 'moment';
import TWEEN from 'tween.js';

function getLevel(count, max) {
  if (count == 0)
    return 0;
  for (let i = 1; i <= 3; i++) {
    let levelMax = max / 4 * i;
    if (count <= levelMax)
      return i;
  }
  return 4;
}

function generator(config, context) {
  let ANIMATE_TIME = 200;
  // config.color = Array.prototype.slice.call(config.color).map(color => normalizeColor(color));

  function ToolTip({ x, y }, contribution, square_config) {
    let _config = {
      padding_left_right: 20,
      padding_top_bottom: 20,
      font_size: 24,
      line_height: 36,
      font_family: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
      above: 6,
      triangle_height: 10,
      triangle_width: 20,
      strong_color: rgba('#ddd', false),
      color: rgba('#bbb', false),
      background: rgba('rgba(0,0,0,0.8)', false),
      radius: 6,

      animate_time: ANIMATE_TIME,
    };
    let animate_transup = _config.above + _config.triangle_height + _config.padding_top_bottom + _config.line_height / 2;
    this.animate_transup = animate_transup;

    let contribution_text = `${contribution.count > 0 ? contribution.count : 'No'} ${config.text}`;
    let date_text = ` on ${moment(contribution.date).format('ll')}`;

    let contribution_font = `bold ${_config.font_size}px/${_config.line_height}px ${_config.font_family}`;
    let date_font = `${_config.font_size}px/${_config.line_height}px ${_config.font_family}`

    context.fillStyle = _config.color;

    context.font = contribution_font;
    let contribution_width = context.measureText(contribution_text).width;
    context.font = date_font;
    let date_width = context.measureText(date_text).width;

    this.animate_prop = {
      x: (x + square_config.width / 2 - (contribution_width + date_width) / 2 - _config.padding_left_right),
      y: (y - _config.padding_top_bottom * 2 - _config.line_height - _config.triangle_height - _config.above + animate_transup),
      opacity: 0,
    }
    let render_config = {
      width: _config.padding_left_right * 2 + contribution_width + date_width,
      height: _config.padding_top_bottom * 2 + _config.line_height,
      contribution_text,
      date_text,
      contribution_font,
      date_font,
      contribution_width,
      date_width,
      _config,
      animate_transup
    };
    this.render_config = merge(render_config, this.animate_prop);
  }
  ToolTip.prototype.render = function () {
    let render_config = this.render_config;
    let animate_prop = this.animate_prop;
    let w = render_config.width,
      h = render_config.height;
    let x = animate_prop.x,
      y = animate_prop.y,
      r = render_config._config.radius;
    let color = render_config._config.color.slice(),
      strong_color = render_config._config.strong_color.slice(),  
      background = render_config._config.background.slice();
    color[3] = color[3] * animate_prop.opacity;
    strong_color[3] = strong_color[3] * animate_prop.opacity;
    background[3] = background[3] * animate_prop.opacity;

    //background
    context.save();
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + w, y, x + w, y + h, r);
    context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r);
    context.arcTo(x, y, x + w, y, r);
    context.closePath();
    context.fillStyle = `rgba(${background.join(',')})`;
    context.fill();
    context.restore();

    //triangle
    context.save();
    context.beginPath();
    context.moveTo(x + w / 2 - render_config._config.triangle_width / 2, y + h);
    context.lineTo(x + w / 2 + render_config._config.triangle_width / 2, y + h);
    context.lineTo(x + w / 2, y + h + render_config._config.triangle_height);
    context.closePath();
    context.fillStyle = `rgba(${background.join(',')})`;
    context.fill();
    context.restore();
    

    //text
    context.save();
    let text_y = y + render_config._config.padding_top_bottom + render_config._config.line_height / 2;
    context.font = render_config.contribution_font;
    context.textBaseline = "middle";
    context.fillStyle = `rgba(${strong_color.join(',')})`;
    context.fillText(render_config.contribution_text, x + render_config._config.padding_left_right, text_y);
    context.font = render_config.date_font;
    context.fillStyle = `rgba(${color.join(',')})`;    
    context.fillText(render_config.date_text, x + render_config._config.padding_left_right + render_config.contribution_width, text_y);  
    context.restore();

    return this;
  }
  ToolTip.prototype.showtip = function () {
    this.tween && this.tween.stop();
    this.tween = new TWEEN.Tween(this.animate_prop)
      .easing(TWEEN.Easing.Cubic.Out)
      .to({
        x: this.render_config.x,
        y: this.render_config.y - this.render_config.animate_transup,
        opacity: 1,
      }, this.render_config._config.animate_time).start();
    return this.tween;
  }
  ToolTip.prototype.hidetip = function () {
    this.tween && this.tween.stop();
    this.tween = new TWEEN.Tween(this.animate_prop)
      .easing(TWEEN.Easing.Cubic.Out)      
      .to({
        x: this.render_config.x,
        y: this.render_config.y,
        opacity: 0,
      }, this.render_config._config.animate_time).start();
    return this.tween;
  }

  function Square({ x, y }, contribution, contribution_max) {
    let _config = {
      width: 20,
      height: 20,
      x,
      y,
      animate_opacity: 0.5,
      animate_time: ANIMATE_TIME,
    }
    this._contribution = contribution;
    this._config = _config;
    this.width = _config.width;
    this.height = _config.height;
    if (contribution && contribution_max) {
      this.level = getLevel(contribution.count, contribution_max);
      this.tooltip = new ToolTip({ x, y }, contribution, _config)
    }
    else {
      this.level = contribution; // contribution is level;
    }
    this.animate_prop = {
      opacity: 1,
    }
  }
  Square.prototype.render = function () {
    let { x, y, width, height } = this._config;
    let color = rgba(config.color[this.level], false);
    color[3] = color[3] * this.animate_prop.opacity;
    context.save();
    context.beginPath();
    context.rect(x, y, width, height);
    context.closePath();
    context.fillStyle = `rgba(${color.join(',')})`;
    context.fill();
    context.restore();
    return this;
  }
  Square.prototype.isInSquare = function (mouse_x, mouse_y) {
    let { x, y, width, height } = this._config;
    context.save();
    context.beginPath();
    context.rect(x, y, width, height);    
    let result = context.isPointInPath(mouse_x, mouse_y);
    context.restore();
    return result;
  }
  Square.prototype.hide = function () {
    this.tween && this.tween.stop();
    this.tween = new TWEEN.Tween(this.animate_prop)
      .easing(TWEEN.Easing.Cubic.Out)
      .to({
        opacity: this._config.animate_opacity,
      }, this._config.animate_time).start();
    return this.tween;
  }
  Square.prototype.show = function () {
    this.tween && this.tween.stop();
    this.tween = new TWEEN.Tween(this.animate_prop)
      .easing(TWEEN.Easing.Cubic.Out)
      .to({
        opacity: 1,
      }, this._config.animate_time).start();
    return this.tween;
  }
  return Square;
}

export default generator;

