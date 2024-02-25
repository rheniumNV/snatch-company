import {
  createColor,
  createSprite,
  createStyle,
  createUiUnlitMaterial,
} from "../../lib/styledUnit";

export const { StyledSpace, Color, Sprite, Material } = createStyle({
  Color: {
    background: createColor([0.2, 0.2, 0.2, 1]),
    backgroundRev: createColor([0.8, 0.8, 0.8, 1]),
    button: createColor([0.5, 0.5, 0.5, 1]),
    buttonText: createColor([0, 0, 0, 1]),
  },
  Sprite: {
    kadomaru: createSprite({
      url: "resdb:///d8495d0372ef5bb0f9eec8ad864ebf7bf7f699e713176821e6ed0f7826b78091.png",
      rect: [1, 1, 1, 1],
      borders: [0.33333, 0.33333, 0.33333, 0.33333],
      scale: 0.1,
      filterMode: "Anisotropic",
      wrapModeU: "Mirror",
      wrapModeV: "Mirror",
    }),
  },
  Material: {
    background: createUiUnlitMaterial({}),
  },
});
