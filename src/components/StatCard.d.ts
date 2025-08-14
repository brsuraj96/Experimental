declare module "StatCard" {
  const StatCard: React.FC<{
    icon?: React.ReactNode;
    title: string;
    value: string | number;
  }>;

  export default StatCard;
}
