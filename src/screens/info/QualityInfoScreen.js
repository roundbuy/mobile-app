import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const QUALITY_LEVELS = [
  {
    key: 'high',
    label: 'High Quality',
    color: '#2E7D32',
    bg: '#F1F8E9',
    icon: 'star',
    description: 'Products that fully meet or exceed expectations, operate reliably, and are built to last.',
    bullets: [
      'Natural or premium materials (leather, solid wood, high-grade steel)',
      'Strong emphasis on repairability and user experience',
      'Higher upfront cost, lower total cost of ownership',
      'Sustainable manufacturing, ethical conditions',
    ],
  },
  {
    key: 'medium',
    label: 'Medium Quality',
    color: '#E65100',
    bg: '#FFF3E0',
    icon: 'star-half',
    description: 'Functional, standard items that get the job done. Affordable, everyday option.',
    bullets: [
      'May lack premium finishes or top-tier durability',
      'Good value for money for everyday use',
      'Standard materials and construction',
    ],
  },
  {
    key: 'low',
    label: 'Low Quality',
    color: '#C62828',
    bg: '#FFEBEE',
    icon: 'star-outline',
    description: 'Items that fall short of basic requirements or break easily.',
    bullets: [
      'Cheapest available materials',
      'Mass-produced with low unit cost',
      'Often need to be replaced more frequently',
    ],
  },
];

const QualityInfoScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quality Guide</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Quality ratings help you find items that match your standards. Sellers grade their own listings — here's what each level means.
        </Text>

        {QUALITY_LEVELS.map((level) => (
          <View key={level.key} style={[styles.card, { borderLeftColor: level.color }]}>
            <View style={[styles.cardHeader, { backgroundColor: level.bg }]}>
              <Ionicons name={level.icon} size={20} color={level.color} />
              <Text style={[styles.cardTitle, { color: level.color }]}>{level.label}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardDesc}>{level.description}</Text>
              {level.bullets.map((b, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Which should I choose?</Text>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>High use items</Text> (shoes, tools, electronics) — invest in high quality
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Trendy or seasonal items</Text> — medium quality may be more practical
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Children's items</Text> prone to loss or rapid growth — low or medium is often better value
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  headerRight: { width: 32 },

  scroll: { padding: 20, paddingBottom: 40 },
  intro: { fontSize: 14, color: '#555', lineHeight: 21, marginBottom: 20 },

  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderLeftWidth: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardBody: { padding: 14, paddingTop: 10 },
  cardDesc: { fontSize: 13, color: '#333', lineHeight: 19, marginBottom: 8 },

  bulletRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  bullet: { fontSize: 13, color: '#888', lineHeight: 19 },
  bulletText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 19 },
  bold: { fontWeight: '700', color: '#333' },

  tipCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  tipTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
});

export default QualityInfoScreen;
