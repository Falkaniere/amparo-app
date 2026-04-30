import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function AmparoLogo({ size = 40, color = '#1D9E75' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path
        d="M20 5C11 5 5 11.5 5 18.5C5 27 11 31.5 20 38C29 31.5 35 27 35 18.5C35 11.5 29 5 20 5Z"
        fill={color}
        opacity={0.9}
      />
      <Circle
        cx={20}
        cy={18.5}
        r={4.5}
        fill={color === 'white' ? '#1D9E75' : '#fff'}
      />
    </Svg>
  );
}
