type BrandLogoProps = {
  className?: string;
};

export default function BrandLogo({ className }: BrandLogoProps) {
  return (
    <img
      src="/logo.svg"
      alt="跨界简历"
      className={`shrink-0 ${className ?? ""}`}
    />
  );
}
