/**
 * Written by Colin Price, 2/12/2025
 */
// make vscode happy :))))
// @ts-check
/* jshint -W069, -W141, esversion:6 */
export {};
/** @type {HTMLCanvasElement} */ let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
let context = canvas.getContext('2d');
if (!context) {
    throw new Error("context didn't work");
}

// I will draw Patrick Star!!!!!!!!!!!!

// draw the sky
context.lineWidth = 2;
context.fillStyle = "skyblue";
context.strokeStyle = "black";
context.beginPath();
context.moveTo(500, 500);
context.lineTo(0, 500);
context.lineTo(0, 0);
context.lineTo(500, 0);
context.closePath();
context.fill();
context.stroke();

// draw the sand/ground
context.fillStyle = "#f0deb4";
context.strokeStyle = "transparent";
context.beginPath();
context.moveTo(1, 325);
context.lineTo(499, 325);
context.lineTo(499, 499);
context.lineTo(1, 499);
context.closePath();
context.fill();
context.stroke();

// Draw Patrick's body!!!
context.fillStyle ="#ecb1b1"
context.strokeStyle = "#ea9999";
context.beginPath();
const bodyPoints = [
    {"x":281,"y":26}, {"x":273,"y":26}, {"x":270,"y":31}, {"x":264,"y":38}, {"x":261,"y":46},
    {"x":257,"y":52}, {"x":253,"y":59}, {"x":250,"y":67}, {"x":245,"y":76}, {"x":242,"y":87},
    {"x":239,"y":97}, {"x":237,"y":104}, {"x":234,"y":116}, {"x":232,"y":127}, {"x":230,"y":134},
    {"x":229,"y":145}, {"x":226,"y":153}, {"x":222,"y":161}, {"x":220,"y":169}, {"x":217,"y":185},
    {"x":214,"y":196}, {"x":202,"y":180}, {"x":193,"y":172}, {"x":183,"y":156}, {"x":174,"y":144},
    {"x":166,"y":137}, {"x":158,"y":132}, {"x":155,"y":141}, {"x":155,"y":148}, {"x":156,"y":164},
    {"x":159,"y":172}, {"x":164,"y":186}, {"x":167,"y":208}, {"x":173,"y":218}, {"x":178,"y":231},
    {"x":182,"y":243}, {"x":188,"y":256}, {"x":188,"y":269}, {"x":187,"y":280}, {"x":183,"y":290},
    {"x":182,"y":303}, {"x":182,"y":312}, {"x":181,"y":327}, {"x":181,"y":344}, {"x":182,"y":356},
    {"x":186,"y":372}, {"x":190,"y":385}, {"x":187,"y":395}, {"x":186,"y":409}, {"x":190,"y":414},
    {"x":193,"y":420}, {"x":193,"y":430}, {"x":194,"y":440}, {"x":202,"y":456}, {"x":213,"y":456},
    {"x":214,"y":436}, {"x":218,"y":424}, {"x":220,"y":411}, {"x":226,"y":411}, {"x":238,"y":411},
    {"x":249,"y":407}, {"x":255,"y":420}, {"x":254,"y":439}, {"x":260,"y":460}, {"x":270,"y":468},
    {"x":283,"y":450}, {"x":288,"y":424}, {"x":289,"y":405}, {"x":297,"y":388}, {"x":303,"y":365},
    {"x":308,"y":336}, {"x":307,"y":308}, {"x":304,"y":278}, {"x":310,"y":260}, {"x":322,"y":234},
    {"x":332,"y":209}, {"x":343,"y":188}, {"x":350,"y":164}, {"x":346,"y":149}, {"x":334,"y":149},
    {"x":325,"y":160}, {"x":319,"y":166}, {"x":310,"y":173}, {"x":308,"y":176}, {"x":298,"y":187},
    {"x":291,"y":195}, {"x":286,"y":205}, {"x":286,"y":188}, {"x":285,"y":161}, {"x":282,"y":146},
    {"x":281,"y":129}, {"x":278,"y":107}, {"x":279,"y":92}, {"x":281,"y":85}, {"x":280,"y":76},
    {"x":283,"y":63}, {"x":288,"y":54}, {"x":288,"y":40}, {"x":286,"y":32}
];
function drawPoints(points) {
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        if (i === 0) {
            // @ts-ignore
            context.moveTo(point.x, point.y);
        } else {
            // @ts-ignore
            context.lineTo(point.x, point.y);
        }
    }
}
drawPoints(bodyPoints);
context.closePath();
context.fill();
context.stroke();

