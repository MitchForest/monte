import type { Component, JSX } from 'solid-js';
import { splitProps } from 'solid-js';

import { cx } from '../utils/cx';

const buildDicebearUrl = (seed: string, background: string) =>
  `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${background.replace('#', '')}&radius=50`;

export interface ProfileAvatarProps extends JSX.ImgHTMLAttributes<HTMLImageElement> {
  seed: string;
  size?: number;
  backgroundHex?: string;
  statusColor?: string;
}

export const ProfileAvatar: Component<ProfileAvatarProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'seed', 'size', 'backgroundHex', 'statusColor']);
  const size = local.size ?? 72;
  const background = local.backgroundHex ?? '#F4FAFC';
  const statusColor = local.statusColor ?? '#18BF97';

  return (
    <span
      class={cx('relative inline-flex shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.6)] p-1 shadow-ambient', local.class)}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <img
        src={buildDicebearUrl(local.seed, background)}
        alt="Student avatar"
        class="h-full w-full rounded-full object-cover"
        {...rest}
      />
      <span
        class="absolute -bottom-0.5 right-1 h-3.5 w-3.5 rounded-full border-2 border-white"
        style={{ background: statusColor }}
      />
    </span>
  );
};

export default ProfileAvatar;
