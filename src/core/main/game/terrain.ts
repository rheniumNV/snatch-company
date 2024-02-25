import { createNoise2D } from "simplex-noise";
import alea from "alea";

type Randomizer = ReturnType<typeof alea>;

const noise2D = createNoise2D();
export const solvePoint = (x: number, z: number) =>
  (noise2D(x / 5, z / 5) + 1) / 2;

type Biome = {
  type: "Grassland" | "Wasteland" | "Swamp" | "Forest";
  resource: number;
  plant: number;
  mineral: number;
  positionOffset: [number, number];
  positionScale: number;
  heightOffset: number;
  heightScale: number;
};

const generateBiomes = (randomizer: Randomizer): Biome[] => [
  {
    //草原
    type: "Grassland",
    resource: 0.8,
    plant: 0.5,
    mineral: 0.5,
    positionOffset: [randomizer() * 10, randomizer() * 10],
    positionScale: 1,
    heightOffset: 0.3,
    heightScale: 1,
  },
  {
    //荒野
    type: "Wasteland",
    resource: 0.4,
    plant: 0.3,
    mineral: 0.7,
    positionOffset: [randomizer() * 10, randomizer() * 10],
    positionScale: 1,
    heightOffset: 0.2,
    heightScale: 1,
  },
  {
    //沼地
    type: "Swamp",
    resource: 0.6,
    plant: 0.7,
    mineral: 0.3,
    positionOffset: [randomizer() * 10, randomizer() * 10],
    positionScale: 1,
    heightOffset: 0.2,
    heightScale: 1,
  },
  {
    //森林
    type: "Forest",
    resource: 0.9,
    plant: 0.9,
    mineral: 0.1,
    positionOffset: [randomizer() * 10, randomizer() * 10],
    positionScale: 1,
    heightOffset: 0.3,
    heightScale: 1,
  },
];

export class Terrain {
  randomizer: Randomizer;
  simplexNoise: ReturnType<typeof createNoise2D>;
  biomes: Biome[];

  constructor(randomizer: Randomizer) {
    this.randomizer = randomizer;
    this.simplexNoise = createNoise2D(this.randomizer);
    this.biomes = generateBiomes(this.randomizer);
  }

  biomeAt(x: number, z: number): Biome["type"] {
    const noises = this.biomes.map(
      (biome) =>
        this.simplexNoise(
          biome.positionOffset[0] + x * biome.positionScale,
          biome.positionOffset[1] + z * biome.positionScale
        ) *
          biome.heightScale +
        biome.heightOffset
    );
    const [top, second] = [...noises].sort((a, b) => a - b);
    const def = top - second;
    const fixedNoises = noises.map((noise) =>
      noise === top ? 1 : noise === second ? 0.5 : 0
    );

    const biome = this.biomes[Math.floor(0 * this.biomes.length)] as Biome;
    return biome.type;
  }
}
