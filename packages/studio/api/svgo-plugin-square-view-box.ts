export const convertToSquareViewBoxPlugin = {
  name: "squareViewBox",
  type: "visitor",
  fn: () => ({
    root: {
      enter(root: any) {
        const svg = root.children.find(
          (node: any) => node.type === "element" && node.name === "svg"
        );

        if (!svg) return;

        const viewBox = svg.attributes.viewBox;
        if (!viewBox) return;

        const [x, y, w, h] = viewBox.split(/\s+/).map(Number);
        if (!w || !h) return;

        const size = Math.max(w, h);

        const dx = (size - w) / 2;
        const dy = (size - h) / 2;

        svg.attributes.viewBox = `${x - dx} ${y - dy} ${size} ${size}`;

        delete svg.attributes.width;
        delete svg.attributes.height;
      },
    },
  }),
};
