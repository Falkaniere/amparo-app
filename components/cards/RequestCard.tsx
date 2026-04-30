import { View, Text, Pressable } from 'react-native';

const SERVICE_LABELS: Record<string, string> = {
  medical: 'Consulta médica',
  errand:  'Farmácia / Banco',
  walk:    'Passeio',
  other:   'Outro serviço',
};

interface Props {
  request: {
    id: string;
    type: string;
    scheduled_at: string;
    duration_hours: number;
    origin_address: string;
    destination_address?: string;
    companion_amount: number;
    origin_lat?: number;
    origin_lng?: number;
  };
  onAccept:  () => void;
  onDecline: () => void;
}

export function RequestCard({ request, onAccept, onDecline }: Props) {
  const date = new Date(request.scheduled_at);
  const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <View className="bg-white border border-border rounded-xl p-3 mb-2">
      {/* Tipo e distância */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-bold text-dark">
          {SERVICE_LABELS[request.type] || 'Serviço'}
        </Text>
        <View className="bg-light rounded px-2 py-0.5">
          <Text className="text-dark text-[10px] font-bold">Perto de você</Text>
        </View>
      </View>

      {/* Detalhes */}
      <View className="gap-1 mb-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-[10px]">📅</Text>
          <Text className="text-xs text-muted">{dateStr} · {timeStr} · {request.duration_hours}h</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-[10px]">📍</Text>
          <Text className="text-xs text-muted" numberOfLines={1}>{request.origin_address}</Text>
        </View>
        {request.destination_address && (
          <View className="flex-row items-center gap-2">
            <Text className="text-[10px]">🏁</Text>
            <Text className="text-xs text-muted" numberOfLines={1}>{request.destination_address}</Text>
          </View>
        )}
      </View>

      {/* Valor e botões */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-primary text-lg font-bold">
            R${request.companion_amount.toFixed(2)}
          </Text>
          <Text className="text-muted text-[10px]">você recebe</Text>
        </View>
        <View className="flex-row gap-2">
          <Pressable
            className="border border-border rounded-lg px-3 py-2 active:opacity-70"
            onPress={onDecline}
          >
            <Text className="text-muted text-xs font-bold">Recusar</Text>
          </Pressable>
          <Pressable
            className="bg-primary rounded-lg px-4 py-2 active:opacity-80"
            onPress={onAccept}
          >
            <Text className="text-white text-xs font-bold">Aceitar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
