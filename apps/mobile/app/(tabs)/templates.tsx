import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sparkles, ArrowRight, Eye } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Card } from '../../components/Card';
import { STARTER_TEMPLATES, TemplateCategory } from '@luvmee/shared';

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'all', label: 'All Templates' },
  { key: 'playful_questions', label: 'Playful Questions' },
  { key: 'love_letters', label: 'Love Letters' },
  { key: 'confessions', label: 'Confessions' },
  { key: 'anniversaries', label: 'Anniversaries' },
  { key: 'birthday_surprises', label: 'Birthdays' },
  { key: 'appreciation', label: 'Appreciation' }
];

export default function TemplatesScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = selectedCategory === 'all'
    ? STARTER_TEMPLATES
    : STARTER_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Template Gallery</Text>
        <Text style={styles.headerSubtitle}>Choose a starter romantic experience</Text>
      </View>

      {/* Category Pills Scroll */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setSelectedCategory(cat.key)}
                style={[styles.catPill, isSelected && styles.catPillActive]}
              >
                <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Templates List */}
      <ScrollView contentContainerStyle={styles.templatesList}>
        {filteredTemplates.map((template) => (
          <Card key={template.id} style={styles.templateCard}>
            <View style={styles.topRow}>
              <View style={styles.emojiCircle}>
                <Text style={{ fontSize: 26 }}>{template.previewEmoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateOccasion}>{template.occasion}</Text>
              </View>
            </View>

            <Text style={styles.templateDesc}>{template.description}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.previewBtn}
                onPress={() => router.push(`/preview/${template.id}`)}
              >
                <Eye size={15} color={THEME.colors.burgundy} />
                <Text style={styles.previewBtnText}>Preview</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.useBtn}
                onPress={() => router.push(`/editor/${template.id}`)}
              >
                <Text style={styles.useBtnText}>Use Template</Text>
                <ArrowRight size={15} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.blush
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.colors.burgundy
  },
  headerSubtitle: {
    fontSize: 13,
    color: THEME.colors.burgundySoft,
    marginTop: 2
  },
  categoriesWrapper: {
    marginBottom: 10
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 8
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 117, 0.2)'
  },
  catPillActive: {
    backgroundColor: THEME.colors.rose,
    borderColor: THEME.colors.rose
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.burgundy
  },
  catPillTextActive: {
    color: '#FFFFFF'
  },
  templatesList: {
    padding: 20,
    paddingTop: 6
  },
  templateCard: {
    padding: 18,
    marginBottom: 14
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10
  },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.blush,
    alignItems: 'center',
    justifyContent: 'center'
  },
  templateName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.burgundy
  },
  templateOccasion: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.rose
  },
  templateDesc: {
    fontSize: 13,
    color: THEME.colors.burgundySoft,
    lineHeight: 18,
    marginBottom: 16
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end'
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.blush
  },
  previewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.burgundy
  },
  useBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.rose
  },
  useBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
