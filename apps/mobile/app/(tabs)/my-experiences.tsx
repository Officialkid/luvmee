import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Heart,
  Plus,
  Share2,
  Copy,
  Trash2,
  CopyCheck,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  Clock,
  Sparkles,
  Pencil,
  Lock
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Experience, ExperienceStatus, buildRecipientExperienceUrl } from '@luvmee/shared';
import { experienceService } from '../../services/experienceService';
import { supabase } from '../../services/supabase';

export default function MyExperiencesScreen() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadExperiences = useCallback(async () => {
    try {
      const list = await experienceService.getExperiences();
      setExperiences(list);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExperiences();
    setRefreshing(false);
  };

  const filteredList = experiences.filter((exp) => {
    if (filter === 'all') return true;
    return exp.status === filter;
  });

  const getPublicUrl = (slug: string) => {
    return buildRecipientExperienceUrl(slug, process.env.EXPO_PUBLIC_RECIPIENT_BASE_URL);
  };

  const handleShare = async (exp: Experience) => {
    const url = getPublicUrl(exp.slug);
    try {
      await Share.share({
        message: `I made a romantic surprise for you: ${url}`,
        title: exp.title,
        url: url
      });
    } catch (error: any) {
      Alert.alert('Share Error', error.message);
    }
  };

  const handleCopyLink = async (exp: Experience) => {
    const url = getPublicUrl(exp.slug);
    setCopiedId(exp.id);
    Alert.alert('Link Copied 📋', `Shareable link:\n${url}`);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleTogglePublish = async (exp: Experience) => {
    const willPublish = exp.status !== 'published';

    if (willPublish) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        Alert.alert(
          'Sign In Required 💖',
          'To publish this surprise to the web, please sign in or register first.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => router.push('/(auth)/sign-in') }
          ]
        );
        return;
      }
    }

    Alert.alert(
      willPublish ? 'Publish Experience?' : 'Unpublish Experience?',
      willPublish
        ? 'Anyone with the link will be able to view your surprise.'
        : 'The link will be temporarily inaccessible to the recipient.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: willPublish ? 'Publish' : 'Unpublish',
          onPress: async () => {
            try {
              await experienceService.togglePublish(exp.id);
              await loadExperiences();
            } catch (err: any) {
              Alert.alert('Publishing Error', err?.message || 'Could not update publication state.');
            }
          }
        }
      ]
    );
  };

  const handleDuplicate = async (exp: Experience) => {
    await experienceService.duplicateExperience(exp.id);
    await loadExperiences();
    Alert.alert('Duplicated! ✨', `Created a copy of "${exp.title}" in your drafts.`);
  };

  const handleDelete = (exp: Experience) => {
    Alert.alert(
      'Delete Surprise',
      `Are you sure you want to delete "${exp.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await experienceService.deleteExperience(exp.id);
            await loadExperiences();
          }
        }
      ]
    );
  };

  const openEditorForExperience = (exp: Experience) => {
    router.push({
      pathname: '/editor/[id]',
      params: { id: exp.templateId, experienceId: exp.id }
    } as any);
  };

  const renderExperienceItem = ({ item }: { item: Experience }) => {
    const isPublished = item.status === 'published';
    const isCopied = copiedId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => !isPublished && openEditorForExperience(item)}
      >
        <Card style={styles.card}>
          {/* Top meta row */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.recipientBadge}>
              <Heart size={14} color={THEME.colors.rose} />
              <Text style={styles.recipientText}>For {item.recipientName}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {item.sharingMode === 'partner_exclusive' && (
                <View style={styles.partnerExclusiveBadge}>
                  <Lock size={11} color={THEME.colors.rose} />
                  <Text style={styles.partnerExclusiveText}>Partner Only</Text>
                </View>
              )}
              <TouchableOpacity
                style={[
                  styles.statusBadge,
                  isPublished ? styles.statusPublished : styles.statusDraft
                ]}
                onPress={() => handleTogglePublish(item)}
              >
                {isPublished ? (
                  <CheckCircle2 size={12} color="#166534" />
                ) : (
                  <Clock size={12} color="#854d0e" />
                )}
                <Text
                  style={[
                    styles.statusText,
                    isPublished ? styles.statusTextPublished : styles.statusTextDraft
                  ]}
                >
                  {isPublished ? 'Published' : 'Draft'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Experience Title */}
          <Text style={styles.experienceTitle}>{item.title}</Text>
          <Text style={styles.metaDate}>
            {isPublished && item.publishedAt
              ? `Published on ${new Date(item.publishedAt).toLocaleDateString()}`
              : `Created on ${new Date(item.createdAt).toLocaleDateString()}`}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            {isPublished ? (
              <>
                <TouchableOpacity
                  style={styles.actionBtnPrimary}
                  onPress={() => handleShare(item)}
                >
                  <Share2 size={15} color="#FFFFFF" />
                  <Text style={styles.actionBtnPrimaryText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => handleCopyLink(item)}
                >
                  {isCopied ? (
                    <CopyCheck size={15} color={THEME.colors.rose} />
                  ) : (
                    <Copy size={15} color={THEME.colors.rose} />
                  )}
                  <Text style={styles.actionBtnSecondaryText}>
                    {isCopied ? 'Copied' : 'Link'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={() => openEditorForExperience(item)}
              >
                <Pencil size={15} color="#FFFFFF" />
                <Text style={styles.actionBtnPrimaryText}>Edit</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => router.push(`/preview/${item.templateId}`)}
            >
              <ExternalLink size={15} color={THEME.colors.burgundy} />
              <Text style={styles.actionBtnNeutralText}>Preview</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => handleDuplicate(item)}
            >
              <Sparkles size={15} color={THEME.colors.muted} />
              <Text style={styles.actionBtnMutedText}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnDanger}
              onPress={() => handleDelete(item)}
            >
              <Trash2 size={15} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>YOUR EXPERIENCES</Text>
          <Text style={styles.headerTitle}>My Surprises 💌</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/templates')}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented Filter Control */}
      <View style={styles.filterRow}>
        {(['all', 'published', 'draft'] as const).map((key) => {
          const isActive = filter === key;
          const count =
            key === 'all'
              ? experiences.length
              : experiences.filter((e) => e.status === key).length;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setFilter(key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive
                ]}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Experiences List */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        renderItem={renderExperienceItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.colors.rose]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💝</Text>
            <Text style={styles.emptyTitle}>
              {filter === 'all'
                ? 'No surprises yet'
                : `No ${filter} surprises found`}
            </Text>
            <Text style={styles.emptyBody}>
              Pick a template to create a romantic interactive surprise for someone you cherish.
            </Text>
            <View style={{ width: 200, marginTop: 16 }}>
              <Button
                title="Browse Templates"
                onPress={() => router.push('/(tabs)/templates')}
              />
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.blush
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.rose,
    letterSpacing: 1.2
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.colors.burgundy,
    marginTop: 2
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.rose,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 117, 0.2)'
  },
  filterChipActive: {
    backgroundColor: THEME.colors.rose,
    borderColor: THEME.colors.rose
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.burgundy
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 14
  },
  card: {
    padding: 16,
    borderRadius: 18
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  recipientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(232, 93, 117, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10
  },
  recipientText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.rose
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  statusPublished: {
    backgroundColor: '#DCFCE7'
  },
  statusDraft: {
    backgroundColor: '#FEF9C3'
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700'
  },
  statusTextPublished: {
    color: '#166534'
  },
  statusTextDraft: {
    color: '#854d0e'
  },
  partnerExclusiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(232, 93, 117, 0.1)',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 117, 0.2)'
  },
  partnerExclusiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.rose
  },
  experienceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.burgundy,
    marginBottom: 4
  },
  metaDate: {
    fontSize: 12,
    color: THEME.colors.muted,
    marginBottom: 14
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(232, 93, 117, 0.1)'
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.rose,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(232, 93, 117, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12
  },
  actionBtnSecondaryText: {
    color: THEME.colors.rose,
    fontSize: 12,
    fontWeight: '700'
  },
  actionBtnNeutralText: {
    color: THEME.colors.burgundy,
    fontSize: 12,
    fontWeight: '600'
  },
  actionBtnMutedText: {
    color: THEME.colors.muted,
    fontSize: 12,
    fontWeight: '600'
  },
  actionBtnDanger: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    marginLeft: 'auto'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24
  },
  emptyEmoji: {
    fontSize: 54,
    marginBottom: 12
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.burgundy,
    marginBottom: 6
  },
  emptyBody: {
    fontSize: 14,
    color: THEME.colors.muted,
    textAlign: 'center',
    lineHeight: 20
  }
});
