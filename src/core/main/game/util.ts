export namespace Vector {
  export type Vector3 = [number, number, number];
  export type Vector4 = [number, number, number, number];

  export const add = (a: Vector3, b: Vector3): Vector3 => [
    a[0] + b[0],
    a[1] + b[1],
    a[2] + b[2],
  ];

  export const sub = (a: Vector3, b: Vector3): Vector3 => [
    a[0] - b[0],
    a[1] - b[1],
    a[2] - b[2],
  ];

  export const mul = (a: Vector3, b: number): Vector3 => [
    a[0] * b,
    a[1] * b,
    a[2] * b,
  ];

  export const div = (a: Vector3, b: number): Vector3 => [
    a[0] / b,
    a[1] / b,
    a[2] / b,
  ];

  export const dot = (a: Vector3, b: Vector3): number =>
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  export const cross = (a: Vector3, b: Vector3): Vector3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];

  export const length = (a: Vector3): number =>
    Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2);

  export const normalize = (a: Vector3): Vector3 => {
    const len = length(a);
    if (len === 0) {
      return [0, 0, 0];
    }
    return div(a, len);
  };

  export const distance = (a: Vector3, b: Vector3): number => length(sub(a, b));

  export const lookAtQuaternion = (from: Vector3, to: Vector3): Vector4 => {
    const target = Vector.normalize(Vector.sub(to, from));
    const norm: Vector3 = [0, 0, 1];
    const dot = Vector.dot(norm, target);
    const theta = Math.acos(dot) / 2;
    const cross = Vector.normalize(Vector.cross(norm, target));
    return [
      cross[0] * Math.sin(theta),
      cross[1] * Math.sin(theta),
      cross[2] * Math.sin(theta),
      Math.cos(theta),
    ];
  };

  export const lerp = (a: Vector3, b: Vector3, t: number): Vector3 =>
    add(mul(a, 1 - t), mul(b, t));
}

export const getRandom = <T>(list: T[]): T | undefined =>
  list[Math.floor(Math.random() * list.length)];

export const getDpsSample = (sectionLevel: number, triggerTime: number) => {
  return (
    60 *
    (1 +
      0.1 *
        ((sectionLevel - 1) * (10 + 2.5 * 5) +
          ((triggerTime + 30) % 30) * 2.5 +
          (triggerTime / 240) * 10)) *
    ([1, 1.2, 1.5, 2][sectionLevel] ?? 2)
  );
};

export const getIconUrl = (key: string) =>
  ({
    sword_normal:
      "resdb:///9ffd20e16d04506a89ace65d4a7259fbe3a926cf0400865ede973bd1872e291c.webp",
    sword_speed:
      "resdb:///e9ccd561ce375465cd3788815ed003a96497f77a70ef5da8a23806c3de77fefd.webp",
    sword_crit:
      "resdb:///166af30e873e56dc94eba2a41e9d88354302018da1bd032b9e215b12ee314cfa.webp",
    recharge:
      "resdb:///f9da462b6602bda4ff4273602144bf94d0d8ae00d367f5490bbb6e6a46ec3a89.webp",
    unique:
      "resdb:///1cfbf237847cfc1dadbf1663034b70fb7d836e4c733863e7d8146d55cfea39d9.webp",
    weapon_conversion:
      "resdb:///111ae0d3f71a9611b80206935899d6cb85de159246806d3f200fe1d0482581fc.webp",
    sword_anti:
      "resdb:///4dd31eb1e7ac0179f58f20a3f7d5d8ed172c4ed886d4179e03fbd8c59da93add.webp",
    special:
      "resdb:///60876dddf835bb5f37faf2cca0c99b28acde180beb31d61572a9caa1c1c8a9ef.webp",
    sword_enchantment:
      "resdb:///6fc0ff2e5c37abec4db98699b544387a2e2fe18d950dc37ef6146abaae0b3288.webp",
  }[key] ?? "");
