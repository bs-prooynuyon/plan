import React from 'react';
import { Image } from 'react-native';
import { usePlanim } from '@/context/PlanimContext';

/** Profile photo; falls back to the bundled photo that is also the app icon. */
export function Avatar({ size }: { size: number }) {
  const { settings } = usePlanim();
  return <Image
    source={settings.profilePhoto ? { uri: settings.profilePhoto } : require('@/assets/images/planim-icon.png')}
    style={{ width: size, height: size, borderRadius: size / 2 }}
  />;
}
