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
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const IssueDisputeInfoScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { issueId, issueNumber } = route.params || {};

    const handleNext = () => {
        navigation.navigate('IssueDisputeBuyerReasons', { issueId, issueNumber });
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
                <Text style={styles.headerTitle}>{t('Disputes')}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content}>
                {/* Handshake Icon with Scales */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconWrapper}>
                        <FontAwesome name="balance-scale" size={30} color="#505050" style={styles.balanceIcon} />
                        <FontAwesome name="handshake-o" size={50} color="#505050" />
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.titleLeft}>{t('Roundbuy Resolution Suggestions')}</Text>

                {/* Information List */}
                <View style={styles.infoSection}>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t('Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum')}</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t('Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum')}</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t('Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum')}</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{t('Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum')}</Text>
                    </View>
                </View>

                {/* Progress Dots */}
                <View style={styles.progressContainer}>
                    <View key="dot-1" style={[styles.dot, styles.dotActive]} />
                    <View key="dot-2" style={styles.dot} />
                    <View key="dot-3" style={styles.dot} />
                    <View key="dot-4" style={styles.dot} />
                </View>

                {/* Read More Button */}
                <TouchableOpacity style={styles.readMoreButton} onPress={handleNext}>
                    <Text style={styles.readMoreText}>{t('Read more')}</Text>
                </TouchableOpacity>

                {/* Footer Link */}
                <View style={styles.footerInfoLink}>
                    <Text style={styles.footerLinkText}>
                        More on{' '}
                        <Text style={styles.footerLinkHighlight}>{t('Dispute Resolution')}</Text>
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
        paddingVertical: 32,
        position: 'relative',
    },
    checkmarkBadge: {
        position: 'absolute',
        bottom: 30,
        right: '42%',
        backgroundColor: '#000',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceIcon: {
        marginBottom: -10,
        zIndex: 1,
    },
    titleLeft: {
        fontSize: 16,
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
        paddingHorizontal: 40,
        borderRadius: 24,
        borderWidth: 0,
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

export default IssueDisputeInfoScreen;
