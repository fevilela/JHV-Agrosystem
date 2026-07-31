import { describe, it, expect } from "vitest";
import { checkFaixaAceitavel } from "./controle-qualidade";

describe("checkFaixaAceitavel", () => {
  it("reports DENTRO_FAIXA when the value falls within the acceptable range", () => {
    expect(checkFaixaAceitavel(5, 4, 6)).toBe("DENTRO_FAIXA");
  });

  it("treats the range boundaries as inclusive", () => {
    expect(checkFaixaAceitavel(4, 4, 6)).toBe("DENTRO_FAIXA");
    expect(checkFaixaAceitavel(6, 4, 6)).toBe("DENTRO_FAIXA");
  });

  it("reports FORA_FAIXA when the value falls outside the acceptable range", () => {
    expect(checkFaixaAceitavel(3.9, 4, 6)).toBe("FORA_FAIXA");
    expect(checkFaixaAceitavel(6.1, 4, 6)).toBe("FORA_FAIXA");
  });

  it("returns null when the obtained value is missing", () => {
    expect(checkFaixaAceitavel(null, 4, 6)).toBeNull();
  });

  it("returns null when the acceptable range is not fully defined", () => {
    expect(checkFaixaAceitavel(5, null, 6)).toBeNull();
    expect(checkFaixaAceitavel(5, 4, null)).toBeNull();
  });
});
