var CanvasAnimation = function (id, img, config) {
    "use strict";

    // 绘图板
    this.canvas = null;
    // 上下文
    this.ctx = null;
    // 扫描间距
    this.pointStep = 3;
    // 点大小
    this.pointSize = 1;
    // 点列表
    this.points = [];
    // animation定时器
    this.animationFrame = null;
    // 最后一次动画时间
    this.lastAnimationTime = 0;
    // 每帧动画间隔
    this.animationStep = 50;
    // 当前图片
    this.image = null;
    this.imagePath = '';
    // 鼠标坐标
    this.mousePos = {x: 0, y: 0, ratio: 1};

    if (config) {
        this.pointStep = config.pointStep || 3;
        this.animationStep = config.animationStep || 50;
        this.imagePath = config.imagePath || '';
        this.pointSize = config.pointSize || 1;
    }

    if (id && img) {
        this.init(id, img);
    }
};

/**
 * 初始化
 * @param id
 * @param img
 */
CanvasAnimation.prototype.init = function (id, img) {
    // 初始化Canvas
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext('2d');
    var that = this;

    this.setImage(img);

    this.canvas.addEventListener('mousemove', function (e) {
        var ratio = that.canvas.width / that.canvas.offsetWidth;
        that.mousePos.x = Math.ceil(e.offsetX * ratio);
        that.mousePos.y = Math.ceil(e.offsetY * ratio);
    });
    this.canvas.addEventListener('mouseout', function (e) {
        that.mousePos.x = 0;
        that.mousePos.y = 0;
    });
    this.canvas.addEventListener('click', function (e) {
        var ratio = that.canvas.width / that.canvas.offsetWidth;
        that.mousePos.x = Math.ceil(e.offsetX * ratio);
        that.mousePos.y = Math.ceil(e.offsetY * ratio);
        that.mousePos.ratio = 2;
        setTimeout(function () {
            that.mousePos.x = 0;
            that.mousePos.y = 0;
            that.mousePos.ratio = 1;
        }, 200);
    });
};

/**
 * 初始化
 * @param img
 */
CanvasAnimation.prototype.setImage = function (img) {
    // 加载图片
    var canvas = document.createElement('canvas');
    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;
    var ctx = canvas.getContext('2d');
    this.image = new Image();
    var that = this;
    this.image.onload = function () {
        // 绘制图像
        var w = that.image.width;
        var h = that.image.height;
        var x = Math.ceil((that.canvas.width - w) / 2);
        var y = Math.ceil((that.canvas.height - h) / 2);
        ctx.drawImage(that.image, x, y);
        // 扫描图像
        var imageData = ctx.getImageData(0, 0, that.canvas.width - 1, that.canvas.height - 1);
        var data = imageData.data, pos = 0;
        var cols = Math.floor(that.canvas.width / that.pointStep);
        var rows = Math.floor(that.canvas.height / that.pointStep);
        var i, j;

        if (that.points.length > 0) {
            var index = 0;
            for (i = 1; i <= cols; i++) {
                for (j = 1; j <= rows; j++) {
                    pos = ((j * that.pointStep - 1) * (that.canvas.width - 1) + i * that.pointStep - 1) * 4;

                    that.points[index++].setColor(data[pos], data[pos + 1], data[pos + 2], data[pos + 3]);
                }
            }
        } else {
            for (i = 1; i <= cols; i++) {
                for (j = 1; j <= rows; j++) {
                    pos = ((j * that.pointStep - 1) * (that.canvas.width - 1) + i * that.pointStep - 1) * 4;

                    that.points.push(new Point(i * that.pointStep, j * that.pointStep, data[pos], data[pos + 1], data[pos + 2], data[pos + 3]));
                }
            }
        }
    };
    this.image.src = img;
};

/**
 * 绘制每一帧
 */
CanvasAnimation.prototype.drawAnimateStep = function () {
    window.cancelAnimationFrame(this.animationFrame);

    if (Date.now() - this.lastAnimationTime > this.animationStep) {
        this.lastAnimationTime = Date.now();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        var center = {x: Math.ceil(this.canvas.width / 2), y: Math.ceil(this.canvas.height / 2)};
        for (var i = 0; i < this.points.length; i++) {
            this.points[i].drawStep(this.ctx, this.mousePos, center);
        }
    }

    this.animationFrame = requestAnimationFrame(this.drawAnimateStep.bind(this));
};

/**
 * 绘制原始图像
 */
CanvasAnimation.prototype.drawImage = function () {
    window.cancelAnimationFrame(this.animationFrame);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // 绘制图像
    var w = this.image.width;
    var h = this.image.height;
    var x = Math.ceil((this.canvas.width - w) / 2);
    var y = Math.ceil((this.canvas.height - h) / 2);
    this.ctx.drawImage(this.image, x, y);
};

