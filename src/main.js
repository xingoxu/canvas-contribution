let squareGenerator = require('./Square.js').default;
let MonthText = require('./month-text.js').default;
let TWEEN = require('tween.js');
let moment = require('moment');
let merge = require('merge');
let MonthTextConfig = require('./month-text.js').MonthTextConfig;
let FooterText = require('./month-text.js').FooterText;

(function (root, exports) {
  if (typeof define === 'function' && define.amd) {
    define([], () => {
      return exports;
    });
  } else {
    root['CanvasContributionTool'] = exports;
  }
}(window, function (canvas, contributions, config) {
  let default_config = {
    padding_top: (44 - 13) * 2,
    padding_left_right: 100 * 2,
    footer_margin_top: 14 * 2,
    padding_bottom: (44 - 13 + 2) * 2,
    color: {
      0: '#eee', //less
      1: '#c6e48b',
      2: '#7bc96f',
      3: '#239a3b',
      4: '#196127', //more
      length: 5,
    },
    text: 'contributions',
  };
  config = merge.recursive(true, default_config, config);
  let weekday_margin_x = 14 * 2 * 2,
    monthtext_margin_y = 10 * 2 * 1.3,
    square_init_pos = {
      x: config.padding_left_right + weekday_margin_x,
      y: config.padding_top + monthtext_margin_y + MonthTextConfig.font_size_Month,
    };


  let context = canvas.getContext('2d');
  let Square = squareGenerator({
    color: config.color,
    text: config.text,
  }, context);

  let square_margin = {
    x: 4,
    y: 4,
  };
  let square_x = square_init_pos.x,
    square_y = square_init_pos.y,
    square_max_y;
  let SquareArray = [],
    textArray = [];
  for (let i = 0; i < contributions.data.length; i++) {
    //generate WeekDay Text
    if (i == 1 || i == 3 || i == 5) {
      let weekday_text = {
        1: 'Mon',
        3: 'Wed',
        5: 'Fri',
      };
      textArray.push(new MonthText(context, {
        x: square_x - weekday_margin_x,
        y: square_y + square.height / 2,
        text: weekday_text[i]
      }, false));
    }

    //generate Month Text
    if (SquareArray.length >= 7 && SquareArray.length % 7 == 0 && Math.ceil((SquareArray.length + 1) / 7) != Math.ceil(contributions.data.length / 7)) {
      let new_day = contributions.data[i],
        old_day = contributions.data[i - 7];
      if (moment(new_day.date).month() == moment(old_day.date).month() + 1 ||
        moment(new_day.date).year() == moment(old_day.date).year() + 1) {
        textArray.push(new MonthText(context, {
          x: square_x,
          y: square_y - monthtext_margin_y,
          text: moment.monthsShort(moment(new_day.date).month())
        }, true));
      }
    }


    //generate square
    let square = new Square({
        x: square_x,
        y: square_y
      },
      contributions.data[i],
      contributions.max
    );
    SquareArray.push(square);


    //prepare next x,y
    square_y += (square_margin.y + square.height);
    if (SquareArray.length % 7 == 0) {
      square_x += (square_margin.x + square.width);
      square_max_y = square_y;
      square_y = square_init_pos.y;
    }
  }

  let square_width = SquareArray[0].width,
    square_height = SquareArray[0].height;

  canvas.width = square_x + square_width + config.padding_left_right;
  canvas.style.width = `${canvas.width / 2}px`;

  //generate Footer  
  let footer_config = {
    right: 7 * 2,
    text_margin: 9 * 2,
    square_margin: 3 * 2,
  }

  square_x = square_x + square_width;
  let footer_y = square_max_y + config.footer_margin_top;
  let MoreTextLength = FooterText.getWidth(context, 'More');
  square_x = square_x - footer_config.right - MoreTextLength;
  textArray.push(new FooterText(context, {
    x: square_x,
    y: footer_y + square_height / 2,
    text: 'More'
  }));

  //generate Footer Square  
  square_x = square_x - footer_config.text_margin - square_width;
  for (let i = 4; i >= 0; i--) {
    textArray.push(new Square({
      x: square_x,
      y: footer_y,
    }, i));
    square_x -= (footer_config.square_margin + square_width);
  }


  square_x = square_x + footer_config.square_margin + square_width - footer_config.text_margin - FooterText.getWidth(context, 'Less');
  textArray.push(new FooterText(context, {
    x: square_x,
    y: footer_y + square_height / 2,
    text: 'Less'
  }));

  //don't forget to set canvas height
  footer_y += square_height;
  canvas.height = `${config.padding_bottom + footer_y}`;

  let canvasLeft = canvas.getBoundingClientRect().left;
  let canvasTop = canvas.getBoundingClientRect().top;
  let timeout = 0;
  let renderTimeout = 0;
  canvas.addEventListener('mousemove', event => {
    clearTimeout(timeout);
    startRender();
    timeout = setTimeout(() => {
      let x = (event.clientX - canvasLeft) * 2;
      let y = (event.clientY - canvasTop) * 2;
      let hasOneSquare = false;
      SquareArray.forEach((square, index) => {
        if (square.isInSquare(x, y)) {
          square.tooltip.showtip();
          hasOneSquare = true;
          square.show();
        } else {
          square.tooltip.hidetip();
          square.hide();
        }
      });
      if (hasOneSquare === false) {
        SquareArray.forEach(square => {
          square.show()
        });
      }
    }, 50);
  }, false);
  canvas.addEventListener('mouseenter', event => {
    startRender();
  }, false);
  canvas.addEventListener('mouseleave', event => {
    stopRender();
  }, false);

  let notRender = false;
  //中断恢复
  function startRender() {
    notRender = false;
    clearTimeout(renderTimeout);
  }

  function stopRender() {
    renderTimeout = setTimeout(() => {
      notRender = true;
    }, SquareArray[0].tooltip.render_config._config.animate_time + 150);
  }

  function render(time) {
    requestAnimationFrame(render);
    if (notRender)
      return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    textArray.forEach(monthText => {
      monthText.render();
    });
    SquareArray.forEach(square => {
      square.render()
    });
    SquareArray.forEach(square => {
      square.tooltip.render()
    });
    TWEEN.update(time);
  }
  render();
  stopRender();
}));