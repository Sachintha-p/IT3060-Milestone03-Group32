import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusPill } from './StatusPill';
import { AppIcon } from '../icons';
import { Colors, Spacing, FontSizes, Fonts, Radius } from '@/constants/theme';

export interface SpaceCardProps {
  title: string;
  subtitle: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  amenities?: string[];
  onPress?: () => void;
  children?: React.ReactNode;
}

export const SpaceCard: React.FC<SpaceCardProps> = ({ title, subtitle, status, amenities, onPress, children }) => {
  const content = (
    <>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{title}</Text>
        <StatusPill status={status} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {amenities && amenities.length > 0 && (
          <View style={styles.amenities}>
            {amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Text style={styles.subtitle}> · </Text>
                <AppIcon name={amenity.toLowerCase().includes('power') ? 'power' : 'desktop'} size={14} color={Colors.light.textSecondary} />
                <Text style={styles.subtitle}> {amenity}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      {children && <View style={styles.actions}>{children}</View>}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.card}>{content}</View>;
};

export const ZoneCard: React.FC<SpaceCardProps> = (props) => {
  // A generic wrapper around SpaceCard if needed for zones,
  // or it could be implemented specifically if design diverges.
  return <SpaceCard {...props} />;
};

interface FloorPlanTileProps {
  title: string;
  subtitle: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  onPress?: () => void;
  fullWidth?: boolean;
}

export const FloorPlanTile: React.FC<FloorPlanTileProps> = ({ title, subtitle, status, onPress, fullWidth }) => {
  const getColors = () => {
    switch (status) {
      case 'AVAILABLE':
        return { bg: Colors.light.statusAvailableBg, border: Colors.light.statusAvailableBorder, text: Colors.light.statusAvailableText };
      case 'OCCUPIED':
        return { bg: Colors.light.statusOccupiedBg, border: Colors.light.statusOccupiedBorder, text: Colors.light.statusOccupiedText };
      case 'RESERVED':
        return { bg: Colors.light.statusReservedBg, border: Colors.light.statusReservedBorder, text: Colors.light.statusReservedText };
      default:
        return { bg: Colors.light.surface, border: Colors.light.border, text: Colors.light.text };
    }
  };

  const { bg, border, text } = getColors();

  return (
    <TouchableOpacity 
      style={[styles.tile, { backgroundColor: bg, borderColor: border }, fullWidth && styles.tileFull]} 
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileSubtitle}>{subtitle}</Text>
      <Text style={[styles.tileStatus, { color: text }]}>{status}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderColor: Colors.light.cardBorder,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing[16],
    marginBottom: Spacing[16],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[8],
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: Colors.light.text,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.base,
    color: Colors.light.textSecondary,
  },
  amenities: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    marginTop: Spacing[16],
  },
  tile: {
    width: '48%',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing[16],
    marginBottom: Spacing[16],
  },
  tileFull: {
    width: '100%',
  },
  tileTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.md,
    color: Colors.light.text,
    marginBottom: Spacing[4],
  },
  tileSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing[8],
  },
  tileStatus: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.sm,
  }
});