/**
 * 原始点状
 */
CanvasAnimation.prototype.drawStaticPoint = function () {
    window.cancelAnimationFrame(this.animationFrame);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var i = 0; i < this.points.length; i++) {
        this.points[i].nX = this.points[i].x;
        this.points[i].nY = this.points[i].y;
        this.points[i].tX = this.points[i].x;
        this.points[i].tY = this.points[i].y;
        this.points[i].setAnimationType('');
        this.points[i].draw(this.ctx);
    }
};

/**
 * 直纹
 */
CanvasAnimation.prototype.drawStripe = function () {
    window.cancelAnimationFrame(this.animationFrame);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // 绘制图像
    var w = this.image.width;
    var h = this.image.height;
    var x = Math.ceil((this.canvas.width - w) / 2);
    var y = Math.ceil((this.canvas.height - h) / 2);
    this.ctx.drawImage(this.image, x, y);

    for (var i = 1; i < this.canvas.height; i = i + 2) {
        this.points[i].nX = this.points[i].x;
        this.points[i].nY = this.points[i].y;
        this.points[i].tX = this.points[i].x;
        this.points[i].tY = this.points[i].y;
        this.ctx.clearRect(0, i, this.canvas.width, 1);
    }
};

/**
 * 打乱
 */
CanvasAnimation.prototype.drawChaosPoint = function () {
    window.cancelAnimationFrame(this.animationFrame);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var i = 0; i < this.points.length; i++) {
        this.points[i].nX = this.points[i].x;
        this.points[i].nY = this.points[i].y;
        this.points[i].tX = this.points[i].x;
        this.points[i].tY = this.points[i].y;
        // 设置为乱序动画
        this.points[i].setAnimationType('shake');
        this.points[i].drawStep(this.ctx);
    }
};

/**
 * 抖动
 */
CanvasAnimation.prototype.drawShakePoint = function () {
    window.cancelAnimationFrame(this.animationFrame);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var i = 0; i < this.points.length; i++) {
        // 设置为乱序动画
        this.points[i].setAnimationType('shake');
    }
    this.drawAnimateStep();
};

/**
 * 原始点图
 */
CanvasAnimation.prototype.drawOriginalPoint = function () {
    window.cancelAnimationFrame(this.animationFrame);
    for (var i = 0; i < this.points.length; i++) {
        // 设置为直线动画
        this.points[i].setAnimationType('line');
        this.points[i].tX = this.points[i].x;
        this.points[i].tY = this.points[i].y;
    }
    this.drawAnimateStep();
};

/**
 * 散落到边缘
 */
CanvasAnimation.prototype.drawEdgePoint = function (type) {
    window.cancelAnimationFrame(this.animationFrame);
    for (var i = 0; i < this.points.length; i++) {
        // 设置为乱序动画
        this.points[i].setAnimationType('line');
        switch (type) {
            case 1:
                this.points[i].tX = 0;
                this.points[i].tY = this.points[i].nY;
                break;
            case 2:
                this.points[i].tY = 0;
                this.points[i].tX = this.points[i].nX;
                break;
            case 3:
                this.points[i].tX = this.canvas.width - 1;
                this.points[i].tY = this.points[i].nY;
                break;
            case 4:
                this.points[i].tY = this.canvas.height - 1;
                this.points[i].tX = this.points[i].nX;
                break;
            case 5:
                this.points[i].tX = 0;
                this.points[i].tY = 0;
                break;
            case 6:
                this.points[i].tY = 0;
                this.points[i].tX = this.canvas.width - 1;
                break;
            case 7:
                this.points[i].tX = this.canvas.width - 1;
                this.points[i].tY = this.canvas.height - 1;
                break;
            case 8:
                this.points[i].tY = this.canvas.height - 1;
                this.points[i].tX = 0;
        }
    }
    this.drawAnimateStep();
};

/**
 * 分散到四周
 */
CanvasAnimation.prototype.drawDispersePoint = function () {
    window.cancelAnimationFrame(this.animationFrame);
    var x = 0, y = 0, w = this.canvas.width, h = this.canvas.height;
    var half = Math.floor(this.points.length / 2);
    for (var i = 0; i < this.points.length; i++) {
        // 设置为乱序动画
        this.points[i].setAnimationType('line');
        if (i <= half) {
            x = Math.ceil((i % 2) * w * Math.random());
            y = Math.ceil(((i + 1) % 2) * h * Math.random());
        } else {
            x = w - Math.ceil((i % 2) * w * Math.random()) - 1;
            y = h - Math.ceil(((i + 1) % 2) * h * Math.random()) - 1;
        }

        this.points[i].tX = x;
        this.points[i].tY = y;
    }
    this.drawAnimateStep();
};

/**
 * 旋转
 */
