import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../../context/TranslationContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
    {
        id: 'buyer',
        addressedTo: 'Resolution Recommendation to the Buyer to end the Dispute (C2C): Buyer Dispute',
        preamble: 'Reasons for Buyer Disputes\nFind out the eligibility reasons for Buyer-to-Buyer disputes.',
        bullets: [
            'Case A: lorum ipsum lorum ipsum lorum ipsum lorum ipsum lorum ipsum',
            'Case B: lorum ipsum lorum ipsum lorum ipsum lorum',
            'Case C: lorum ipsum lorum ipsum lorum ipsum lorum ipsum lorum ipsum lorum ipsum',
            'Case D: lorum ipsum lorum ipsum lorum ipsum lorum ipsum',
            'Case E: lorum ipsum lorum ipsum lorum ipsum lorum ipsum lorum ipsum',
        ],
    },
    {
        id: 'seller',
        addressedTo: 'Resolution Recommendation to the Seller to end the Dispute (C2C): Seller Dispute',
        preamble: 'Reasons for Buyer Disputes\nFind out the eligibility reasons for Buyer-to-Seller disputes.',
        bullets: [
            'Case A: lorum ipsum lorum ipsum lorum ipsum lorum ipsum lorum ipsum',
            'Case B: lorum ipsum lorum ipsum lorum ipsum lorum',
            'Case C: lorum ipsum lorum ipsum lorum ipsum lorum ipsum lorum ipsum lorum ipsum',
            'Case D: lorum ipsum lorum ipsum lorum ipsum lorum ipsum',
            'Case E: lorum ipsum lorum ipsum lorum ipsum lorum ipsum lorum ipsum',
        ],
    },
];

const ResolutionRecommendationScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { dispute } = route.params || {};
    const flatRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleScroll = (event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        setCurrentIndex(index);
    };

    const handleContinue = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            // Last slide - go back to DisputeDetail (Resolution Status Option Screen)
            navigation.goBack();
        }
    };

    const renderSlide = ({ item }) => (
        <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            {/* Icon */}
            <View style={styles.iconCenter}>
                <View style={styles.iconWrap}>
                    <MaterialCommunityIcons name="clipboard-text-outline" size={60} color="#000" />
                    <View style={styles.checkBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#000" />
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.slideScroll}>
                <Text style={styles.addressedTo}>{item.addressedTo}</Text>
                
                <Text style={styles.preamble}>{item.preamble}</Text>

                {item.bullets.map((b, i) => (
                    <View key={i} style={styles.bulletRow}>
                        <Text style={styles.bulletDot}>{'- '}</Text>
                        <Text style={styles.bulletText}>{b}</Text>
                    </View>
                ))}
                
                <View style={{ height: 30 }} />
            </ScrollView>

            <View style={styles.slideFooter}>
                <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
                    <Text style={styles.continueBtnText}>{currentIndex === SLIDES.length - 1 ? t('Continue') : t('Continue')}</Text>
                </TouchableOpacity>
                <View style={styles.moreRow}>
                    <Text style={styles.moreLinkText}>
                        {t('More on ')}<Text style={styles.moreLinkHighlight}>{t('Dispute Resolution')}</Text>
                    </Text>
                    <Ionicons name="information-circle-outline" size={20} color="#808080" style={{ marginLeft: 6 }} />
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerTitleWrap}>
                    <Text style={styles.headerTop}>
                        {dispute ? `Dispute #${dispute.dispute_number}` : t('Dispute')}
                    </Text>
                    <Text style={styles.headerBottom}>
                        {t('Resolution Recommendation')}
                    </Text>
                </View>
                <View style={{ width: 32 }} />
            </View>

            <FlatList
                ref={flatRef}
                data={SLIDES}
                renderItem={renderSlide}
                keyExtractor={item => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: { padding: 4 },
    headerTitleWrap: { flex: 1, alignItems: 'center' },
    headerTop: { fontSize: 18, fontWeight: '700', color: '#000' },
    headerBottom: { fontSize: 16, fontWeight: '700', color: '#000' },

    slide: { paddingHorizontal: 30, flex: 1 },
    slideScroll: { flex: 1 },

    iconCenter: { alignItems: 'center', marginVertical: 20 },
    iconWrap: { position: 'relative' },
    checkBadge: { position: 'absolute', bottom: -2, right: -6 },

    addressedTo: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 20, textAlign: 'left', lineHeight: 22 },
    preamble: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 15, lineHeight: 20 },

    bulletRow: { flexDirection: 'row', marginBottom: 12 },
    bulletDot: { fontSize: 15, color: '#333' },
    bulletText: { fontSize: 15, color: '#333', flex: 1, lineHeight: 22 },

    slideFooter: { alignItems: 'center', paddingBottom: 20 },
    continueBtn: {
        backgroundColor: '#F5F5F5',
        borderRadius: 32,
        width: '100%',
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: 15,
    },
    continueBtnText: { fontSize: 18, fontWeight: '600', color: '#000' },
    moreRow: { flexDirection: 'row', alignItems: 'center' },
    moreLinkText: { fontSize: 13, color: '#000' },
    moreLinkHighlight: { color: '#1A4FDB', textDecorationLine: 'underline' },
});

export default ResolutionRecommendationScreen;
