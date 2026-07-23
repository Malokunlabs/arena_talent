import Image from "next/image";
import UserAvatar from "@/components/UserAvatar";

interface ProofCardProps {
  rank: number;
  image: string;
  avatar: string;
  name: string;
  description: string;
  onClick?: () => void;
}

export default function ProofCard({
  rank,
  image,
  avatar,
  name,
  description,
  onClick,
}: ProofCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col gap-3 rounded-2xl bg-white p-2 transition-all hover:shadow-md border border-gray-100 hover:border-gray-100 cursor-pointer"
    >
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-xl">
        <Image
          src={image}
          alt={`Proof by ${name}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 font-bold text-primary shadow-sm backdrop-blur-sm">
          {rank}
        </div>
      </div>
      <div className="flex items-start gap-3 px-1 pb-2">
        <UserAvatar name={name} src={avatar || null} size={40} className="border border-gray-100" />
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-gray-900">{name}</span>
          <span className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </span>
        </div>
      </div>
    </div>
  );
}
