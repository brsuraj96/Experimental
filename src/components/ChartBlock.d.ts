declare module "ChartBlock" {
  const ChartBlock: React.FC<{
    title: string;
    chartType: "line" | "bar" | "pie";
    data: any;
  }>;
  export default ChartBlock;
}
