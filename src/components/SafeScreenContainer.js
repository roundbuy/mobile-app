import React from 'react';
import { ScrollView, View, StyleSheet, Platform } from 'react-native';
import { LAYOUT, COLORS } from '../constants/theme';

/**
 * SafeScreenContainer - A reusable container component for all app screens
 * 
 * Features:
 * - Makes content scrollable by default
 * - Applies platform-specific safe area padding (iOS vs Android/Web)
 * - Consistent background color
 * - Supports custom styles and additional props
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Screen content to render
 * @param {Object} props.style - Custom style for the container
 * @param {Object} props.contentContainerStyle - Custom style for ScrollView content
 * @param {boolean} props.scrollEnabled - Enable/disable scrolling (default: true)
 * @param {string} props.backgroundColor - Custom background color (default: COLORS.background)
 * @param {Object} props.scrollViewProps - Additional props to pass to ScrollView
 */
const SafeScreenContainer = ({
  children,
  style,
  contentContainerStyle,
  scrollEnabled = true,
  backgroundColor = COLORS.background,
  ...scrollViewProps
}) => {
  // Get platform-specific safe area padding
  const safeAreaPadding = Platform.select({
    ios: LAYOUT.safeArea.ios,
    android: LAYOUT.safeArea.android,
    default: LAYOUT.safeArea.android, // Web uses Android padding
  });

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: safeAreaPadding.paddingTop,
            paddingBottom: safeAreaPadding.paddingBottom,
            paddingLeft: safeAreaPadding.paddingLeft,
            paddingRight: safeAreaPadding.paddingRight,
          },
          contentContainerStyle,
        ]}
        scrollEnabled={Boolean(scrollEnabled)}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default SafeScreenContainer;