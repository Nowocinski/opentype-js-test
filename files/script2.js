import opentype from "opentype.js";

// Ścieżka do pliku TTF
const fontPath = '../fonts/Comic Sans MS Bold.ttf';

opentype.load(fontPath, (err, font) => {
    if (err) {
        console.error('Błąd podczas wczytywania czcionki:', err);
        return;
    }

    const fontSize = 72;
    const text = 'aabbccdd';

    // Oblicz szerokość całego tekstu
    let totalWidth = 0;
    for (const char of text) {
        const glyph = font.charToGlyph(char);
        totalWidth += glyph.advanceWidth * (fontSize / font.unitsPerEm);
    }

    // Utwórz obiekt SVG o dostosowanych wymiarach
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    // svgElement.setAttribute('width', totalWidth.toString());
    // svgElement.setAttribute('height', fontSize.toString());

    let x = 0;
    for (const char of text) {
        const glyph = font.charToGlyph(char);
        const pathData = glyph.getPath(x, fontSize, fontSize);
        const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        svgPath.setAttribute('d', pathData.toPathData());
        // https://stackoverflow.com/questions/18580389/svg-transparent-background-web
        // svgPath.setAttribute('fill',"none");
        svgElement.appendChild(svgPath);
        x += glyph.advanceWidth * (fontSize / font.unitsPerEm);
    }

    const svgContainer = document.createElement("div");

    svgContainer.appendChild(svgElement);
    svgContainer.style.border = "1px dashed red";
    document.body.appendChild(svgContainer);

    // optymalizacja wymiarów svg
    const bbox = svgElement.getBBox();
    console.log("bbox", bbox);
    const viewBox = [bbox.x, bbox.y, bbox.width, bbox.height].join(" ");
    svgElement.setAttribute("viewBox", viewBox);
});