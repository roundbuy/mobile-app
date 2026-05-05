import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const ProductInfoModal = ({ visible, onClose, title, content }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>{title}</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color="#505050" />
                                </TouchableOpacity>
                            </View>

                            {/* Content */}
                            <ScrollView
                                style={styles.content}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                showsVerticalScrollIndicator={true}
                                bounces={true}
                            >
                                {content.split('**').map((part, index) => {
                                    if (index % 2 !== 0) {
                                        // Odd indexes are the parts inside the asterisks
                                        return <Text key={index} style={[styles.contentText, { fontWeight: 'bold' }]}>{part}</Text>;
                                    }
                                    return <Text key={index} style={styles.contentText}>{part}</Text>;
                                })}
                            </ScrollView>

                            {/* Close Button */}
                            <TouchableOpacity style={styles.okButton} onPress={onClose}>
                                <Text style={styles.okButtonText}>Got it</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        maxHeight: '90%', // Expand allowable screen usage
        flexShrink: 1, // Allow the container to shrink to fit screen if needed
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
        // Removed the hardcoded 400 maxHeight so the View flexes correctly inside the 90% screen height constraint
    },
    contentText: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
    },
    okButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        margin: 20,
        marginTop: 10,
    },
    okButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default ProductInfoModal;
