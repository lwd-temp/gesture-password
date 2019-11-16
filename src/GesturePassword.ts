interface GesturePasswordProps {
    id?: string;
    el?: HTMLElement;
    context?: CanvasRenderingContext2D;
    width: number;
    height: number;
}

interface Coordinate {
    x: number;
    y: number;
    key?: number;
}

class GesturePassword {
    private id?: string;
    private el?: HTMLElement | HTMLCanvasElement;
    private context?: CanvasRenderingContext2D;
    private width: number; // 画布的宽
    private height: number; // 画布的高
    private circleR: number; // 圆的半径
    private rowPont: number; // 一行有几个圆
    private colPont: number; // 一列有几个圆
    private initCircleCoordinate: Coordinate[]; // 圆的初始化坐标
    private selectedCoordinate: Coordinate[]; // 圆的初始化坐标
    private candidateCoordinate: Coordinate[]; // 圆的初始化坐标
    private isActive: boolean; // 是否激活状态

    constructor(props: GesturePasswordProps) {
        const { id, el, context, width, height } = props;
        this.id = id;
        this.el = el || window.document.getElementById(this.id);
        this.context = context || (this.el as HTMLCanvasElement).getContext('2d');
        this.width = width;
        this.height = height;
        this.circleR = this.width * 28 / 375;
        if (this.width > this.height) {
            this.circleR = this.height * 28 / 375;
        }
        this.rowPont = 3;
        this.colPont = 3;
        this.isActive = false;
        this.initCanvas();
    }
    initCanvas() {
        this.initCircleCoordinate = this.getCircleCoordinate();
        this.candidateCoordinate = this.initCircleCoordinate;
        this.selectedCoordinate = [];
        this.draw();
        this.addEventListener();
    }

    addEventListener() {
        let self = this;
        // TODO:这里的类型是什么呢？？
        const touchstartFun = (e) => {
            e.preventDefault();
            let po = self.getPosition(e);
            for (let i = 0; i < this.candidateCoordinate.length; i++) {
                if (self.collisionDetection(po, self.candidateCoordinate[i])) {
                    self.isActive = true;
                    self.selectedCoordinate.push(self.candidateCoordinate[i]);
                    self.candidateCoordinate.splice(i, 1);
                    self.draw(); // 碰撞检测通过需要重绘canvans
                    break;
                }
            }
        }
        const touchmoveFun = (e) => {
            if (self.isActive) {
                self.update(self.getPosition(e));
            }
        }
        const touchendFun = (e) => {
            if (self.isActive) {
                self.isActive = false;
                self.draw();
                console.log(self.selectedCoordinate)
                // 这里应该把数据传出去
                // 重制绘图
                self.initCanvas();
            }
        }
        // <!-- <script src="https://gw.alipayobjects.com/os/rmsportal/NjNldKHIVQRozfbAOJUW.js"></script> -->
        // 设备兼容
        if ('ontouchstart' in document.documentElement) {
            this.el.addEventListener("touchstart", touchstartFun, false);
            this.el.addEventListener("touchmove", touchmoveFun, false);
            this.el.addEventListener("touchend", touchendFun, false)
        } else {
            this.el.addEventListener("mousedown", touchstartFun, false);
            this.el.addEventListener("mousemove", touchmoveFun, false);
            this.el.addEventListener("mouseup", touchendFun, false)
        }
    }

    /**
     *
     * @param po 更新画布
     */
    update(po: Coordinate) {
        this.draw();
        let last = this.selectedCoordinate[this.selectedCoordinate.length - 1];
        this.context.beginPath();
        this.context.moveTo(po.x, po.y);
        this.context.lineTo(last.x, last.y);
        this.context.closePath();
        this.context.stroke();
        // 滑动经过圆点
        for (let i = 0; i < this.candidateCoordinate.length; i++) {
            if (this.collisionDetection(po, this.candidateCoordinate[i])) {
                this.isActive = true;
                this.selectedCoordinate.push(this.candidateCoordinate[i]);
                this.candidateCoordinate.splice(i, 1);
                break;
            }
        }
    }

    /**
     * 碰撞检测
     */
    collisionDetection(a: Coordinate, b: Coordinate) {
        const rX = Math.abs(a.x - b.x);
        const rY = Math.abs(a.y - b.y);
        if (rX * rX + rY * rY < this.circleR * this.circleR) {
            return true;
        }
        return false
    }

    /**
     * 获取点的坐标
     */
    getCircleCoordinate() {
        const offsetx = (this.width - this.rowPont * this.circleR * 2) / (this.rowPont + 1);
        const offsety = (this.height - this.rowPont * this.circleR * 2) / (this.colPont + 1);
        let circleCoordinate: Coordinate[] = [];
        for (let col = 0; col < this.colPont; col++) {
            for (let row = 0; row < this.rowPont; row++) {
                circleCoordinate.push({
                    x: offsetx * (row + 1) + this.circleR * (2 * row + 1),
                    y: offsety * (col + 1) + this.circleR * (2 * col + 1),
                    key: 3 * col + row + 1
                });
            }
        }
        return circleCoordinate;
    }

    /**
     * 绘制函数
     */
    draw() {
        // 清空绘图
        this.context.clearRect(0, 0, this.width, this.height);
        // 绘制背景
        this.context.fillStyle = "#FFF";
        this.context.fillRect(0, 0, this.width, this.height);
        // 绘制默认圆点
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#0089FF";
        this.context.beginPath();
        for (let i = 0, r = this.circleR; i < this.initCircleCoordinate.length; i++) {
            this.context.moveTo(this.initCircleCoordinate[i].x + r, this.initCircleCoordinate[i].y);
            this.context.arc(this.initCircleCoordinate[i].x, this.initCircleCoordinate[i].y, r, 0, Math.PI * 2, true);
        }
        this.context.stroke();
        this.context.closePath();
        // 绘制连线
        this.context.strokeStyle = "#0089FF";
        this.context.beginPath();
        for (let i = 0; i < this.selectedCoordinate.length; i++) {
            this.context.lineTo(this.selectedCoordinate[i].x, this.selectedCoordinate[i].y);
        }
        this.context.stroke();
        this.context.closePath();
        // 绘制被选中的点的背景 #D9EDFF
        this.context.fillStyle = "#D9EDFF";
        this.context.beginPath();
        for (let i = 0; i < this.selectedCoordinate.length; i++) {
            this.context.moveTo(this.selectedCoordinate[i].x + this.circleR / 2, this.selectedCoordinate[i].y);
            this.context.arc(this.selectedCoordinate[i].x, this.selectedCoordinate[i].y, this.circleR, 0, Math.PI * 2, true);
        }
        this.context.fill();
        this.context.closePath();
        // 绘制被选中的点的中心圆 大小是圆面积的 20/56
        this.context.fillStyle = "#0089FF";
        this.context.beginPath();
        for (let i = 0; i < this.selectedCoordinate.length; i++) {
            this.context.moveTo(this.selectedCoordinate[i].x + this.circleR / 2, this.selectedCoordinate[i].y);
            this.context.arc(this.selectedCoordinate[i].x, this.selectedCoordinate[i].y, this.circleR * 20 / 56, 0, Math.PI * 2, true);
        }
        this.context.fill();
        this.context.closePath();
    }

    /**
     * 获取点击的位置坐标
     * @param e
     */
    getPosition(e) {
        let rect = e.currentTarget.getBoundingClientRect();
        if ('ontouchstart' in document.documentElement) {
            let position = {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
            return position;
        } else {
            let position = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            return position;
        }
    }
}
export default GesturePassword;
