import {
  Difficulty,
  SpotDifferenceLevel,
  DifferenceSpot,
} from "../../../types";

// Sample images (base64 encoded) for our spot the difference game
// In a real app, you would have real images for different difficulties
// For this implementation, we'll generate SVG images with random differences

/**
 * Generate a spot the difference level based on difficulty
 */
export const generateSpotDifferenceLevel = (
  difficulty: Difficulty
): SpotDifferenceLevel => {
  // Number of differences based on difficulty
  let numDifferences: number;

  switch (difficulty) {
    case Difficulty.EASY:
      numDifferences = 5;
      break;
    case Difficulty.MEDIUM:
      numDifferences = 7;
      break;
    case Difficulty.HARD:
      numDifferences = 10;
      break;
    default:
      numDifferences = 5;
  }

  // Generate random differences
  const differences: DifferenceSpot[] = [];
  const imageSize = { width: 400, height: 300 };

  // Create non-overlapping difference spots
  for (let i = 0; i < numDifferences; i++) {
    const radius = Math.floor(Math.random() * 5) + 10; // 10-15px radius

    // Keep trying until we find a non-overlapping spot
    let attempts = 0;
    let foundSpot = false;
    let spot: DifferenceSpot;

    while (!foundSpot && attempts < 100) {
      // Generate a random position, with padding from edges
      const padding = radius * 2;
      const x =
        Math.floor(Math.random() * (imageSize.width - padding * 2)) + padding;
      const y =
        Math.floor(Math.random() * (imageSize.height - padding * 2)) + padding;

      spot = { x, y, radius, isFound: false };

      // Check if this spot overlaps with any existing spot
      const overlaps = differences.some((existingSpot) => {
        const distance = Math.sqrt(
          Math.pow(existingSpot.x - spot.x, 2) +
            Math.pow(existingSpot.y - spot.y, 2)
        );
        return distance < (existingSpot.radius + spot.radius) * 1.5; // Add buffer
      });

      if (!overlaps) {
        foundSpot = true;
        differences.push(spot);
      }

      attempts++;
    }
  }

  // Generate SVG images
  const baseImage = generateBaseSVG(imageSize);
  const image1 = baseImage;
  const image2 = generateModifiedSVG(baseImage, differences, imageSize);

  return {
    image1:
      "data:image/svg+xml;base64," + Buffer.from(image1).toString("base64"),
    image2:
      "data:image/svg+xml;base64," + Buffer.from(image2).toString("base64"),
    differences,
  };
};

/**
 * Generate base SVG image with random shapes
 */
const generateBaseSVG = (size: { width: number; height: number }): string => {
  const { width, height } = size;

  // Create SVG header
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

  // Add background
  svg += `<rect width="${width}" height="${height}" fill="#f5f5f5"/>`;

  // Add grid lines
  svg += `<g stroke="#e0e0e0" stroke-width="1">`;
  for (let i = 0; i < width; i += 20) {
    svg += `<line x1="${i}" y1="0" x2="${i}" y2="${height}"/>`;
  }
  for (let i = 0; i < height; i += 20) {
    svg += `<line x1="0" y1="${i}" x2="${width}" y2="${i}"/>`;
  }
  svg += `</g>`;

  // Add a house-like structure
  svg += `
    <rect x="100" y="150" width="200" height="120" fill="#e57373"/>
    <polygon points="100,150 200,80 300,150" fill="#ef9a9a"/>
    <rect x="150" y="200" width="40" height="70" fill="#795548"/>
    <rect x="220" y="180" width="30" height="30" fill="#90caf9"/>
    <rect x="120" y="180" width="30" height="30" fill="#90caf9"/>
  `;

  // Add a tree
  svg += `
    <rect x="50" y="200" width="20" height="70" fill="#795548"/>
    <circle cx="60" cy="170" r="30" fill="#81c784"/>
  `;

  // Add a sun
  svg += `
    <circle cx="320" cy="60" r="30" fill="#ffeb3b"/>
  `;

  // Close SVG
  svg += `</svg>`;

  return svg;
};

/**
 * Generate modified SVG with differences
 */
const generateModifiedSVG = (
  baseSVG: string,
  differences: DifferenceSpot[],
  size: { width: number; height: number }
): string => {
  // Parse the base SVG to modify it
  let modifiedSVG = baseSVG;

  // Add/modify elements at each difference spot
  differences.forEach((spot, index) => {
    const { x, y, radius } = spot;

    // Different modification based on spot index
    const modType = index % 5;

    // Replace closing </svg> with our modifications
    const svgCloseTag = `</svg>`;
    let modification = "";

    switch (modType) {
      case 0: // Add a star
        modification = `
          <polygon 
            points="${x},${y - radius} ${x + radius / 2},${y - radius / 3} ${
          x + radius
        },${y - radius} ${x + radius / 3},${y - radius / 2} ${
          x + radius
        },${y} ${x},${y + radius / 3} ${x - radius},${y} ${x - radius / 3},${
          y - radius / 2
        } ${x - radius},${y - radius} ${x - radius / 2},${y - radius / 3}"
            fill="#ffd54f"
          />
        `;
        break;
      case 1: // Change a color
        // Add a colored circle
        modification = `
          <circle cx="${x}" cy="${y}" r="${radius}" fill="#ce93d8"/>
        `;
        break;
      case 2: // Add a small cloud
        modification = `
          <g transform="translate(${x - radius}, ${y - radius})">
            <circle cx="${radius * 0.7}" cy="${radius}" r="${
          radius * 0.7
        }" fill="white"/>
            <circle cx="${radius * 1.4}" cy="${radius}" r="${
          radius * 0.8
        }" fill="white"/>
            <circle cx="${radius}" cy="${radius * 0.7}" r="${
          radius * 0.6
        }" fill="white"/>
          </g>
        `;
        break;
      case 3: // Add a flower
        modification = `
          <g transform="translate(${x}, ${y})">
            <circle cx="0" cy="0" r="${radius / 2}" fill="#f06292"/>
            <circle cx="${radius / 2}" cy="0" r="${radius / 3}" fill="#f06292"/>
            <circle cx="${-radius / 2}" cy="0" r="${
          radius / 3
        }" fill="#f06292"/>
            <circle cx="0" cy="${radius / 2}" r="${radius / 3}" fill="#f06292"/>
            <circle cx="0" cy="${-radius / 2}" r="${
          radius / 3
        }" fill="#f06292"/>
            <circle cx="0" cy="0" r="${radius / 4}" fill="#ffeb3b"/>
          </g>
        `;
        break;
      case 4: // Add a small bird
        modification = `
          <g transform="translate(${x}, ${y})">
            <path d="M0,0 Q${radius},${-radius / 2} ${
          radius * 2
        },0 Q${radius},${radius / 2} 0,0 Z" fill="#90caf9"/>
            <circle cx="${radius * 2.2}" cy="${-radius * 0.1}" r="${
          radius / 4
        }" fill="black"/>
          </g>
        `;
        break;
    }

    modifiedSVG = modifiedSVG.replace(svgCloseTag, modification + svgCloseTag);
  });

  return modifiedSVG;
};
