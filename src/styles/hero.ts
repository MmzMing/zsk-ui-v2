import { heroui } from "@heroui/theme";

export default heroui({
  layout: {
    borderWidth: {
      small: "1px",
      medium: "1px", // Default border width set to thin
      large: "2px",
    },
    radius: {
      small: "4px",
      medium: "8px", // Default radius set to sm (relative to typical component sizes)
      large: "12px",
    },
  },
});
