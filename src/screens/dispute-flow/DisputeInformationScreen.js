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

const DisputeInformationScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Dispute information</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="document-text" size={48} color="#4169E1" />
                        <View style={styles.checkmark}>
                            <Ionicons name="checkmark-circle" size={32} color="#32CD32" />
                        </View>
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>DISPUTE RESOLUTION STEPS</Text>

                {/* Steps */}
                <View style={styles.stepsContainer}>
                    <StepItem
                        number="1"
                        title="Contact Seller directly to negotiate an agreement"
                        subtitle="Settle here"
                    />
                    <StepItem
                        number="2"
                        title="Open a Dispute (if Seller Fails)"
                        subtitle="If unable to settle, Issue a Dispute"
                    />
                    <StepItem
                        number="3"
                        title="Escalate to a Claim & Provide Documentation"
                        subtitle="If without agreement, claim"
                    />
                    <StepItem
                        number="4"
                        title="RoundBuy provides Resolution"
                        subtitle="Resolution instructions"
                    />
                    <StepItem
                        number="5"
                        title="RoundBuy closure, Arbitration guidance"
                        subtitle="Continue private arbitration or criminal case"
                    />
                </View>

                {/* Info Link */}
                <TouchableOpacity style={styles.infoLink}>
                    <Text style={styles.infoLinkText}>
                        For more detailed information on Disputes, <Text style={styles.linkText}>click here</Text>
                    </Text>
                </TouchableOpacity>

                {/* No close link */}
                <TouchableOpacity style={styles.noCloseLink}>
                    <Text style={styles.noCloseLinkText}>No close <Text style={styles.linkText}>click here</Text></Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Continue Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => navigation.navigate('DisputeTypeSelection')}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const StepItem = ({ number, title, subtitle }) => (
    <View style={styles.stepItem}>
        <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{number}</Text>
        </View>
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{title}</Text>
            <Text style={styles.stepSubtitle}>{subtitle}</Text>
        </View>
    </View>
);

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
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
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
        position: 'relative',
    },
    checkmark: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: '#FFF',
        borderRadius: 16,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        marginBottom: 24,
        letterSpacing: 0.5,
    },
    stepsContainer: {
        marginBottom: 24,
    },
    stepItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#4169E1',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    stepNumberText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        lineHeight: 20,
        marginBottom: 2,
    },
    stepSubtitle: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    infoLink: {
        marginBottom: 12,
    },
    infoLinkText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    linkText: {
        color: '#4169E1',
        textDecorationLine: 'underline',
    },
    noCloseLink: {
        marginBottom: 24,
    },
    noCloseLinkText: {
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

export default DisputeInformationScreen;
