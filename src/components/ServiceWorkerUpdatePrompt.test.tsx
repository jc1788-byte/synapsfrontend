import { StrictMode } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerAppServiceWorker } from "../lib/pwa.js";
import { ServiceWorkerUpdatePrompt } from "./ServiceWorkerUpdatePrompt.js";

vi.mock("../lib/pwa.js", () => ({
  registerAppServiceWorker: vi.fn(),
}));

const registerMock = vi.mocked(registerAppServiceWorker);

describe("ServiceWorkerUpdatePrompt", () => {
  beforeEach(() => {
    registerMock.mockReset();
    registerMock.mockReturnValue(() => undefined);
  });

  it("waits for consent before activating an update and prevents duplicate clicks", async () => {
    const user = userEvent.setup();
    const activate = vi.fn();

    render(
      <StrictMode>
        <ServiceWorkerUpdatePrompt />
      </StrictMode>,
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    const onUpdateAvailable = registerMock.mock.calls[0][0];
    act(() => onUpdateAvailable(activate));

    const updateButton = screen.getByRole("button", { name: "Update" });
    expect(updateButton).toBeInTheDocument();
    expect(activate).not.toHaveBeenCalled();

    await user.click(updateButton);

    expect(activate).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Updating…" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Updating…" }));
    expect(activate).toHaveBeenCalledTimes(1);
  });
});
