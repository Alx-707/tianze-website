import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Unmock zod to use real validation in this test file
vi.unmock("zod");

async function callPOST(request: NextRequest) {
  const { POST } = await import("../route");
  return POST(request);
}

async function callGET() {
  const { GET } = await import("../route");
  return GET();
}

async function callOPTIONS() {
  const { OPTIONS } = await import("../route");
  return OPTIONS();
}

describe("CSP Report API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console mocks
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/csp-report", () => {
    const validCSPReport = {
      "csp-report": {
        "document-uri": "https://example.com/page",
        referrer: "https://example.com",
        "violated-directive": "script-src",
        "effective-directive": "script-src",
        "original-policy": "default-src 'self'; script-src 'self'",
        disposition: "enforce",
        "blocked-uri": "https://malicious.com/script.js",
        "line-number": 42,
        "column-number": 10,
        "source-file": "https://example.com/page",
        "status-code": 200,
        "script-sample": 'eval("malicious code")',
      },
    };

    it("应该成功处理有效的CSP报告", async () => {
      const request = new NextRequest("http://localhost:3000/api/csp-report", {
        method: "POST",
        body: JSON.stringify(validCSPReport),
        headers: {
          "content-type": "application/csp-report",
          "x-forwarded-for": "127.0.0.1",
        },
      });

      const response = await callPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe("received");
      expect(data.timestamp).toBeDefined();
      expect(console.warn).toHaveBeenCalledWith(
        "CSP Violation Report",
        expect.any(Object),
      );
    });

    it("应该拒绝无效的Content-Type", async () => {
      const request = new NextRequest("http://localhost:3000/api/csp-report", {
        method: "POST",
        body: JSON.stringify(validCSPReport),
        headers: {
          "content-type": "application/json",
        },
      });

      const response = await callPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Unsupported Media Type");
    });

    it("应该处理缺少Content-Type的请求", async () => {
      const request = new NextRequest("http://localhost:3000/api/csp-report", {
        method: "POST",
        body: JSON.stringify(validCSPReport),
      });

      const response = await callPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Unsupported Media Type");
    });

    it("应该处理无效的JSON", async () => {
      const request = new NextRequest("http://localhost:3000/api/csp-report", {
        method: "POST",
        body: "invalid-json",
        headers: {
          "content-type": "application/csp-report",
        },
      });

      const response = await callPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid JSON format");
    });

    it("应该处理缺少csp-report字段的请求", async () => {
      const invalidReport = {
        "not-csp-report": {},
      };

      const request = new NextRequest("http://localhost:3000/api/csp-report", {
        method: "POST",
        body: JSON.stringify(invalidReport),
        headers: {
          "content-type": "application/csp-report",
        },
      });

      const response = await callPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid CSP report format");
    });

    it("应该检测可疑的违规模式", async () => {
      const suspiciousReport = {
        "csp-report": {
          ...validCSPReport["csp-report"],
          "blocked-uri": 'data:text/html,<script>eval("malicious")</script>',
          "script-sample": 'eval("dangerous code")',
        },
      };

      const request = new NextRequest("http://localhost:3000/api/csp-report", {
        method: "POST",
        body: JSON.stringify(suspiciousReport),
        headers: {
          "content-type": "application/csp-report",
          "x-forwarded-for": "192.168.1.100",
        },
      });

      const response = await callPOST(request);

      expect(response.status).toBe(200);
      expect(console.error).toHaveBeenCalledWith(
        "SUSPICIOUS CSP VIOLATION DETECTED",
        expect.objectContaining({
          ip: "[REDACTED_IP]",
          userAgent: null, // 测试环境中user-agent为null
          timestamp: expect.any(String),
          blockedUri: 'data:text/html,<script>eval("malicious")</script>',
          scriptSample: 'eval("dangerous code")',
        }),
      );
    });

    it("应该在开发环境中忽略报告（当CSP_REPORT_URI未设置时）", async () => {
      vi.doMock("@/lib/env", () => ({
        env: {
          NODE_ENV: "development",
          CSP_REPORT_URI: undefined,
        },
      }));
      vi.resetModules();

      const request = new NextRequest("http://localhost:3000/api/csp-report", {
        method: "POST",
        body: JSON.stringify(validCSPReport),
        headers: {
          "content-type": "application/csp-report",
        },
      });

      const response = await callPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe("ignored");

      vi.doUnmock("@/lib/env");
      vi.resetModules();
    });

    it("应该正确提取客户端信息", async () => {
      const request = new NextRequest("http://localhost:3000/api/csp-report", {
        method: "POST",
        body: JSON.stringify(validCSPReport),
        headers: {
          "content-type": "application/csp-report",
          "x-forwarded-for": "203.0.113.1, 192.168.1.1",
          "user-agent": "Mozilla/5.0 (Test Browser)",
          referer: "https://example.com/source",
        },
      });

      await callPOST(request);

      expect(console.warn).toHaveBeenCalledWith(
        "CSP Violation Report",
        expect.objectContaining({
          // PII should be redacted in logs
          ip: "[REDACTED_IP]",
          userAgent: "Mozilla/5.0 (Test Browser)",
        }),
      );
    });

    it("应该处理生产环境的特殊日志记录", async () => {
      vi.doMock("@/lib/env", () => ({
        env: {
          NODE_ENV: "production",
          CSP_REPORT_URI: "https://example.com/csp-report",
        },
      }));
      vi.resetModules();

      const request = new NextRequest("http://localhost:3000/api/csp-report", {
        method: "POST",
        body: JSON.stringify(validCSPReport),
        headers: {
          "content-type": "application/csp-report",
        },
      });

      await callPOST(request);

      // 在生产环境中应该记录到console.error (因为validCSPReport包含可疑内容)
      expect(console.error).toHaveBeenCalledWith(
        "SUSPICIOUS CSP VIOLATION DETECTED",
        expect.any(Object),
      );

      vi.doUnmock("@/lib/env");
      vi.resetModules();
    });

    it("应该检测多种可疑模式", async () => {
      const testCases = [
        { pattern: "eval", field: "script-sample" },
        { pattern: "vbscript:", field: "blocked-uri" },
        { pattern: "onload", field: "script-sample" },
        { pattern: "onerror", field: "blocked-uri" },
        { pattern: "onclick", field: "script-sample" },
      ];

      for (const testCase of testCases) {
        const suspiciousReport = {
          "csp-report": {
            ...validCSPReport["csp-report"],
            [testCase.field]: `some content with ${testCase.pattern} pattern`,
          },
        };

        const request = new NextRequest(
          "http://localhost:3000/api/csp-report",
          {
            method: "POST",
            body: JSON.stringify(suspiciousReport),
            headers: {
              "content-type": "application/csp-report",
            },
          },
        );

        await callPOST(request);

        expect(console.error).toHaveBeenCalledWith(
          "SUSPICIOUS CSP VIOLATION DETECTED",
          expect.any(Object),
        );

        // Clear mocks for next iteration
        vi.clearAllMocks();
        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
      }
    });
  });

  describe("GET /api/csp-report", () => {
    it("应该返回健康检查信息", async () => {
      const response = await callGET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe("CSP report endpoint active");
      expect(data.timestamp).toBeDefined();
    });
  });

  describe("OPTIONS /api/csp-report", () => {
    it("应该返回正确的CORS headers", async () => {
      const response = await callOPTIONS();

      expect(response.status).toBe(200);
      expect(response.headers.get("Allow")).toBe("POST, GET, OPTIONS");
      expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
        "POST, GET, OPTIONS",
      );
      expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
        "Content-Type",
      );
    });
  });

  describe("错误处理", () => {
    it("应该处理请求体解析错误", async () => {
      const request = new NextRequest("http://localhost:3000/api/csp-report", {
        method: "POST",
        body: null,
        headers: {
          "content-type": "application/csp-report",
        },
      });

      const response = await callPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid CSP report format");
      // 空请求体是预期的错误处理，不会记录到error级别
    });

    it("应该处理意外的错误", async () => {
      // Create a request with invalid JSON body to trigger parsing error
      const request = new NextRequest("http://localhost:3000/api/csp-report", {
        method: "POST",
        body: "invalid-json-content",
        headers: {
          "content-type": "application/csp-report",
        },
      });

      const response = await callPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid JSON format");
      // JSON解析错误是预期的错误处理，不会记录到error级别
    });
  });
});
