/**
 * =====================================================================
 * Smart Library System — Icon Mapping (Flow 1)
 * =====================================================================
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';

export type IconName = 
  | 'back'
  | 'filter'
  | 'radio-on'
  | 'radio-off'
  | 'success'
  | 'checked-in'
  | 'qr-code'
  | 'check-in'
  | 'map-tab'
  | 'books-tab'
  | 'myspace-tab'
  | 'notify-tab'
  | 'person'
  | 'search'
  | 'list-view'
  | 'map-view'
  | 'power'
  | 'desktop';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  outline?: boolean; // Used for tab icons (outline when inactive)
}

export const AppIcon: React.FC<IconProps> = ({ name, size = 24, color = '#132455', outline = false }) => {
  switch (name) {
    case 'back':
      return <Ionicons name="arrow-back" size={size} color={color} />;
    case 'filter':
      return <Ionicons name="options-outline" size={size} color={color} />;
    case 'radio-on':
      return <Ionicons name="radio-button-on" size={size} color={color} />;
    case 'radio-off':
      return <Ionicons name="radio-button-off" size={size} color={color} />;
    case 'success':
      return <Ionicons name="checkmark-circle" size={size} color={color} />;
    case 'checked-in':
      return <MaterialCommunityIcons name="party-popper" size={size} color={color} />;
    case 'qr-code':
      return <Ionicons name="qr-code-outline" size={size} color={color} />;
    case 'check-in':
      return <Ionicons name="scan-outline" size={size} color={color} />;
    case 'map-tab':
      return <Ionicons name={outline ? 'map-outline' : 'map'} size={size} color={color} />;
    case 'books-tab':
      return <Ionicons name={outline ? 'book-outline' : 'book'} size={size} color={color} />;
    case 'myspace-tab':
      return <Ionicons name={outline ? 'calendar-outline' : 'calendar'} size={size} color={color} />;
    case 'notify-tab':
      return <Ionicons name={outline ? 'notifications-outline' : 'notifications'} size={size} color={color} />;
    case 'person':
      return <Ionicons name="person" size={size} color={color} />;
    case 'search':
      return <Ionicons name="search" size={size} color={color} />;
    case 'list-view':
      return <Ionicons name="clipboard" size={size} color={color} />;
    case 'map-view':
      return <Ionicons name="map" size={size} color={color} />;
    case 'power':
      return <Ionicons name="flash" size={size} color={color} />;
    case 'desktop':
      return <Ionicons name="desktop" size={size} color={color} />;
    default:
      return null;
  }
};

export const Icons: any = {};
