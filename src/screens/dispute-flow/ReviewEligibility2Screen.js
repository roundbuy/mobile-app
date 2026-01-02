import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const ReviewEligibility2Screen = ({ navigation, route }) => {
    const { disputeType, problems } = route.params;

    const handleContinue = () => {
        navigation.navigate('DisputeFormScreen', {
            disputeType,
            problems,
        });
    };

    const eligibilityReasons = [
        'Item or transaction not received: the exchange didn\'t take place or the package never arrived if sent',
        'Significantly different: the item is not what was described (e.g. fake brand, missing parts, wrong item)',
        'Damaged items: the item arrived broken or unusable due to shipping',
        'Unauthorized transaction: the buyer didn\'t authorize the transaction or the wrong amount was charged',
        '"Double Charged" & incorrect amount: charged more than once for the same transaction, or the wrong price',
        'Seller communication: the seller is not responding or refusing to resolve an item even after buyer\'s request',
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Dispute</Text>
                    <Text style={styles.headerStep}>1/5</Text>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="document-text-outline" size={48} color="#4169E1" />
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>Buyer-initiated dispute</Text>
                <Text style={styles.subtitle}>Review your eligibility</Text>

                {/* Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Buyer's Refund Eligibility criteria for Buyer Disputes
                    </Text>
                    <Text style={styles.sectionText}>
                        Find out the eligibility reasons for Buyer-to-Buyer disputes.
                    </Text>

                    {/* Eligibility List */}
                    <View style={styles.listContainer}>
                        {eligibilityReasons.map((reason, index) => (
                            <View key={index} style={styles.listItem}>
                                <View style={styles.bullet}>
                                    <View style={styles.bulletDot} />
                                </View>
                                <Text style={styles.listText}>{reason}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.moreInfoLink}>
                        <Text style={styles.moreInfoText}>More information: <Text style={styles.linkText}>click here</Text></Text>
                        <Ionicons name="information-circle-outline" size={18} color="#666" style={styles.infoIcon} />
                    </TouchableOpacity>
                </View>

                {/* Close Link */}
                <TouchableOpacity style={styles.closeLink}>
                    <Text style={styles.closeLinkText}>To close click <Text style={styles.linkText}>here</Text></Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Continue Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    headerStep: {
        fontSize: 14,
        color: '#666',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 24,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        marginBottom: 32,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
        lineHeight: 20,
    },
    sectionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 16,
    },
    listContainer: {
        marginBottom: 16,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    bullet: {
        width: 20,
        paddingTop: 6,
    },
    bulletDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#000',
    },
    listText: {
        flex: 1,
        fontSize: 13,
        color: '#333',
        lineHeight: 18,
    },
    moreInfoLink: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    moreInfoText: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    linkText: {
        color: '#4169E1',
        textDecorationLine: 'underline',
    },
    infoIcon: {
        marginLeft: 4,
    },
    closeLink: {
        marginTop: 16,
    },
    closeLinkText: {
        fontSize: 13,
        color: '#666',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    continueButton: {
        backgroundColor: '#4169E1',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});

export default ReviewEligibility2Screen;
