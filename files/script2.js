import opentype from "opentype.js";

// Ścieżka do pliku TTF
const fontPath = '../fonts/Comic Sans MS Bold.ttf';
const fontSize = 72;
const text = `æåÂÆ
123`;

// TODO: Poprawić
const textureWidth = '180';
const textureHeight = '100';

opentype.load(fontPath, (err, font) => {
    if (err) {
        console.error('Błąd podczas wczytywania czcionki:', err);
        return;
    }

    // Oblicz szerokość całego tekstu
    let totalWidth = 0;
    for (const char of text) {
        const glyph = font.charToGlyph(char);
        totalWidth += glyph.advanceWidth * (fontSize / font.unitsPerEm);
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

    let lineTextWidth = 0;
    let lineNumber = 1; // from 1
    const paths = [];
    for (const char of text) {
        if (char === '\n') { // jeśli enter
            lineNumber++;
            lineTextWidth = 0;
            continue;
        }
        const glyph = font.charToGlyph(char);
        const pathData = glyph.getPath(lineTextWidth, fontSize * lineNumber, fontSize);
        const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        paths.push(svgPath);
        svgPath.setAttribute('d', pathData.toPathData());
        svgPath.setAttribute('fill', `url(#${myPattern})`);
        // https://stackoverflow.com/questions/18580389/svg-transparent-background-web
        // svgPath.setAttribute('fill',"none");
        svgElement.appendChild(svgPath);
        lineTextWidth += glyph.advanceWidth * (fontSize / font.unitsPerEm);
    }

    const svgContainer = document.createElement("div");
    svgContainer.id = "svg-container"

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
});