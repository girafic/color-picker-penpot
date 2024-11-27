penpot.ui.open("Color Picker", `?theme=${penpot.theme}`, {
  width: 240,
  height: 240,
});

let selectedShapes: any[] = [];

penpot.ui.onMessage(async (msg: any) => {
  if (msg.type === "initSelectionCount") {
    const count = penpot.selection.length;
    penpot.ui.sendMessage({
      type: "selectionCount",
      count: count,
    });
  }
  if (msg.type === "colorSelected") {
    const selectedItems = penpot.selection;

    selectedItems.map((item) => {
      if (msg.asStroke) {
        item.strokes = [
          {
            strokeColor: msg.color,
            strokeWidth: 1,
          },
        ];
      } else if (
        selectedShapes.includes(item.id) &&
        Array.isArray(item.fills) &&
        !msg.override
      ) {
        const currentFill = item.fills;
        currentFill.shift();
        if (currentFill) {
          item.fills = [{ fillColor: msg.color }, ...currentFill];
        }
      } else {
        if (Array.isArray(item.fills) && !msg.override) {
          item.fills = [{ fillColor: msg.color }, ...item.fills];
        } else {
          item.fills = [
            {
              fillColor: msg.color,
            },
          ];
        }
        selectedShapes.push(item.id);
      }
    });
  }
  if (msg.type === "addToPalette") {
    if (
      penpot.library.local.colors.find((c) => c.color === msg.color) !==
      undefined
    ) {
      penpot.ui.sendMessage({
        type: "error",
        content: "Color already in palette",
      });
      return;
    } else {
      const newColor = penpot.library.local.createColor();
      newColor.color = msg.color;
      newColor.name = msg.color;
      penpot.ui.sendMessage({
        type: "success",
        content: "Color added to palette",
      });
    }
  }
});

penpot.on("selectionchange", () => {
  const count = penpot.selection.length;
  selectedShapes = [];
  penpot.ui.sendMessage({
    type: "selectionCount",
    count: count,
  });
});

penpot.on("themechange", (theme) => {
  penpot.ui.sendMessage({
    type: "theme",
    content: theme,
  });
});