// draw Patrick's pants
context.fillStyle = "#78d23e";
context.strokeStyle = "black";
context.beginPath();
const pantsPoints = [
    {"x":180,"y":312}, {"x":176,"y":321}, {"x":176,"y":329}, {"x":177,"y":337}, {"x":177,"y":346},
    {"x":178,"y":358}, {"x":180,"y":360}, {"x":180,"y":369}, {"x":184,"y":375}, {"x":188,"y":382},
    {"x":188,"y":387}, {"x":184,"y":393}, {"x":184,"y":397}, {"x":184,"y":400}, {"x":181,"y":407},
    {"x":187,"y":414}, {"x":190,"y":418}, {"x":200,"y":425}, {"x":204,"y":426}, {"x":220,"y":428},
    {"x":219,"y":428}, {"x":225,"y":421}, {"x":225,"y":416}, {"x":228,"y":415}, {"x":231,"y":415},
    {"x":231,"y":418}, {"x":243,"y":416}, {"x":245,"y":426}, {"x":248,"y":430}, {"x":254,"y":430},
    {"x":260,"y":434}, {"x":271,"y":436}, {"x":281,"y":433}, {"x":289,"y":428}, {"x":290,"y":416},
    {"x":290,"y":405}, {"x":296,"y":393}, {"x":304,"y":378}, {"x":307,"y":362}, {"x":308,"y":350},
    {"x":309,"y":339}, {"x":309,"y":321}, {"x":300,"y":329}, {"x":296,"y":336}, {"x":288,"y":344},
    {"x":279,"y":348}, {"x":268,"y":356}, {"x":251,"y":359}, {"x":240,"y":362}, {"x":231,"y":360},
    {"x":220,"y":356}, {"x":205,"y":349}, {"x":200,"y":340}, {"x":191,"y":331}, {"x":185,"y":322}
];
drawPoints(pantsPoints);
context.closePath();
context.fill();
context.stroke();

// Draw Patrick's eyes
context.fillStyle = "white";
context.strokeStyle = "black";
context.beginPath();
const eyePoints = [
    {"x":242,"y":132},{"x":238,"y":123},{"x":228,"y":123},{"x":225,"y":129},{"x":222,"y":136},
    {"x":220,"y":145},{"x":220,"y":154},{"x":220,"y":166},{"x":227,"y":177},{"x":234,"y":174},
    {"x":238,"y":167},{"x":238,"y":157},{"x":240,"y":144},{"x":244,"y":134},{"x":252,"y":126},
    {"x":260,"y":130},{"x":263,"y":139},{"x":263,"y":149},{"x":261,"y":157},{"x":260,"y":165},
    {"x":255,"y":174},{"x":248,"y":179},{"x":240,"y":173}
];
drawPoints(eyePoints);
context.closePath();
context.fill();
context.stroke();

// Draw Patrick's pupils
context.fillStyle = "black";
context.strokeStyle = "black";
context.beginPath();
const pupilPoints = [
    {"x":234,"y":144},{"x":230,"y":148},{"x":231,"y":150},{"x":231,"y":152},{"x":231,"y":154},
    {"x":232,"y":155},{"x":235,"y":153},{"x":235,"y":150},{"x":235,"y":145}
];
const pupilPoints2 = [
    {"x":250,"y":145},{"x":248,"y":147},{"x":247,"y":149},{"x":246,"y":151},
    {"x":246,"y":154},{"x":247,"y":156},{"x":248,"y":157},{"x":250,"y":157},
    {"x":251,"y":154},{"x":251,"y":149}
];
drawPoints(pupilPoints);
drawPoints(pupilPoints2);
context.closePath();
context.fill();
context.stroke();

// Draw Patrick's mouth
context.fillStyle = "darkred";
context.strokeStyle = "black";
context.beginPath();
const mouthPoints = [
    {"x":221,"y":197},{"x":225,"y":199},{"x":226,"y":203},{"x":226,"y":207},{"x":225,"y":210},
    {"x":225,"y":215},{"x":224,"y":219},{"x":223,"y":222},{"x":221,"y":226},{"x":218,"y":231},
    {"x":216,"y":234},{"x":213,"y":233},{"x":216,"y":237},{"x":218,"y":237},{"x":220,"y":240},
    {"x":224,"y":243},{"x":228,"y":244},{"x":232,"y":244},{"x":238,"y":244},{"x":243,"y":243},
    {"x":247,"y":240},{"x":252,"y":235},{"x":255,"y":229},{"x":257,"y":223},{"x":260,"y":219},
    {"x":262,"y":213},{"x":264,"y":204},{"x":266,"y":198},{"x":267,"y":191},{"x":267,"y":187},
    {"x":270,"y":189},{"x":265,"y":183},{"x":264,"y":188},{"x":260,"y":191},{"x":255,"y":193},
    {"x":253,"y":195},{"x":249,"y":197},{"x":244,"y":198},{"x":240,"y":199},{"x":235,"y":199},
    {"x":229,"y":198}
];
drawPoints(mouthPoints);
context.closePath();
context.fill();
context.stroke();

