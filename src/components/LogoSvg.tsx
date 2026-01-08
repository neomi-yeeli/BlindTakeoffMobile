import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

type Props = {
  size?: number;
};

export const LogoSvg = ({ size = 120 }: Props) => (
  <Svg width={size} height={(size * 600) / 400} viewBox="0 0 400 600">
    <Path d="M200 550 C120 500 50 400 50 190 L350 190 C350 400 280 500 200 550" fill="none" stroke="#1F242B" strokeWidth="12" />
    <Path d="M200 520 C140 480 80 400 80 230 L320 230 C320 400 260 480 200 520" fill="#556B2F" />
    <Path d="M200 150 L280 320 L220 320 L220 530 L180 530 L180 320 L120 320 Z" fill="#1F242B" />
    <Circle cx="200" cy="450" r="15" fill="#00AEEF" />
    <G transform="translate(100, 70)">
      <Path d="M60 45 L140 45 L160 30 L180 45 L200 45 L200 55 L100 70 L0 55 Z" fill="#1F242B" />
      <Rect x="20" y="40" width="60" height="5" rx="2" fill="#1F242B" />
      <Rect x="120" y="40" width="60" height="5" rx="2" fill="#1F242B" />
    </G>
  </Svg>
);

