import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>PVC conduit bend</CardTitle>
        <CardDescription>
          Factory-made bends for distributor inventory.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Common sizes, export packaging, and batch traceability are available.
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Export-ready fittings</CardTitle>
        <CardDescription>
          Review specs before confirming sample shipment.
        </CardDescription>
        <CardAction>
          <Badge variant="secondary">Ready</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>16-168 mm range</li>
          <li>OEM packaging support</li>
          <li>Batch traceability</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button size="sm">Request specs</Button>
      </CardFooter>
    </Card>
  ),
};

export const LongChineseContent: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>出口级 PVC 电工套管弯头</CardTitle>
        <CardDescription>
          用于检查中文标题、描述和按钮组合在卡片中的换行表现。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          支持样品确认、批次追溯、出口包装和经销商常用规格组合。
        </p>
      </CardContent>
    </Card>
  ),
};
