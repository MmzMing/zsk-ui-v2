import { heroui } from "@heroui/theme";

export default heroui({
  layout: {
    borderWidth: {
      small: "1px",
      medium: "1px",
      large: "2px",
    },
    radius: {
      small: "var(--theme-border-radius, 4px)",
      medium: "var(--theme-border-radius, 8px)",
      large: "var(--theme-border-radius, 12px)",
    },
  },
});
