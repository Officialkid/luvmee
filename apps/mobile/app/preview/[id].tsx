import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, RefreshCw } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { getTemplateById, interpolatePlaceholders } from '@luvmee/shared';

export default function MobilePreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const template = getTemplateById(id || 'playful-yes-no') || getTemplateById('playful-yes-no')!;
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });

  const scenes = template.defaultConfig.scenes;
  const currentScene = scenes[currentSceneIdx] || scenes[0];

  const t = (text?: string) =>
    interpolatePlaceholders(text, 'Daniel', 'Alikah');

  const handleNext = () => {
    if (currentSceneIdx < scenes.length - 1) {
      setCurrentSceneIdx((prev: number) => prev + 1);
    }
  };

  const handleNoDodge = () => {
    const randX = (Math.random() * 2 - 1) * 80;
    const randY = (Math.random() * 2 - 1) * 40;
    setNoPosition({ x: randX, y: randY });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.previewTag}>
          <Text style={styles.previewTagText}>Live Recipient Preview</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={18} color={THEME.colors.burgundy} />
        </TouchableOpacity>
      </View>

      <View style={styles.stage}>
        <Card style={styles.previewCard}>
          {currentScene.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t(currentScene.badge)}</Text>
            </View>
          )}

          <Text style={styles.title}>{t(currentScene.title)}</Text>

          {currentScene.subtitle && (
            <Text style={styles.subtitle}>{t(currentScene.subtitle)}</Text>
          )}

          {currentScene.bodyText && (
            <Text style={styles.body}>{t(currentScene.bodyText)}</Text>
          )}

          {currentScene.interaction.type === 'evasive_no' ? (
            <View style={styles.evasiveArena}>
              <Button
                title={currentScene.interaction.primaryButtonText || 'YES ❤️'}
                onPress={handleNext}
                size="sm"
              />
              <TouchableOpacity
                onPress={handleNoDodge}
                style={[
                  styles.noBtn,
                  { transform: [{ translateX: noPosition.x }, { translateY: noPosition.y }] }
                ]}
              >
                <Text style={styles.noBtnText}>
                  {currentScene.interaction.secondaryButtonText || 'NO 🙄'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : currentSceneIdx === scenes.length - 1 ? (
            <Button
              title="Replay Experience ↺"
              variant="outline"
              onPress={() => setCurrentSceneIdx(0)}
            />
          ) : (
            <Button
              title={currentScene.interaction.primaryButtonText || 'Continue ✨'}
              onPress={handleNext}
            />
          )}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.blush,
    padding: 20
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  previewTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: THEME.radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  previewTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.rose
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  stage: {
    flex: 1,
    justifyContent: 'center'
  },
  previewCard: {
    padding: 24,
    alignItems: 'center',
    textAlign: 'center'
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.blush,
    marginBottom: 12
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.rose,
    textTransform: 'uppercase'
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.colors.burgundy,
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.rose,
    textAlign: 'center',
    marginBottom: 10
  },
  body: {
    fontSize: 14,
    color: THEME.colors.burgundySoft,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20
  },
  evasiveArena: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 100,
    width: '100%'
  },
  noBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: THEME.radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  noBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.burgundy
  }
});
