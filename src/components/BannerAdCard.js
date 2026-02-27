import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Dimensions } from 'react-native';

/**
 * BannerAdCard Component
 * Displays banner ads with three sizes: small (2 per row), medium (1 per row), large (2 rows)
 */
const BannerAdCard = ({ banner }) => {
    if (!banner) {
        return null;
    }

    const { image_url, link_url, size, title } = banner;
    const screenWidth = Dimensions.get('window').width;

    const handlePress = async () => {
        if (link_url) {
            try {
                const supported = await Linking.canOpenURL(link_url);
                if (supported) {
                    await Linking.openURL(link_url);
                } else {
                    console.error(`Cannot open URL: ${link_url}`);
                }
            } catch (error) {
                console.error('Error opening banner ad URL:', error);
            }
        }
    };

    // Calculate dimensions based on size
    const getCardStyle = () => {
        switch (size) {
            case 'small':
                // 2 per row - half width minus margins
                return {
                    width: (screenWidth - 120) / 2, // 16px padding on each side + 16px gap
                    height: 180,
                };
            case 'medium':
                // 1 per row - full width minus margins
                return {
                    width: screenWidth - 92, // 16px padding on each side
                    height: 200,
                };
            case 'large':
                // 2 rows - full width, double height
                return {
                    width: screenWidth - 92,
                    height: 440,
                };
            default:
                return {
                    width: screenWidth - 100,
                    height: 200,
                };
        }
    };

    const cardStyle = getCardStyle();

    return (
        <TouchableOpacity
            style={[styles.bannerContainer, cardStyle]}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: image_url }}
                style={styles.bannerImage}
                resizeMode="cover"
            />
            {/* Optional: Add a subtle "Ad" label */}
            <View style={styles.adLabel}>
                <Text style={styles.adLabelText}>Ad</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    bannerContainer: {
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginLeft: 32,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    adLabel: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    adLabelText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
});

export default BannerAdCard;
