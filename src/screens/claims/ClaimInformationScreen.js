import React from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const ClaimInformationScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { dispute } = route.params || {};

    const handleNext = () => {
        navigation.navigate('CreateClaim', { dispute });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerBackButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Claims')}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content}>
                {/* Claim Folder Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconWrapper}>
                        <View style={styles.folderIconContainer}>
                            <FontAwesome5 name="file-contract" size={60} color="#505050" />
                            <View style={styles.claimBadge}>
                                <Text style={styles.claimBadgeText}>CLAIM</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.titleLeft}>{t('Resolution Recommendation')}</Text>

                {/* Information List */}
                <View style={styles.infoSection}>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t('Resolution Recommendation to the Buyer to end the (C2C) Transaction Dispute')}</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t('For Disputes')}</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t('Eligibility reasons for Buyer-to-Buyer disputes:')}</Text>
                    </View>
                    <View style={[styles.bulletPoint, { marginTop: 10 }]}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t('Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum')}</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t('Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum')}</Text>
                    </View>
                </View>

                {/* Progress Dots (Optional if multi-slide, current design shows 4 dots) */}
                <View style={styles.progressContainer}>
                    <View key="dot-1" style={[styles.dot, styles.dotActive]} />
                    <View key="dot-2" style={styles.dot} />
                    <View key="dot-3" style={styles.dot} />
                    <View key="dot-4" style={styles.dot} />
                </View>

                {/* Close Button / Next */}
                <TouchableOpacity style={styles.readMoreButton} onPress={handleNext}>
                    <Text style={styles.readMoreText}>{t('Close')}</Text>
                </TouchableOpacity>

                {/* Footer Link */}
                <View style={styles.footerInfoLink}>
                    <Text style={styles.footerLinkText}>
                        More on{' '}
                        <Text style={styles.footerLinkHighlight}>{t('Claim Resolution')}</Text>
                    </Text>
                    <Ionicons name="information-circle-outline" size={20} color="#505050" style={styles.footerIcon} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerBackButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    iconContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    folderIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    claimBadge: {
        position: 'absolute',
        bottom: 25,
        backgroundColor: '#FFF',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#505050',
    },
    claimBadgeText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#505050',
    },
    titleLeft: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        textAlign: 'left',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    infoSection: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    bullet: {
        fontSize: 16,
        color: '#505050',
        marginRight: 8,
        marginTop: 2,
    },
    bulletText: {
        flex: 1,
        fontSize: 14,
        color: '#505050',
        lineHeight: 20,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#CCC',
    },
    dotActive: {
        backgroundColor: '#505050',
    },
    readMoreButton: {
        backgroundColor: '#F8F8F8',
        paddingVertical: 14,
        paddingHorizontal: 80,
        borderRadius: 24,
        alignSelf: 'center',
        marginBottom: 16,
    },
    readMoreText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    footerInfoLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    footerLinkText: {
        fontSize: 12,
        color: '#303234',
    },
    footerLinkHighlight: {
        color: '#003366',
        textDecorationLine: 'underline',
    },
    footerIcon: {
        marginLeft: 6,
    },
});

export default ClaimInformationScreen;
