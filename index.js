"use strict";
// constants for all canvases
const zoomStart = Math.log(1e-10);
const zoomStop = Math.log(2.3);
// const colors = [
//     [3, 7, 30],
//     [55, 6, 23],
//     [106, 4, 15],
//     [157, 2, 8],
//     [208, 0, 0],
//     [220, 47, 2],
//     [232, 93, 4],
//     [244, 140, 6],
//     [250, 163, 7],
//     [255, 186, 8],
// ];
// const colors = [
//     [66, 30, 15],
//     [25, 7, 26],
//     [9, 1, 47],
//     [4, 4, 73],
//     [0, 7, 100],
//     [12, 44, 138],
//     [24, 82, 177],
//     [57, 125, 209],
//     [134, 181, 229],
//     [211, 236, 248],
//     [241, 233, 191],
//     [248, 201, 95],
//     [255, 170, 0],
//     [204, 128, 0],
//     [153, 87, 0],
//     [106, 52, 3],
//     [250, 201, 184],
// ];
const colors = [
    [66, 30, 15],
    [25, 7, 26],
    [9, 1, 47],
    [4, 4, 73],
    [0, 7, 100],
    [12, 44, 138],
    [24, 82, 177],
    [211, 236, 248],
    [241, 233, 191],
    [248, 201, 95],
    [255, 170, 0],
    [204, 128, 0],
    [153, 87, 0],
    [106, 52, 3],
    [250, 201, 184],
];
// useful functions
/*
 * This function maps a number from one range to another
 */
const mapRange = (n, initialRangeStart, initialRangeStop, newRangeStart, newRangeEnd) => {
    const initialRange = initialRangeStop - initialRangeStart;
    const newRange = newRangeEnd - newRangeStart;
    return ((n - initialRangeStart) / initialRange) * newRange + newRangeStart;
};
/*
 * This function converts a linearly increasing value to a logarithmically increasing one
 */
const convertSliderToLog = (val) => {
    const inputStart = 100;
    const inputStop = 0;
    const outputStart = zoomStart;
    const outputStop = zoomStop;
    const scale = (outputStop - outputStart) / (inputStop - inputStart);
    return Math.exp((val - inputStart) * scale + outputStart);
};
/*
 * This function draw the axes on the given canvas
 */
const drawAxes = (p, cartesianCoords) => {
    const planeCenter = {
        x: mapRange(0, cartesianCoords.x.start, cartesianCoords.x.stop, 0, p.width),
        y: mapRange(0, cartesianCoords.y.start, cartesianCoords.y.stop, 0, p.height),
    };
    // main axes
    p.stroke(255);
    p.line(0, planeCenter.y, p.width, planeCenter.y);
    p.line(planeCenter.x, 0, planeCenter.x, p.height);
    // screen axes
    p.stroke(100);
    p.line(0, p.height / 2, p.width, p.height / 2);
    p.line(p.width / 2, 0, p.width / 2, p.height);
};
/*
 * This function takes a zoom value and sets the plane space accordingly
 */
const updateZoom = (zoomValue, cartesianCoords, p) => {
    // calculate canvas size
    const offset = convertSliderToLog(zoomValue);
    const prevCenter = {
        x: (cartesianCoords.x.start + cartesianCoords.x.stop) / 2,
        y: (cartesianCoords.y.start + cartesianCoords.y.stop) / 2,
    };
    const smallerEdge = p.width < p.height ? p.width : p.height;
    const unitsPerPixel = 4 / smallerEdge;
    const offsetX = offset * (unitsPerPixel * p.width);
    const offsetY = offset * (unitsPerPixel * p.height);
    cartesianCoords.x.start = prevCenter.x - offsetX;
    cartesianCoords.x.stop = prevCenter.x + offsetX;
    cartesianCoords.y.start = prevCenter.y - offsetY;
    cartesianCoords.y.stop = prevCenter.y + offsetY;
};
/*
 * This function checks whether a given complex number goes to infinity
 */
const distToInf = (c, // for the mandelbrot, c is the pixel we are checking, and is constant for the julia set
zInitial // only for the julia set, this is the pixel to check
) => {
    /*
     * This function calculates the magnitude of any complex number
     */
    const magnitude = (z) => Math.sqrt(z.real * z.real + z.imag + z.imag);
    /*
     * This function is the main formula that is iterated
     */
    const iterate = (z) => {
        const square = {
            real: z.real * z.real - z.imag * z.imag,
            imag: 2 * z.real * z.imag,
        };
        return { real: square.real + c.real, imag: square.imag + c.imag };
    };
    const MAX_ITERATIONS = 500;
    const INFINITY = 16;
    let n = 0;
    let zNext = iterate(zInitial || { real: 0, imag: 0 });
    while (n < MAX_ITERATIONS) {
        if (magnitude(zNext) > INFINITY)
            break;
        zNext = iterate(zNext);
        n++;
    }
    return n;
};
/*
 * This function converts a screen coordinate to the corresponding cartestian coordinate
 */
const screenToCart = ({ x, y }, cartesianCoords, p) => {
    // desired range = [-2,    2   ]  (for each direction)
    // input   range = [ 0, width-1]  (for each direction)
    return {
        real: mapRange(x, 0, p.width, cartesianCoords.x.start, cartesianCoords.x.stop),
        imag: mapRange(y, 0, p.height, cartesianCoords.y.start, cartesianCoords.y.stop),
    };
};
/*
 * This is a function that creates the sketches
 */
