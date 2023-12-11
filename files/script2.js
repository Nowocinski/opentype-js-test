import opentype from "opentype.js";

// Ścieżka do pliku TTF
const fontPath = '../fonts/Comic Sans MS Bold.ttf';
const fontSize = 72; // TODO: Bez znaczenia :/
let text = ``; // TODO: Poprawić pustę spację
const textPosition = 'CENTER'; // 'LEFT', 'RIGHT', 'CENTER'
const interligne = 0;

// TODO: Poprawić
const textureWidth = '180';
const textureHeight = '100';

let font;
const svgContainerName = 'svg-container';

const loadFont = async () => {
    await opentype.load(fontPath, (err, loadedFont) => {
        if (err) {
            throw new Error('Błąd podczas wczytywania czcionki:', err);
        }

        console.info('Czcionka została wczytana!');
        font = loadedFont;
    });
};


const createText = async () => {
    if (!font) {
        await loadFont();
    }

    // ----------------------------
    const createSvgImage = () => {
        // Utwórz obiekt SVGImageElement
        const svgImg = document.createElementNS('http://www.w3.org/2000/svg', 'image');

        // Ustaw atrybut 'href' dla obiektu SVGImageElement
        svgImg.setAttributeNS(
            'http://www.w3.org/1999/xlink',
            'href',
            '645188.jpg');

        // Dodaj dodatkowe atrybuty (jeśli są potrzebne)
        svgImg.setAttribute('x', '0');
        svgImg.setAttribute('y', '0');
        svgImg.setAttribute('width', textureWidth);
        svgImg.setAttribute('height', textureHeight);

        return svgImg;
    };
    const svgImage = createSvgImage();

    const myPattern = 'myPattern';
    const createSvgPattern = (svgImg) => {
        // Utwórz obiekt SVGPatternElement
        const svgPattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');

        // Ustaw atrybuty dla obiektu SVGPatternElement
        svgPattern.setAttribute('id', myPattern); // Ustaw unikalne ID dla wzoru
        svgPattern.setAttribute('x', '0'); // Pozycja X wzoru
        svgPattern.setAttribute('y', '0'); // Pozycja Y wzoru
        svgPattern.setAttribute('width', textureWidth); // Szerokość wzoru
        svgPattern.setAttribute('height', textureHeight); // Wysokość wzoru
        svgPattern.setAttribute('patternUnits', 'userSpaceOnUse'); // Jednostki dla wzoru

        // Dodaj utworzony obraz do obiektu SVGPatternElement
        svgPattern.appendChild(svgImage);

        return svgPattern;
    };

    const svgPattern = createSvgPattern(svgImage);

    // ----------------------------

    // Utwórz obiekt SVG o dostosowanych wymiarach
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.appendChild(svgPattern);
    // svgElement.setAttribute('width', totalWidth.toString());
    // svgElement.setAttribute('height', fontSize.toString());

    let lineNumber = 0;
    const linesData = [];
    const linesOfText = text.split('\n');
    for (const lineOfText of linesOfText) {
        let lineTextWidth = 0;
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.id = `line-number-${lineNumber}`;
        for (const char of lineOfText) {
            const glyph = font.charToGlyph(char);
            const pathData = glyph.getPath(lineTextWidth, fontSize * (lineNumber - 1), fontSize);
            const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            svgPath.setAttribute('d', pathData.toPathData());
            svgPath.setAttribute('fill', `url(#${myPattern})`);
            // https://stackoverflow.com/questions/18580389/svg-transparent-background-web
            // svgPath.setAttribute('fill',"none");
            // svgElement.appendChild(svgPath);
            lineTextWidth += glyph.advanceWidth * (fontSize / font.unitsPerEm);
            group.appendChild(svgPath);
        }

        svgElement.appendChild(group);
        lineNumber++;
        linesData.push({
            group,
            lineTextWidth
        });
    }

    // =======
    // Wyrównanie do prawej strony
    if (textPosition !== 'LEFT') {
        const maxWidth = Math.max(...linesData.map(({lineTextWidth}) => lineTextWidth));
        for (const lineData of linesData) {
            const difference = maxWidth - lineData.lineTextWidth;
            if (difference === 0) {
                continue;
            }

            let translationX;
            switch (textPosition) {
                case 'RIGHT':
                    translationX = difference;
                    break;
                case 'CENTER':
                    translationX = difference / 2;
                    break;
            }

            lineData.group.setAttribute('transform', `translate(${translationX},0)`);
        }
    }

    // =======

    const svgContainer = document.createElement("div");
    svgContainer.id = svgContainerName;
    svgContainer.style = `
    margin: 0 auto;
    padding-left: min(80px, 10%);
    padding-right: min(80px, 10%);
    padding-top: min(80px, 10%);`; // TODO: Poprawić

    // dodanie ramki
    svgElement.setAttribute("style", "border:1px dashed red")

    svgContainer.appendChild(svgElement);
    // svgContainer.style.border = "1px dashed red";
    document.body.appendChild(svgContainer);

    // optymalizacja wymiarów svg
    const bbox = svgElement.getBBox();
    // console.log("bbox", bbox);
    const viewBox = [bbox.x, bbox.y, bbox.width, bbox.height].join(" ");
    svgElement.setAttribute("viewBox", viewBox);
};

document.addEventListener('keydown', async ({key}) => {
    if (key.length === 1) {
        text = `${text}${key}`;
    } else if (key === 'Backspace') {
        text = text.slice(0, -1);
    } else if (key === 'Enter') {
        text = `${text}\n`;
    } else {
        return;
    }

    const oldTextContainer = document.getElementById(svgContainerName);
    if (oldTextContainer) {
        document.body.removeChild(oldTextContainer);
    }
    
    await createText();
});

await loadFont();