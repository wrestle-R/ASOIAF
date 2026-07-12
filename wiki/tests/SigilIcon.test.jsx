import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SigilIcon } from "../src/components/intro/SigilIcon.jsx";

describe("SigilIcon", () => {
  it("uses a monogram when optional heraldry fields are null", () => {
    render(
      <SigilIcon
        house={{ name: "House Martell", coatOfArms: null, color: "#d76b2d" }}
      />,
    );

    expect(screen.getByText("M")).toBeInTheDocument();
  });
});
