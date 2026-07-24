import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    emoji: '👋',
    title: 'Welcome to your\ncommunity',
    description:
      'Discover, buy and sell second-hand items with people near you. Give items a second life and help the planet.',
  },
  {
    id: 2,
    emoji: '🏷️',
    title: 'Sell with no\nlisting fees',
    description:
      'List your items for free. Set your price, add photos, and reach local buyers in minutes — no fees to list.',
  },
  {
    id: 3,
    emoji: '📸',
    title: 'Upload your\nfirst item',
    description:
      'Take a photo, write a short description and set a price. Start selling in under a minute.',
  },
];

const WelcomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      const next = currentSlide + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setCurrentSlide(next);
    } else {
      navigation.replace('SearchScreen');
    }
  };

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(index);
  };

  const isLastSlide = currentSlide === SLIDES.length - 1;

  return (
    <SafeScreenContainer>
      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.slideScroll}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <Text style={styles.emoji}>{slide.emoji}</Text>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideDescription}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentSlide && styles.dotActive]} />
        ))}
      </View>

      {/* CTA button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {isLastSlide ? t('Get started') : t('Next')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  slideScroll: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  slideDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6a6a6a',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 20,
    borderRadius: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
});

export default WelcomeScreen;
