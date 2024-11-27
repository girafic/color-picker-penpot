import "./style.css";

const searchParams = new URLSearchParams(window.location.search);
document.body.dataset.theme = searchParams.get("theme") ?? "light";

const trackingStatus = document.getElementById("tracking-status");
const overrideColorCheckbox = document.getElementById(
  "override-color"
) as HTMLInputElement;
const asStrokeCheckbox = document.getElementById(
  "as-stroke"
) as HTMLInputElement;
const addToPaletteButton = document.getElementById("add-to-palette");

let selectionCount = 0;

window.addEventListener("message", async (event) => {
  if (event.data.type === "theme") {
    document.body.dataset.theme = event.data.content;
  }
  if (event.data.type === "success") {
    showNotification(event.data.content, "success");
  }
  if (event.data.type === "info") {
    showNotification(event.data.content, "info");
  }
  if (event.data.type === "error") {
    showNotification(event.data.content, "error");
  }
  if (event.data.type === "selectionCount") {
    selectionCount = event.data.count;
    if (trackingStatus) {
      trackingStatus.textContent = selectionCount.toString();
    }
    if (selectionCount === 0) {
      overrideColorCheckbox?.setAttribute("disabled", "true");
      asStrokeCheckbox?.setAttribute("disabled", "true");
    } else {
      overrideColorCheckbox?.removeAttribute("disabled");
      asStrokeCheckbox?.removeAttribute("disabled");
    }
  }
});

if (addToPaletteButton) {
  addToPaletteButton.addEventListener("click", () => {
    const colorText = document.getElementById("color-text");
    if (colorText) {
      const color = colorText.textContent;
      parent.postMessage({ type: "addToPalette", color: color }, "*");
    }
  });
}

const showNotification = (
  message: string,
  type: "info" | "success" | "error" = "info"
) => {
  const container = document.getElementById("notification-container");
  if (!container) return;
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  container.appendChild(notification);

  notification.offsetHeight;

  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      container.removeChild(notification);
    }, 300);
  }, 3000);
};

const copyToClipboard = (text: string): boolean => {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.classList.add("visually-hidden");
    document.body.appendChild(textarea);

    textarea.select();
    document.execCommand("copy");

    document.body.removeChild(textarea);

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const createEyedropper = async () => {
  const eyeDropperButton = document.getElementById("eyedropper");
  const colorPreview = document.getElementById("color-preview");
  const colorValue = document.getElementById("color-value") as HTMLInputElement;
  const colorText = document.getElementById("color-text");

  colorPreview?.addEventListener("click", () => {
    colorValue?.click();
  });

  colorValue?.addEventListener("input", (event) => {
    const input = event.target as HTMLInputElement;
    const color = input.value;

    if (colorPreview) {
      colorPreview.style.backgroundColor = color;
    }
    if (colorText) {
      colorText.textContent = color.toUpperCase();
    }
    if (selectionCount > 0) {
      parent.postMessage(
        {
          type: "colorSelected",
          color: color,
          override: overrideColorCheckbox?.checked,
          asStroke: asStrokeCheckbox?.checked,
        },
        "*"
      );
    }
  });

  colorValue?.addEventListener("change", async (event) => {
    const input = event.target as HTMLInputElement;
    const color = input.value;
    if (selectionCount === 0) {
      try {
        const success = copyToClipboard(color);
        if (success) {
          showNotification(`Copied ${color} to clipboard`, "success");
        } else {
          showNotification("Failed to copy to clipboard", "error");
        }
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
        showNotification("Failed to copy to clipboard", "error");
      }
    }
  });

  if ("EyeDropper" in window) {
    eyeDropperButton?.addEventListener("click", async () => {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        const color = result.sRGBHex;

        if (colorPreview && colorValue && colorText) {
          colorPreview.style.backgroundColor = color;
          colorValue.value = color;
          colorText.textContent = color.toUpperCase();
        }
        if (selectionCount === 0) {
          try {
            const success = copyToClipboard(color);
            if (success) {
              showNotification(`Copied ${color} to clipboard`, "success");
            } else {
              showNotification("Failed to copy to clipboard", "error");
            }
          } catch (err) {
            console.error("Failed to copy to clipboard:", err);
            showNotification("Failed to copy to clipboard", "error");
          }
        } else {
          parent.postMessage(
            {
              type: "colorSelected",
              color: color,
              override: overrideColorCheckbox?.checked,
              asStroke: asStrokeCheckbox?.checked,
            },
            "*"
          );
        }
      } catch (err) {
        console.error("Failed to pick color:", err);
      }
    });
  } else {
    eyeDropperButton?.setAttribute("disabled", "true");
    eyeDropperButton?.classList.add("visually-hidden");
    eyeDropperButton?.setAttribute(
      "title",
      "EyeDropper API not supported in this browser"
    );
    console.warn("EyeDropper API not supported");
  }
};

const initSelectionCount = () => {
  parent.postMessage(
    {
      type: "initSelectionCount",
    },
    "*"
  );
};

initSelectionCount();
createEyedropper();