CanvasAnimation.prototype.drawRotatePoint = function () {
    window.cancelAnimationFrame(this.animationFrame);
    for (var i = 0; i < this.points.length; i++) {
        // 设置为乱序动画
        this.points[i].setAnimationType('rotate');
    }
    this.drawAnimateStep();
};

/**
 * 点对象
 * @param R R（红）
 * @param G G（绿）
 * @param B B（蓝）
 * @param A Alpha
 * @param x 横坐标
 * @param y 纵坐标
 * @param r 半径
 */
var Point = function (x, y, R, G, B, A, r) {
    this.x = x;
    this.y = y;
    this.r = R;
    this.g = G;
    this.b = B;
    this.a = A / 255;
    this.radius = r || 1;
    // 当前坐标
    this.nX = this.x;
    this.nY = this.y;
    // 目标坐标
    this.tX = this.nX;
    this.tY = this.nY;

    // 动画
    // line     线性
    // shake    抖动
    // rotate   旋转
    this.animate = '';
};
/**
 * 设置当前坐标
 * @param x
 * @param y
 */
Point.prototype.setCurrentPosition = function (x, y) {
    this.nX = x;
    this.nY = y;
};

/**
 * 设置目标坐标
 * @param x
 * @param y
 */
Point.prototype.setTargetPosition = function (x, y) {
    this.tX = x;
    this.tY = y;
};

/**
 * 设置动画类型
 * @param type
 */
Point.prototype.setAnimationType = function (type) {
    this.animate = type;
};

/**
 * 设置颜色
 * @param R R（红）
 * @param G G（绿）
 * @param B B（蓝）
 * @param A Alpha
 */
Point.prototype.setColor = function (R, G, B, A) {
    this.r = R;
    this.g = G;
    this.b = B;
    this.a = A / 255;
};

/**
 * 绘制像素点
 * @param ctx
 */
Point.prototype.draw = function (ctx) {
    ctx.fillStyle = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
    ctx.fillRect(this.nX, this.nY, this.radius, this.radius);
};

/**
 * 绘制每一帧
 * @param ctx
 * @param mouse
 * @param center
 */
Point.prototype.drawStep = function (ctx, mouse, center) {
    switch (this.animate) {
        case 'line':
            // 线性绘图（上、下、左、右）
            if (this.nY !== this.tY) {

                if (Math.abs(this.nY - this.tY) < 5) {
                    this.nY = this.tY;
                } else {
                    this.nY += Math.ceil(Math.random() * (Math.abs(this.tY - this.nY) > 25 ? (this.tY - this.nY) / 5 : Math.abs(this.tY - this.nY) / (this.tY - this.nY) * 5));
                }
            }
            if (this.nX !== this.tX) {

                if (Math.abs(this.nX - this.tX) < 5) {
                    this.nX = this.tX;
                } else {
                    this.nX += Math.ceil(Math.random() * (Math.abs(this.tX - this.nX) > 25 ? (this.tX - this.nX) / 5 : Math.abs(this.tX - this.nX) / (this.tX - this.nX) * 5));
                }
            }

            break;
        case 'shake':
            // 原地抖动绘图
            if (mouse && mouse.x && mouse.y) {
                // 距离半径小于一定值
                if (Math.sqrt(Math.pow(mouse.x - this.x, 2) + Math.pow(mouse.y - this.y, 2)) < 20 * mouse.ratio) {
                    this.nX = this.x + Math.ceil(Math.random() * (this.x - mouse.x) * 5);
                    this.nY = this.y + Math.ceil(Math.random() * (this.y - mouse.y) * 5);
                }
            }

            if (Math.abs(this.nX - this.tX) < 3) {
                this.nX = this.tX + Math.round(Math.random() * 2 - 1);
            } else {
                this.nX += Math.abs(this.tX - this.nX) / (this.tX - this.nX) * Math.round(Math.random() * 5);
            }
            if (Math.abs(this.nY - this.tY) < 3) {
                this.nY = this.tY + Math.round(Math.random() * 2 - 1);
            } else {
                this.nY += Math.abs(this.tY - this.nY) / (this.tY - this.nY) * Math.round(Math.random() * 5);
            }
            break;
        case 'rotate':
            var aStep = Math.random() * 0.5;
            var angle = Math.atan2(this.nY - center.y, this.nX - center.x);
            var r = Math.sqrt(Math.pow(center.y - this.nY, 2) + Math.pow(center.x - this.nX, 2));
            angle = angle - aStep;
            if (angle >= Math.PI) {
                angle -= Math.PI * 2;
            } else if (angle <= -Math.PI) {
                angle += Math.PI * 2;
            }
            this.nX = Math.cos(angle) * r + center.x;
            this.nY = Math.sin(angle) * r + center.y;
            break;
    }

    // 空白点跳过
    if (this.a === 0) {
        return;
    }

    this.draw(ctx);
};