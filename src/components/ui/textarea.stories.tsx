import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    placeholder: "Tell us your target market, sizes, and expected quantity.",
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[360px] space-y-2">
      <Label htmlFor="storybook-message">Message</Label>
      <Textarea
        id="storybook-message"
        placeholder="Tell us your target market, sizes, and expected quantity."
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Submitting inquiry...",
  },
};

export const LongChineseContent: Story = {
  render: () => (
    <div className="w-[360px] space-y-2">
      <Label htmlFor="storybook-zh-message">询盘说明</Label>
      <Textarea
        id="storybook-zh-message"
        defaultValue="我们需要确认 PVC 电工套管弯头的常用规格、出口包装方式、样品发货时间以及是否支持经销商长期采购。"
      />
    </div>
  ),
};