// Draw Patrick's tongue
context.fillStyle = "pink";
context.strokeStyle = "black";
context.beginPath();
const tonguePoints = [
    {"x":224,"y":242},{"x":226,"y":236},{"x":229,"y":231},{"x":232,"y":228},{"x":236,"y":226},
    {"x":241,"y":225},{"x":243,"y":226},{"x":240,"y":231},{"x":244,"y":228},{"x":247,"y":225},
    {"x":251,"y":224},{"x":255,"y":227},{"x":253,"y":230},{"x":251,"y":233},{"x":247,"y":236},
    {"x":245,"y":239},{"x":241,"y":241},{"x":236,"y":242},{"x":231,"y":243},{"x":226,"y":242}
];
drawPoints(tonguePoints);
context.closePath();
context.fill();
context.stroke();

// Draw Patrick's eyebrows!
context.fillStyle = "black";
context.strokeStyle = "black";
context.beginPath();
const eyebrowPoints1 = [
    {"x":236,"y":99},{"x":238,"y":98},{"x":240,"y":96},{"x":242,"y":95},{"x":242,"y":95},
    {"x":241,"y":97},{"x":239,"y":99},{"x":237,"y":102},{"x":236,"y":105},{"x":238,"y":103},
    {"x":240,"y":102},{"x":243,"y":100}
];
const eyebrowPoints2 = [
    {"x":256,"y":100},{"x":258,"y":102},{"x":260,"y":104},{"x":262,"y":106},{"x":263,"y":108},
    {"x":259,"y":107},{"x":254,"y":104},{"x":255,"y":106},{"x":257,"y":108},{"x":259,"y":110},
    {"x":261,"y":112},{"x":261,"y":113}
];
drawPoints(eyebrowPoints1);
drawPoints(eyebrowPoints2);
context.closePath();
context.fill();
context.stroke();

// Draw Patrick's arm lines!
context.fillStyle = "transparent";
context.strokeStyle = "#ea9999";
context.beginPath();
const armLinePoints1 = [
    {"x":215,"y":195},{"x":212,"y":205},{"x":210,"y":209},{"x":209,"y":212},{"x":207,"y":217},
    {"x":205,"y":222},{"x":203,"y":228},{"x":202,"y":232},{"x":200,"y":236},{"x":199,"y":240},
    {"x":196,"y":244},{"x":195,"y":249},{"x":194,"y":252},{"x":192,"y":257},{"x":189,"y":270}
];
const armLinePoints2 = [
    {"x":287,"y":203},{"x":276,"y":222}
];
const armLinePoints3 = [
    {"x":315,"y":251},{"x":295,"y":295}
];
drawPoints(armLinePoints1);
drawPoints(armLinePoints2);
drawPoints(armLinePoints3);
context.closePath();
context.stroke();

