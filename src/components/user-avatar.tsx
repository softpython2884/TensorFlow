"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/lib/types"

interface UserAvatarProps {
  user: Pick<User, "name" | "avatarUrl" | "email">;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const getInitials = (name: string) => {
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const initials = user.name ? getInitials(user.name) : user.email.substring(0,2).toUpperCase();

  return (
    <Avatar className={className}>
      <AvatarImage src={user.avatarUrl} alt={user.name || user.email} data-ai-hint="profile person" />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}
