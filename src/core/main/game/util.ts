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
          (triggerTime / 240) * 10))
  );
};