const createSketch = () => {
    return (p) => {
        let cartesianCoords;
        let zoomValue = 7;
        let juliaSetSketch;
        p.setup = () => {
            // required setup
            p.createCanvas(p.windowWidth, p.windowHeight);
            p.pixelDensity(1);
            // set a nice font
            p.textFont("Roboto");
            p.textSize(7);
            updateInteractive();
            juliaSetSketch = setupInteractive();
        };
        p.draw = () => {
            p.background(255);
            p.loadPixels();
            renderFractal(p, 2);
            p.updatePixels();
            drawAxes(p, cartesianCoords);
        };
        p.windowResized = () => {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
            // p.(400, 200);
            updateInteractive();
        };
        /*
         * Handle dragging around of canvas
         */
        p.mousePressed = () => {
            // if this mousePress should be the one that orders the julia set to be created
            var _a;
            if (p.keyIsPressed && p.key === "Shift") {
                // first, clear anything that's already been set
                (_a = juliaSetSketch.firstChild) === null || _a === void 0 ? void 0 : _a.remove();
                juliaSetSketch.style.visibility = "visible";
                const img = p.createImage(Math.floor(p.width / 4), Math.floor(p.height / 4));
                img.loadPixels();
                renderFractal(img, 1, false, screenToCart({ x: p.mouseX, y: p.mouseY }, cartesianCoords, p));
                img.updatePixels();
                juliaSetSketch.appendChild(img.canvas);
            }
        };
        const renderFractal = (canvas, resScale = 1, isMandelbrotSet = true, pos = { real: -0.70176, imag: -0.3842 }) => {
            // loop through every pixel
            for (let x = 0; x < canvas.width - resScale + 1; x += resScale) {
                for (let y = 0; y < canvas.width - resScale + 1; y += resScale) {
                    //choose whether to display the mandelbrot set, or a particular julia set
                    const tempCol = isMandelbrotSet
                        ? distToInf(screenToCart({ x, y }, cartesianCoords, canvas))
                        : distToInf(pos, screenToCart({ x, y }, { x: { start: -2, stop: 2 }, y: { start: -2, stop: 2 } }, canvas));
                    const col = tempCol % colors.length;
                    for (let xOff = 0; xOff < resScale; xOff++) {
                        for (let yOff = 0; yOff < resScale; yOff++) {
                            const loc = (x + xOff + (y + yOff) * canvas.width) * 4;
                            canvas.pixels[loc + 0] = colors[col][0];
                            canvas.pixels[loc + 1] = colors[col][1];
                            canvas.pixels[loc + 2] = colors[col][2];
                            canvas.pixels[loc + 3] = 255;
                        }
                    }
                }
            }
        };
        p.mouseDragged = () => {
            if (p.mouseX >= 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
                const offset = convertSliderToLog(zoomValue);
                // tuning to make sure the distance moved by the mouse is the same as on the screen
                const movement = {
                    real: offset * -1.39e-2 * (p.mouseX - p.pmouseX),
                    imag: offset * -1.39e-2 * (p.mouseY - p.pmouseY),
                };
                cartesianCoords.x.start += movement.real;
                cartesianCoords.x.stop += movement.real;
                cartesianCoords.y.start += movement.imag;
                cartesianCoords.y.stop += movement.imag;
            }
        };
        const updateInteractive = () => {
            // set the value of cartesianCoords
            // first find the smaller edge of the screen so that everything fits on screen
            const smallerEdge = p.width < p.height ? p.width : p.height;
            /*
             * now, this edge should have a range of [-2, 2], or a size of 2, starting at -2
             * therefore, the units/pixel will be size/smallerEdge
             */
            const unitsPerPixel = 4 / smallerEdge;
            // finally, set the boundaries
            const halfXSize = (unitsPerPixel * p.width) / 2;
            const halfYSize = (unitsPerPixel * p.height) / 2;
            cartesianCoords = {
                x: { start: -halfXSize, stop: halfXSize },
                y: { start: -halfYSize, stop: halfYSize },
            };
        };
        const setupInteractive = () => {
            // helper functions
            const zoomIn = () => updateZoom(++zoomValue, cartesianCoords, p);
            const zoomOut = () => updateZoom(--zoomValue, cartesianCoords, p);
            // keyboard shortcuts for zooming
            const juliaSetDiv = document.createElement("div");
            juliaSetDiv.className = "inline-box";
            juliaSetDiv.style.left = p.mouseX + "px";
            juliaSetDiv.style.top = p.mouseY + "px";
            juliaSetDiv.style.width = Math.floor(p.width / 4) + "px";
            juliaSetDiv.style.height = Math.floor(p.height / 4) + "px";
            juliaSetDiv.style.borderRadius = "10px";
            juliaSetDiv.style.zIndex = "1";
            document.body.appendChild(juliaSetDiv);
            document.addEventListener("mousemove", (e) => {
                juliaSetDiv.style.left = e.pageX + "px";
                juliaSetDiv.style.top = e.pageY + "px";
            });
            document.addEventListener("keypress", (e) => {
                if (e.code === "Equal")
                    zoomIn();
                if (e.code === "Minus")
                    zoomOut();
                if (e.code === "KeyE")
                    juliaSetDiv.style.visibility = "hidden";
            });
            return juliaSetDiv;
        };
    };
};
/*
 * this is the main canvas, which displays the mandelbrot set
 */
new p5(createSketch());