// Draw Patrick's pants flowers!!!
context.fillStyle = "#a594da";
context.strokeStyle = "#7b5ba4";
context.beginPath();
const flowerPoints1 = [
    {"x":190,"y":340},{"x":189,"y":344},{"x":189,"y":346},{"x":189,"y":349},{"x":189,"y":352},
    {"x":190,"y":354},{"x":190,"y":357},{"x":191,"y":359},{"x":192,"y":360},{"x":193,"y":361},
    {"x":195,"y":360},{"x":197,"y":358},{"x":199,"y":358},{"x":200,"y":361},{"x":199,"y":363},
    {"x":198,"y":365},{"x":196,"y":369},{"x":195,"y":373},{"x":196,"y":377},{"x":198,"y":381},
    {"x":204,"y":386},{"x":208,"y":389},{"x":212,"y":390},{"x":215,"y":389},{"x":217,"y":388},
    {"x":218,"y":384},{"x":219,"y":379},{"x":220,"y":375},{"x":222,"y":375},{"x":224,"y":376},
    {"x":224,"y":379},{"x":225,"y":381},{"x":226,"y":383},{"x":228,"y":384},{"x":230,"y":385},
    {"x":233,"y":383},{"x":234,"y":379},{"x":236,"y":375},{"x":237,"y":371},{"x":236,"y":368},
    {"x":231,"y":367},{"x":226,"y":365},{"x":222,"y":363},{"x":216,"y":361},{"x":213,"y":358},
    {"x":208,"y":355},{"x":204,"y":352},{"x":199,"y":348},{"x":194,"y":343}
];
const flowerPoints2 = [
    {"x":299,"y":378},{"x":297,"y":376},{"x":293,"y":376},{"x":290,"y":378},{"x":287,"y":380},
    {"x":285,"y":384},{"x":281,"y":389},{"x":280,"y":393},{"x":282,"y":397},{"x":285,"y":401},
    {"x":285,"y":408},{"x":284,"y":412},{"x":281,"y":412},{"x":277,"y":411},{"x":275,"y":413},
    {"x":275,"y":417},{"x":273,"y":422},{"x":273,"y":426},{"x":273,"y":428},{"x":273,"y":428},
    {"x":272,"y":430},{"x":274,"y":433},{"x":278,"y":433},{"x":282,"y":431},{"x":285,"y":429},
    {"x":288,"y":427},{"x":289,"y":420},{"x":289,"y":413},{"x":289,"y":413},{"x":289,"y":407},
    {"x":290,"y":401},{"x":293,"y":396},{"x":296,"y":390},{"x":300,"y":384},{"x":302,"y":379}
];
drawPoints(flowerPoints1);
drawPoints(flowerPoints2);
context.closePath();
context.fill();
context.stroke();

// Draw Patrick's belly button and pants lines!
context.fillStyle = "transparent";
context.strokeStyle = "black";
context.beginPath();
const bellyButtonPoints1 = [
    {"x":210,"y":328},{"x":210,"y":330},{"x":211,"y":333},{"x":212,"y":336},{"x":214,"y":338},
    {"x":218,"y":339},{"x":220,"y":339},{"x":223,"y":337}
];
const bellyButtonPoints2 = [
    {"x":216,"y":323},{"x":215,"y":326},{"x":215,"y":328},{"x":216,"y":329},{"x":218,"y":331},{"x":220,"y":331}
];
const pantsLinesPoints1 = [
    {"x":176,"y":318},{"x":179,"y":322},{"x":182,"y":325},{"x":184,"y":328},{"x":186,"y":332},{"x":187,"y":334},
    {"x":189,"y":337},{"x":192,"y":340},{"x":193,"y":342},{"x":195,"y":345},{"x":198,"y":347},{"x":201,"y":351},
    {"x":203,"y":353},{"x":206,"y":355},{"x":209,"y":356},{"x":212,"y":358},{"x":216,"y":360},{"x":221,"y":363},
    {"x":226,"y":365},{"x":231,"y":367},{"x":237,"y":368},{"x":242,"y":368},{"x":246,"y":368},{"x":251,"y":367},
    {"x":255,"y":366},{"x":260,"y":365},{"x":265,"y":364},{"x":269,"y":362},{"x":272,"y":360},{"x":275,"y":358},
    {"x":278,"y":356},{"x":284,"y":353},{"x":287,"y":350},{"x":290,"y":348},{"x":293,"y":347},{"x":297,"y":344},
    {"x":301,"y":340},{"x":304,"y":335},{"x":308,"y":325},{"x":310,"y":322}
];
const pantsLinesPoints2 = [
    {"x":189,"y":382},{"x":191,"y":385},{"x":193,"y":387},{"x":196,"y":391},{"x":198,"y":394},{"x":201,"y":397},
    {"x":203,"y":398},{"x":206,"y":402},{"x":210,"y":406},{"x":212,"y":407},{"x":215,"y":408},{"x":217,"y":410},
    {"x":220,"y":412},{"x":223,"y":414},{"x":228,"y":416},{"x":231,"y":416},{"x":236,"y":416},{"x":238,"y":416},
    {"x":241,"y":415},{"x":242,"y":414},{"x":244,"y":416},{"x":244,"y":410},{"x":245,"y":405}
];
drawPoints(bellyButtonPoints1);
drawPoints(bellyButtonPoints2);
drawPoints(pantsLinesPoints1);
drawPoints(pantsLinesPoints2);
context.stroke();

context.save();

// Draw bubbles with varying transparencies in select x locations above y 300
const bubbles = [
    {x:50, y:100, radius:10, alpha:0.3},
    {x:80, y:150, radius:15, alpha:0.4},
    {x:150, y:60, radius:20, alpha:0.5},
    {x:330, y:80, radius:18, alpha:0.3},
    {x:390, y:30, radius:7, alpha:0.4},
    {x:400, y:130, radius:25, alpha:0.5},
    {x:450, y:50, radius:12, alpha:0.4},
];

