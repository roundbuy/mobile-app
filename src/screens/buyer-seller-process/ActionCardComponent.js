import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

// Type metadata for Issue, Dispute, Claim
const TYPE_CONFIG = {
    issue: { icon: 'alert-circle-outline', label: 'ISSUE', color: '#FF9800' },
    dispute: { icon: 'document-text-outline', label: 'DISPUTE', color: '#1A4FDB' },
    claim: { icon: 'shield-checkmark-outline', label: 'CLAIM', color: '#9C27B0' },
};

// Status badge colour mapping
const STATUS_COLOR = {
    open: '#FF9800',
    pending: '#FF9800',
    negotiating: '#1A4FDB',
    seller_responded: '#1A4FDB',
    settled: '#00C853',
    closed: '#808080',
    closed_by_buyer: '#808080',
    escalated_to_dispute: '#9C27B0',
    escalated: '#9C27B0',
    admin_review: '#9C27B0',
    declined: '#505050',
};

const formatStatus = (status) => {
    if (!status) return '';
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const ActionCardComponent = ({ itemImage, userAvatar, itemTitle, username, statusText, stepNumber, actionText, timestamp, onPress, cardType, statusBadge }) => {
    const typeConf = TYPE_CONFIG[cardType] || null;
    const badgeColor = STATUS_COLOR[statusBadge] || '#808080';

    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
            {/* Left section: Image and Avatar */}
            <View style={styles.imageSection}>
                {itemImage ? (
                    <Image source={{ uri: itemImage }} style={styles.productImage} />
                ) : (
                    <View style={[styles.productImage, styles.imagePlaceholder]} />
                )}
                {userAvatar ? (
                    <Image source={{ uri: userAvatar }} style={styles.userAvatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={14} color="#fff" />
                    </View>
                )}
            </View>

            {/* Middle section: Titles and Status */}
            <View style={styles.infoSection}>
                {/* Type badge row */}
                {typeConf && (
                    <View style={styles.typeBadgeRow}>
                        <Ionicons name={typeConf.icon} size={13} color={typeConf.color} />
                        <Text style={[styles.typeBadgeText, { color: typeConf.color }]}>{typeConf.label}</Text>
                    </View>
                )}

                <Text style={styles.itemTitle} numberOfLines={1}>{itemTitle}</Text>
                <Text style={styles.username} numberOfLines={1}>{username}</Text>
                <Text style={styles.statusText} numberOfLines={2}>{statusText}</Text>

                {/* Status badge */}
                {statusBadge && (
                    <View style={[styles.statusBadge, { borderColor: badgeColor }]}>
                        <View style={[styles.statusDot, { backgroundColor: badgeColor }]} />
                        <Text style={[styles.statusBadgeText, { color: badgeColor }]}>
                            {formatStatus(statusBadge)}
                        </Text>
                    </View>
                )}

                <Text style={styles.stepNumber}>{stepNumber}</Text>
            </View>

            {/* Right section: Timestamp and Action Link */}
            <View style={styles.actionSection}>
                <Text style={styles.timestamp}>{timestamp}</Text>
                <Text style={styles.actionPrompt}>{actionText}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    imageSection: {
        width: 70,
        height: 70,
        marginRight: 12,
        position: 'relative',
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    imagePlaceholder: {
        backgroundColor: '#e0e0e0',
    },
    userAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        position: 'absolute',
        bottom: 2,
        right: 2,
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: '#ccc',
    },
    avatarPlaceholder: {
        width: 28,
        height: 28,
        borderRadius: 14,
        position: 'absolute',
        bottom: 2,
        right: 2,
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: '#888',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoSection: {
        flex: 1,
        justifyContent: 'center',
    },
    typeBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    typeBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
        marginLeft: 4,
    },
    itemTitle: {
        fontSize: 14,
        color: '#444',
    },
    username: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 2,
    },
    statusText: {
        fontSize: 13,
        color: '#444',
        marginTop: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginTop: 5,
        alignSelf: 'flex-start',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    stepNumber: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    actionSection: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginLeft: 8,
    },
    timestamp: {
        fontSize: 12,
        color: '#222',
        fontWeight: '500',
    },
    actionPrompt: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});

export default ActionCardComponent;
