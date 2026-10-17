import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { BulletinPost } from '../api/types';
import { colors } from '../theme';

function timeAgo(iso: string): string {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function BulletinBoard({ posts }: { posts: BulletinPost[] }) {
  if (posts.length === 0) return null;

  return (
    <View style={styles.board}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="bullhorn-outline" size={18} color={colors.primary} />
        <Text style={styles.title}>Bulletin board</Text>
      </View>
      {posts.map((post) => (
        <View key={post.id} style={styles.post}>
          <Text style={styles.bank}>
            {post.foodbank_name} <Text style={styles.time}>· {timeAgo(post.created_at)}</Text>
          </Text>
          <Text style={styles.message}>{post.message}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { backgroundColor: colors.primaryLight, borderRadius: 12, padding: 14, marginBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  title: { fontSize: 15, fontWeight: '700', color: colors.primary },
  post: { paddingVertical: 6 },
  bank: { fontSize: 14, fontWeight: '600', color: colors.text },
  time: { fontWeight: '400', color: colors.muted },
  message: { fontSize: 14, color: colors.text, marginTop: 2 },
});