bubbles.forEach(bubble => {
    context.beginPath();
    context.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(255, 255, 255, ${bubble.alpha})`;
    context.fill();
    context.strokeStyle = "#E7FEFF"; // bubble outline color
    context.stroke();
});

// Draw a flower using bezier curves in the top left corner :)
context.fillStyle = "transparent";
context.strokeStyle = "purple";
context.lineWidth = 7;
context.globalAlpha = 0.5;
context.shadowBlur = 7;
context.shadowColor = "purple";
context.beginPath();
context.moveTo(-5, 100);
context.bezierCurveTo(30, 75, 5, 30, 43, 65);
context.bezierCurveTo(60, 80, 65, 60, 50, 30);
context.bezierCurveTo(40, 0, 85, 30, 60, -10);
context.stroke();
context.lineWidth = 4;
context.beginPath();
context.moveTo(-5, 60);
context.bezierCurveTo(20, 40, 0, 15, 26, 30);
context.bezierCurveTo(40, 40, 35, 10, 26, 15);
context.bezierCurveTo(20, 13, 10, -5, 70, -10);
context.stroke();

context.restore();

// Function to draw dots on patrick and the sand
function drawDot(x, y) {
    // @ts-ignore
    context.moveTo(x, y);
    // @ts-ignore
    context.beginPath();
    // @ts-ignore
    context.lineWidth = 0;
    // @ts-ignore
    context.globalAlpha = .5;
    // @ts-ignore
    context.arc(x, y, 2, 0, Math.PI * 2);
    // @ts-ignore
    context.fillStyle = "gray";
    // @ts-ignore
    context.fill();
    // @ts-ignore
}
// Draw dots on the sand
drawDot(100, 400);
drawDot(150, 410);
drawDot(50, 450);
drawDot(60, 370);
drawDot(190, 470);
drawDot(130, 450);
drawDot(130, 360);
drawDot(350, 410);
drawDot(390, 430);
drawDot(430, 370);
drawDot(460, 450);
drawDot(460, 390);
drawDot(420, 480);
drawDot(350, 470);
drawDot(360, 370);
context.restore();

// Draw dots on Patrick
context.fillStyle = "darkpink";
const dotCoordinates = [{"x":314,"y":223},{"x":240,"y":310},{"x":217,"y":257},{"x":194,"y":291},{"x":185,"y":186},{"x":269,"y":61}];
dotCoordinates.forEach(coord => {
    drawDot(coord.x, coord.y);
});


// Save the image to be able to redraw it after exiting coordinate mode
const savedImage = context.getImageData(0, 0, canvas.width, canvas.height);

// Code for tracing outlines to get coordinates!!!
// Got help from Copilot to generate this code; press I to enter coordinate mode, press S to save the coordinates, and press Esc to exit coordinate mode :D
document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "i") {
        context.globalAlpha = 1;
        const image = new Image();
        image.src = "/images/patrick-star.jpg"; // load image
        image.onload = () => {
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
        };

        // Store the clicked points
        const points = [];

        // Define a click handler to store the clicked points
        const clickHandler = (event) => {
            const rect = canvas.getBoundingClientRect(); // get the size of the canvas
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            points.push({ x, y });

            // Draw a small circle to mark the clicked point
            context.fillStyle = "red";
            context.beginPath();
            context.arc(x, y, 3, 0, Math.PI * 2);
            context.fill();

            console.log(`Clicked at: (${x}, ${y})`);
        };

        canvas.addEventListener("click", clickHandler);

        // Define a save handler for 'S' key to save points as an array :)))
        const saveHandler = (event) => {
            if (event.key.toLowerCase() === "s") {
                console.log("Saved Coordinates:");
                console.log(JSON.stringify(points));
            }
        };

        document.addEventListener("keydown", saveHandler);
        
        // Define an exit handler for the Esc key to exit coordinate mode yoooo
        const exitHandler = (event) => {
            if (event.key === "Escape") {
            canvas.removeEventListener("click", clickHandler);
            document.removeEventListener("keydown", saveHandler);
            document.removeEventListener("keydown", exitHandler);
            // Clear the canvas to hide the image
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Redraw the original image
            context.putImageData(savedImage, 0, 0);
            console.log("Exited coordinate mode and redrew original image.");
            }
        };

        document.addEventListener("keydown", exitHandler);
    };
});