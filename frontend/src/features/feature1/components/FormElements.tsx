import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { AppIcon } from '../icons';
import { Colors, Spacing, FontSizes, Fonts, Radius } from '@/constants/theme';

interface SlotChipProps {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export const SlotChip: React.FC<SlotChipProps> = ({ label, selected, disabled, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && styles.chipSelected,
        disabled && styles.chipDisabled
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.chipText,
        selected && styles.chipTextSelected,
        disabled && styles.chipTextDisabled
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({ label, value, onValueChange }) => {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
        thumbColor={Colors.light.background}
      />
    </View>
  );
};

interface RadioRowProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const RadioRow: React.FC<RadioRowProps> = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity style={[styles.radioRow, selected && styles.radioRowSelected]} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.radioLabel}>{label}</Text>
      <AppIcon 
        name={selected ? 'radio-on' : 'radio-off'} 
        color={selected ? Colors.light.primary : Colors.light.border} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing[12],
    paddingHorizontal: Spacing[16],
    backgroundColor: Colors.light.background,
    marginRight: Spacing[8],
    marginBottom: Spacing[8],
  },
  chipSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#FFF5F0', // Very light orange tint
  },
  chipDisabled: {
    opacity: 0.5,
    backgroundColor: Colors.light.surface,
  },
  chipText: {
    fontFamily: Fonts.semibold,
    fontSize: FontSizes.base,
    color: Colors.light.text,
  },
  chipTextSelected: {
    color: Colors.light.primary,
  },
  chipTextDisabled: {
    color: Colors.light.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[12],
  },
  toggleLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[16],
    paddingHorizontal: Spacing[16],
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
    marginBottom: Spacing[12],
  },
  radioRowSelected: {
    borderColor: Colors.light.primary,
  },
  radioLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
});
