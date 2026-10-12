import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle
} from 'react-native';
import { THEME } from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={THEME.colors.muted}
        style={[
          styles.input,
          error ? styles.inputError : null,
          props.multiline ? styles.multiline : null,
          style
        ]}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.burgundy,
    marginBottom: 6,
    letterSpacing: 0.2
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(84, 38, 56, 0.15)',
    borderRadius: THEME.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: THEME.colors.burgundy,
    minHeight: 48
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top'
  },
  inputError: {
    borderColor: '#E63946'
  },
  errorText: {
    color: '#E63946',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600'
  }
});
