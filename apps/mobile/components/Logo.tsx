import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

export type LogoVariant = 'stacked' | 'horizontal' | 'symbol';

interface LogoProps {
  variant?: LogoVariant;
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  width,
  height,
  style
}) => {
  let source;
  let defaultWidth = 160;
  let defaultHeight = 44;

  if (variant === 'stacked') {
    source = require('../assets/logo-stacked.png');
    defaultWidth = 140;
    defaultHeight = 110;
  } else if (variant === 'symbol') {
    source = require('../assets/logo-symbol.png');
    defaultWidth = 64;
    defaultHeight = 54;
  } else {
    // horizontal
    source = require('../assets/logo-horizontal.png');
    defaultWidth = 165;
    defaultHeight = 45;
  }

  const finalWidth = width || defaultWidth;
  const finalHeight = height || defaultHeight;

  return (
    <Image
      source={source}
      style={[
        {
          width: finalWidth,
          height: finalHeight,
          resizeMode: 'contain'
        },
        style
      ]}
    />
  );
};
