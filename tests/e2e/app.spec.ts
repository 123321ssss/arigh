import { expect, test } from "@playwright/test";

test("member workspace streams a demo reply", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "以成员身份进入" }).click();
  await page.waitForURL("**/app");

  await page.getByRole("link", { name: /AI 网关上线清单/i }).click();
  await page.waitForURL("**/app/c/**");

  await page.getByPlaceholder("输入一个成员可执行任务").fill("请帮我生成一次演示回复");
  await page.getByRole("button", { name: "发送任务" }).click();

  await expect(page.getByText("已切换到本地演示流")).toBeVisible();
  await expect(page.getByText("执行轨迹")).toBeVisible();
});

test("admin console shows members and usage", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "以管理员身份进入" }).click();
  await page.waitForURL("**/admin");

  await expect(page.getByText("管理员总览")).toBeVisible();
  await page.getByRole("link", { name: "成员", exact: true }).click();
  await expect(page.getByText("成员表")).toBeVisible();
  await page.getByRole("link", { name: "用量", exact: true }).click();
  await expect(page.getByText("每日成本走势")).toBeVisible();
});
