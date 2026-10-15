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
  /** Optional element rendered on the right side of the input (e.g. eye/eye-off toggle). */
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  rightElement,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholderTextColor={THEME.colors.muted}
          style={[
            styles.input,
            error ? styles.inputError : null,
            props.multiline ? styles.multiline : null,
            rightElement ? { paddingRight: 48 } : null,
            style
          ]}
          {...props}
        />
        {rightElement && (
          <View style={styles.rightElement}>
            {rightElement}
          </View>
        )}
      </View>
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
  inputWrapper: {
    position: 'relative'
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
  },
  rightElement: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
