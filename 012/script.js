class Shape {
    constructor(color) {
        this._color = color;
    }

    get color() {
        return this._color;
    }

    set color(value) {
        this._color = value;
    }

    calculateArea() {
        throw new Error("Method 'calculateArea' must be implemented by subclasses");
    }
}

class Circle extends Shape {
    constructor(color, radius) {
        super(color);
        this._radius = radius;
    }

    get radius() {
        return this._radius;
    }

    set radius(value) {
        this._radius = value;
    }

    calculateArea() {
        return Math.PI * Math.pow(this._radius, 2);
    }
}

class Square extends Shape {
    constructor(color, side) {
        super(color);
        this._side = side;
    }

    get side() {
        return this._side;
    }

    set side(value) {
        this._side = value;
    }

    calculateArea() {
        return this._side * this._side;
    }
}

class Rectangle extends Shape {
    constructor(color, width, height) {
        super(color);
        this.width = width;
        this._height = height;
    }

    get width() {
        return this._width;
    }

    set width(value) {
        this._width = value;
    }

    get height() {
        return this._height;
    }

    set height(value) {
        this._height = value;
    }

    calculateArea() {
        return this._width * this._height;
    }
}

const shapes = [new Circle('red', 12), new Square('red', 12, 15), new Rectangle('red', 11, 23)];

shapes.forEach(item => console.log(item.calculateArea()));