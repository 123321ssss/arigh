import * as Avatar from "@radix-ui/react-avatar";

export function AvatarChip({
  image,
  fallback,
}: {
  image?: string;
  fallback: string;
}) {
  return (
    <Avatar.Root className="relative inline-flex h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[rgba(19,31,30,0.12)] bg-[rgba(19,31,30,0.08)]">
      {image ? <Avatar.Image className="h-full w-full object-cover" src={image} alt={fallback} /> : null}
      <Avatar.Fallback className="flex h-full w-full items-center justify-center text-sm font-semibold text-[var(--ink-strong)]">
        {fallback}
      </Avatar.Fallback>
    </Avatar.Root>
  );
}
