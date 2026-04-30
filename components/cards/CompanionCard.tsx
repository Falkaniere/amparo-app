import { View, Text, Pressable } from 'react-native';

interface Props {
  companion: {
    id: string;
    hourly_rate: number;
    avg_rating: number;
    total_services: number;
    distance_km: number;
    bio?: string;
  };
  onPress: () => void;
}

// Gera iniciais a partir do user_id para placeholder
function getInitials(id: string) {
  return id.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ['#E1F5EE', '#EEEDFE', '#FAEEDA', '#FCEBEB'];
const TEXT_COLORS   = ['#085041', '#3C3489', '#633806', '#712B13'];

export function CompanionCard({ companion, onPress }: Props) {
  const colorIdx = companion.id.charCodeAt(0) % AVATAR_COLORS.length;

  return (
    <Pressable
      className="bg-white border border-border rounded-xl p-3 mb-2 flex-row items-center gap-3 active:opacity-80"
      onPress={onPress}
    >
      {/* Avatar */}
      <View
        className="w-10 h-10 rounded-full items-center justify-center flex-shrink-0"
        style={{ backgroundColor: AVATAR_COLORS[colorIdx] }}
      >
        <Text className="text-xs font-bold" style={{ color: TEXT_COLORS[colorIdx] }}>
          {getInitials(companion.id)}
        </Text>
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-sm font-bold text-dark">Acompanhante</Text>
        <View className="flex-row items-center gap-1 mt-0.5">
          <Text className="text-amber text-xs font-bold">★ {companion.avg_rating.toFixed(1)}</Text>
          <Text className="text-muted text-[10px]">· {companion.total_services} serviços</Text>
        </View>
        <View className="flex-row items-center gap-2 mt-1">
          <View className="bg-light rounded px-1.5 py-0.5">
            <Text className="text-dark text-[9px] font-bold">Disponível</Text>
          </View>
          <Text className="text-muted text-[10px]">{companion.distance_km} km</Text>
        </View>
      </View>

      {/* Preço */}
      <View className="items-end">
        <Text className="text-primary text-base font-bold">R${companion.hourly_rate}</Text>
        <Text className="text-muted text-[10px]">/hora</Text>
      </View>
    </Pressable>
  );
}
