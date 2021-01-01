declare const p5: any;

// interfaces for all canvases

interface Complex {
    real: number;
    imag: number;
}

interface Point {
    x: number;
    y: number;
}

interface ValueRange {
    x: { start: number; stop: number };
    y: { start: number; stop: number };
}

// constants for all canvases

const zoomStart = Math.log(1e-10);
const zoomStop = Math.log(2.3);
const log2 = Math.log(2);

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

// const colors = [
//     [66, 30, 15],
//     [25, 7, 26],
//     [9, 1, 47],
//     [4, 4, 73],
//     [0, 7, 100],
//     [12, 44, 138],
//     [24, 82, 177],
//     [211, 236, 248],
//     [241, 233, 191],
//     [248, 201, 95],
//     [255, 170, 0],
//     [204, 128, 0],
//     [153, 87, 0],
//     [106, 52, 3],
//     [250, 201, 184],
// ];

// const colors = [
//     [255, 255, 255],
//     [220, 233, 233],
//     [185, 210, 210],
//     [156, 184, 188],
//     [133, 153, 165],
//     [111, 122, 142],
//     [89, 92, 121],
//     [66, 66, 92],
//     [44, 44, 62],
//     [21, 21, 30],
//     [0, 0, 0],
// ];

const colors = [
    [255.0, 255.0, 255.0],
    [238.59374409374408, 244.5, 244.49999763750137],
    [220.82030019530018, 233.125, 233.12499507812782],
    [203.04685629685628, 221.75, 221.7499925187543],
    [185.27341239841238, 210.375, 210.37498995938077],
    [167.49996849996847, 198.99999999999997, 198.99998740000726],
    [156.62499999999997, 184.812481054697, 188.49998503750862],
    [145.25, 169.17185872070831, 177.1249824781351],
    [133.87499999999997, 153.53123638671963, 165.74997991876157],
    [122.49999999999999, 137.89061405273094, 154.37497735938803],
    [111.12499999999999, 122.24999171874222, 142.9999748000145],
    [100.625, 107.81249417967574, 132.49997243751588],
    [89.25, 92.17187184568702, 121.12496987814235],
    [77.87499999999999, 77.87496952714346, 108.34782608695654],
    [66.49999999999997, 66.49997397823486, 92.52173913043481],
    [55.124999999999986, 55.12497842932627, 76.69565217391306],
    [44.625, 44.62498253802603, 62.08695652173915],
    [33.24999999999999, 33.24998698911743, 46.260869565217405],
    [21.875000000000007, 21.874991440208838, 30.434782608695663],
    [10.499999999999991, 10.499995891300246, 14.608695652173916],
    [0, 0, 0],
];

// useful functions

/*
 * This function maps a number from one range to another
 */

const mapRange = (
    n: number,
    initialRangeStart: number,
    initialRangeStop: number,
    newRangeStart: number,
    newRangeEnd: number
): number => {
    const initialRange = initialRangeStop - initialRangeStart;
    const newRange = newRangeEnd - newRangeStart;

    return ((n - initialRangeStart) / initialRange) * newRange + newRangeStart;
};

/*
 * This function converts a linearly increasing value to a logarithmically increasing one
 */

