import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const DisputeFormScreen = ({ navigation, route }) => {
    const { disputeType, problems } = route.params;

    const [issue, setIssue] = useState('');
    const [amount, setAmount] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');

    const handleContinue = () => {
        if (!issue.trim()) {
            Alert.alert('Required Field', 'Please describe the issue');
            return;
        }

        if (!amount.trim()) {
            Alert.alert('Required Field', 'Please enter the amount');
            return;
        }

        navigation.navigate('UploadEvidenceScreen', {
            disputeType,
            problems,
            formData: {
                issue: issue.trim(),
                amount: amount.trim(),
                additionalInfo: additionalInfo.trim(),
            },
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={28} color="#000" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Dispute</Text>
                        <Text style={styles.headerStep}>5/5</Text>
                    </View>
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Title */}
                    <Text style={styles.title}>Give us the details</Text>
                    <Text style={styles.subtitle}>Tell us about the issue you're having</Text>

                    {/* What's the issue */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>What's the issue?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Fill in!"
                            placeholderTextColor="#999"
                            value={issue}
                            onChangeText={setIssue}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* What's the amount */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>What's the amount?</Text>
                        <View style={styles.amountInputContainer}>
                            <Text style={styles.currencySymbol}>£</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0.00"
                                placeholderTextColor="#999"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>

                    {/* Additional info */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Anything else we should know?</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Fill in!"
                            placeholderTextColor="#999"
                            value={additionalInfo}
                            onChangeText={setAdditionalInfo}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Info Link */}
                    <TouchableOpacity style={styles.infoLink}>
                        <Text style={styles.infoLinkText}>
                            More information on Disputes & Resolution, <Text style={styles.linkText}>click here</Text>
                        </Text>
                        <Ionicons name="information-circle-outline" size={20} color="#666" style={styles.infoIcon} />
                    </TouchableOpacity>
                </ScrollView>

                {/* Continue Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            (!issue.trim() || !amount.trim()) && styles.continueButtonDisabled,
                        ]}
                        onPress={handleContinue}
                        disabled={!issue.trim() || !amount.trim()}
                    >
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    keyboardView: {
        flex: 1,
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
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#000',
        backgroundColor: '#FAFAFA',
    },
    textArea: {
        minHeight: 100,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
        paddingHorizontal: 12,
    },
    currencySymbol: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
        color: '#000',
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

export default DisputeFormScreen;
