import React, { useState } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const DisputeTypeSelectionScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [selectedType, setSelectedType] = useState(null);

    const disputeTypes = [
        {
            id: 'buyer_initiated',
            title: 'Buyer-initiated Disputes & Issues',
            subtitle: 'This is for all Buyer-initiated Disputes',
            icon: 'people',
        },
        {
            id: 'seller_initiated',
            title: 'Seller-initiated Dispute & Issues',
            subtitle: 'This is for all Seller-initiated Disputes',
            icon: 'people',
        },
        {
            id: 'transaction',
            title: 'Transaction Disputes',
            subtitle: 'This is for both Seller and Buyer-initiated transaction disputes',
            icon: 'swap-horizontal',
        },
    ];

    const handleContinue = () => {
        if (!selectedType) {
            Alert.alert(t('Selection Required'), t('Please select a dispute type to continue'));
            return;
        }

        navigation.navigate('ProblemSelection', { disputeType: selectedType });
    };

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
                    <Text style={styles.headerTitle}>{t('Dispute an Issue')}</Text>
                    <Text style={styles.headerStep}>1/5</Text>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.instruction}>{t('Choose one, from below:')}</Text>

                {disputeTypes.map((type) => (
                    <TouchableOpacity
                        key={type.id}
                        style={[
                            styles.typeCard,
                            selectedType === type.id && styles.typeCardSelected,
                        ]}
                        onPress={() => setSelectedType(type.id)}
                    >
                        <View style={styles.typeIcon}>
                            <Ionicons name={type.icon} size={24} color="#000" />
                        </View>
                        <View style={styles.typeContent}>
                            <Text style={styles.typeTitle}>{type.title}</Text>
                            <Text style={styles.typeSubtitle}>{type.subtitle}</Text>
                        </View>
                        <View style={styles.checkbox}>
                            {selectedType === type.id ? (
                                <Ionicons name="close" size={20} color="#000" />
                            ) : (
                                <View style={styles.checkboxEmpty} />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Info Link */}
                <TouchableOpacity style={styles.infoLink}>
                    <Text style={styles.infoLinkText}>
                        More information on Disputes & Resolution, <Text style={styles.linkText}>{t('click here')}</Text>
                    </Text>
                    <Ionicons name="information-circle-outline" size={20} color="#666" style={styles.infoIcon} />
                </TouchableOpacity>
            </ScrollView>

            {/* Continue Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        !selectedType && styles.continueButtonDisabled,
                    ]}
                    onPress={handleContinue}
                    disabled={!selectedType}
                >
                    <Text style={styles.continueButtonText}>{t('Continue')}</Text>
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
    instruction: {
        fontSize: 14,
        color: '#000',
        marginBottom: 20,
    },
    typeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFF',
        marginBottom: 16,
    },
    typeCardSelected: {
        borderColor: '#4169E1',
        backgroundColor: '#F0F7FF',
    },
    typeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    typeContent: {
        flex: 1,
    },
    typeTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    typeSubtitle: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#CCC',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    checkboxEmpty: {
        width: 16,
        height: 16,
        borderRadius: 2,
        backgroundColor: 'transparent',
    },
    infoLink: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    infoLinkText: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    linkText: {
        color: '#4169E1',
        textDecorationLine: 'underline',
    },
    infoIcon: {
        marginLeft: 8,
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
    continueButtonDisabled: {
        backgroundColor: '#CCC',
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});

export default DisputeTypeSelectionScreen;