const convertSliderToLog = (val: number): number => {
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

const drawAxes = (p: any, cartesianCoords: ValueRange) => {
    const planeCenter: Point = {
        x: mapRange(0, cartesianCoords.x.start, cartesianCoords.x.stop, 0, p.width),
        y: mapRange(0, cartesianCoords.y.start, cartesianCoords.y.stop, 0, p.height),
    };

    // main axes
    p.stroke(255);
    p.line(0, planeCenter.y, p.width, planeCenter.y);
    p.line(planeCenter.x, 0, planeCenter.x, p.height);

    // screen axes

    const crosshairSize = 20;
    p.stroke(255, 200);
    p.line(p.width / 2 - crosshairSize, p.height / 2, p.width / 2 + crosshairSize, p.height / 2);
    p.line(p.width / 2, p.height / 2 - crosshairSize, p.width / 2, p.height / 2 + crosshairSize);
};

/*
 * This function takes a zoom value and sets the plane space accordingly
 */

const updateZoom = (zoomValue: number, cartesianCoords: ValueRange, p: any): void => {
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

const distToInf = (
    c: Complex, // for the mandelbrot, c is the pixel we are checking, and is constant for the julia set
    zInitial?: Complex // only for the julia set, this is the pixel to check
): number => {
    /*
     * This function calculates the magnitude of any complex number
     * won't take sqrt for performance reasons
     */

    const magnitude = (z: Complex): number => z.real * z.real + z.imag + z.imag;

    /*
     * This function is the main formula that is iterated
     */

    const iterate = (z: Complex): Complex => {
        const square: Complex = {
            real: z.real * z.real - z.imag * z.imag,
            imag: (z.real + z.real) * z.imag,
        };
        return { real: square.real + c.real, imag: square.imag + c.imag };
    };

    const MAX_ITERATIONS = 600;
    const INFINITY = 256;
    let n = 0;

    let zNext = iterate(zInitial || { real: 0, imag: 0 });

    while (magnitude(zNext) < INFINITY && n < MAX_ITERATIONS) {
        zNext = iterate(zNext);
        n++;
    }

    if (n < MAX_ITERATIONS) {
        const logZn = Math.log(magnitude(zNext)) / 2;
        const nu = Math.log(logZn / Math.log(16)) / Math.log(16);
        n = n + 1 - Math.floor(nu);
    }

    return n;
};

/*
 * This function converts a screen coordinate to the corresponding cartestian coordinate
 */

const screenToCart = ({ x, y }: Point, cartesianCoords: ValueRange, p: any): Complex => {
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

const createSketch = (isMandelbrotSet?: boolean, pos: Complex = { real: 0, imag: 0 }) => {
    return (p: any) => {
        let cartesianCoords: ValueRange;

        let zoomValue = 7;
        let resScale: number = 5;

        p.setup = () => {
            // required setup

            p.createCanvas(p.windowWidth, p.windowHeight);
            p.pixelDensity(1);

            // set a nice font

            p.textFont("Roboto");
            p.textSize(7);

            updateInteractive();
            setupInteractive();
        };

        p.draw = () => {
            p.background(255);

            p.loadPixels();

            renderFractal(p);

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

        p.mousePressed = (): void => {
            // if this mousePress should be the one that orders the julia set to be created

            if (isMandelbrotSet && p.keyIsPressed && p.key === "Shift") {
                const mousePos = screenToCart({ x: p.mouseX, y: p.mouseY }, cartesianCoords, p);
                window.open(window.location.origin + `?set=julia&real=${mousePos.real}&imag=${mousePos.imag}`);
            }
        };

        const renderFractal = (canvas: any) => {
            // loop through every pixel

            for (let x = 0; x < canvas.width - resScale + 1; x += resScale) {
                for (let y = 0; y < canvas.width - resScale + 1; y += resScale) {
                    //choose whether to display the mandelbrot set, or a particular julia set

                    const tempCol = isMandelbrotSet
                        ? distToInf(screenToCart({ x, y }, cartesianCoords, canvas))
                        : distToInf(pos, screenToCart({ x, y }, cartesianCoords, canvas));

                    const col = colors[tempCol % colors.length];

                    for (let xOff = 0; xOff < resScale; xOff++) {
                        for (let yOff = 0; yOff < resScale; yOff++) {
                            const loc = (x + xOff + (y + yOff) * canvas.width) * 4;

                            canvas.pixels[loc + 0] = col[0];
                            canvas.pixels[loc + 1] = col[1];
                            canvas.pixels[loc + 2] = col[2];
                            canvas.pixels[loc + 3] = 255;
                        }
                    }
                }
            }
        };

        p.mouseDragged = (): void => {
            if (!(p.mouseX < 180 && p.mouseY < 50)) {
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

        const updateInteractive = (): void => {
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

        const setupInteractive = (): void => {
            // helper functions

            const zoomIn = (): void => updateZoom(++zoomValue, cartesianCoords, p);

            const zoomOut = (): void => updateZoom(--zoomValue, cartesianCoords, p);

            // keyboard shortcuts for zooming

            document.addEventListener("keypress", (e: KeyboardEvent): void => {
                if (e.code === "Equal") zoomIn();
                if (e.code === "Minus") zoomOut();
            });

            (document.querySelector("input") as HTMLInputElement).onchange = e => {
                resScale = 9 - parseInt((e.target as HTMLInputElement).value);
            };
        };
    };
};

/*
 * this is the main canvas, which displays the mandelbrot set
 */

(() => {
    let paramString = window.location.search;

    paramString = paramString ? paramString : "set=mandelbrot";

    const splitParams = paramString.split("&");

    const allParamsArr = splitParams.map(str => str.split("="));

    const allParams: { [param: string]: string } = {};

    allParamsArr.forEach(pair => {
        allParams[pair[0]] = pair[1];
    });

    if (allParams.set !== "mandelbrot" && !(allParams.real && allParams.imag)) {
        window.location.replace(window.location.origin);
    }

    new p5(
        createSketch(allParams.set === "mandelbrot", {
            real: parseFloat(allParams.real) || 0,
            imag: parseFloat(allParams.imag) || 0,
        })
    );
})();
