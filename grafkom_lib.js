function clear_screen() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}

function getTitik(data, posisi) {
    let { x, y } = posisi;
    let index = (x + y * canvas.width) * 4;

    let r, g, b;
    r = data.data[index];
    g = data.data[index + 1];
    b = data.data[index + 2];

    return { r: r, g: g, b: b };
}

let stack = [];

function boundaryFill(data, posisi, warna_to_stop, warna_to_warna) {
    stack.push({ x: posisi.x, y: posisi.y });
    while (stack.length > 0) {
        let { x, y } = stack.pop();
        let index = (x + y * canvas.width) * 4;

        let { r, g, b } = getTitik(data, { x: x, y: y })
        if (r != warna_to_stop.r && g != warna_to_stop.g && b != warna_to_stop.b && r != warna_to_warna.r && g != warna_to_warna.g && b != warna_to_warna.b) {

            data.data[index] = warna_to_warna.r;
            data.data[index + 1] = warna_to_warna.g;
            data.data[index + 2] = warna_to_warna.b;
            data.data[index + 3] = 255;

            stack.push({ x: x + 1, y: y })
            stack.push({ x: x, y: y + 1 })
            stack.push({ x: x - 1, y: y })
            stack.push({ x: x, y: y - 1 })
        }
    }
    ctx.putImageData(dataGambar, 0, 0);

}

function drawDot(data, posisi, warna) {
    let { x, y } = posisi;
    let { r, g, b } = warna;
    let index = (x + y * canvas.width) * 4;

    data.data[index] = r;
    data.data[index + 1] = g;
    data.data[index + 2] = b;
    data.data[index + 3] = 255;

}

function kotakTitik(data, titik, warna) {
    garis(dataGambar, { x: titik[0][0], y: titik[0][1] }, { x: titik[1][0], y: titik[1][1] }, warna);
    garis(dataGambar, { x: titik[1][0], y: titik[1][1] }, { x: titik[2][0], y: titik[2][1] }, warna);
    garis(dataGambar, { x: titik[2][0], y: titik[2][1] }, { x: titik[3][0], y: titik[3][1] }, warna);
    garis(dataGambar, { x: titik[3][0], y: titik[3][1] }, { x: titik[0][0], y: titik[0][1] }, warna);
}


function garis(data, awal, akhir, warna) {
    let x1 = awal.x;
    let y1 = awal.y;
    let x2 = akhir.x;
    let y2 = akhir.y;

    let dX = x2 - x1;
    let dY = y2 - y1;

    if (Math.abs(dY) > Math.abs(dX)) {
        // jalan berdasarkan y
        let x = x1;
        if (y1 > y2) {
            for (let y = y1; y >= y2; y -= 1) {
                x -= dX / dY;
                drawDot(data, { x: Math.floor(x), y: Math.floor(y) }, warna);
            }
        }
        else {
            for (let y = y1; y <= y2; y += 1) {
                x += dX / dY;
                drawDot(data, { x: Math.round(x), y: Math.round(y) }, warna);
            }
        }
    }
    else {
        // jalan berdasarkan x
        let y = y1;
        if (x1 > x2) {
            for (let x = x1; x >= x2; x -= 1) {
                y -= dY / dX;
                drawDot(data, { x: Math.round(x), y: Math.round(y) }, warna);
            }
        }
        else {
            for (let x = x1; x <= x2; x += 1) {
                y += dY / dX;
                drawDot(data, { x: Math.round(x), y: Math.round(y) }, warna);
            }
        }

    }
}


function lingkaran(data, xc, yc, r, warna) {
    for (let theta = 0; theta < 90; theta += 0.01) {
        let x = r * (Math.cos(theta * Math.PI / 180));
        let y = r * (Math.sin(theta * Math.PI / 180));

        drawDot(data, { x: Math.round(x + xc), y: Math.round(y + yc) }, warna);
        drawDot(data, { x: Math.round(x + xc), y: Math.round(-y + yc) }, warna);
        drawDot(data, { x: Math.round(-x + xc), y: Math.round(y + yc) }, warna);
        drawDot(data, { x: Math.round(-x + xc), y: Math.round(-y + yc) }, warna);
    }
}

class MatrixGrafkom {

    static multiplyMatrix(m1, m2) {
        let m3 = this.createBlank();

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    m3[i][j] += m1[i][k] * m2[k][j];
                }
            }
        }
        return m3;
    }

    static createBlank() {
        return [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
    }

    static createIdentity() {
        return [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ];
    }

    static createTranslation(t) {
        let [Tx, Ty] = t;
        return [
            [1, 0, Tx],
            [0, 1, Ty],
            [0, 0, 1],
        ];
    }

    static createScale(s) {
        let [Sx, Sy] = s;
        return [
            [Sx, 0, 0],
            [0, Sy, 0],
            [0, 0, 1]
        ]
    }


    static createFixedPointScale(c, s) {
        let [Cx, Cy] = c;
        let matrix_trans = this.createTranslation([-Cx, -Cy]);
        let matrix_scale = this.createScale(s);
        let matrix_back = this.createTranslation([Cx, Cy]);
        let matrix_multiply = this.multiplyMatrix(matrix_scale, matrix_trans);
        return this.multiplyMatrix(matrix_back, matrix_multiply);
    }

    static createRotation(angle) {
        let theta = angle * Math.PI/180;
        return [
            [Math.cos(theta), -Math.sin(theta), 0],
            [Math.sin(theta), Math.cos(theta), 0],
            [0, 0, 1]
        ]
    }

    static createFixedPointRotation(c, angle) {
        let [Cx, Cy] = c;
        let matrix_trans = this.createTranslation([-Cx, -Cy]);
        let matrix_rotate = this.createRotation(angle);
        let matrix_back = this.createTranslation([Cx, Cy]);
        let matrix_multiply = this.multiplyMatrix(matrix_rotate, matrix_trans);
        return this.multiplyMatrix(matrix_back, matrix_multiply);
    }


    static transformPoint(p, m) {
        let [x, y] = p;
        let xR = m[0][0] * x + m[0][1] * y + m[0][2];
        let yR = m[1][0] * x + m[1][1] * y + m[1][2];

        return [Math.round(xR), Math.round(yR)];
    }

    static transformPoints(points, m) {
        let result = [];
        points.forEach(p => {
            result.push(this.transformPoint(p, m));
        });
        return result;
    }

}


function polygon(points, color) {
    ctx.strokeStyle = color;

    let [x0, y0] = points[0];
    ctx.moveTo(x0, y0);
    ctx.beginPath();
    points.forEach((p) => {
        let [x, y] = p;
        ctx.lineTo(x, y);
        ctx.moveTo(x, y);
    });
    ctx.lineTo(x0, y0);
    ctx.stroke();

    ctx.strokeStyle = "black";
}

