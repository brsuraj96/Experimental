declare module "ProfileSection" {
  const ProfileSection: React.FC<{
    title: string;
    value: string;
    actionText?: string;
    onActionPress?: () => void;
  }>;
  export default ProfileSection;
}
